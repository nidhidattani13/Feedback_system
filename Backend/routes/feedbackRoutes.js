import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Validate responses against form questions
function validateResponses(questions, responses) {
  if (!Array.isArray(questions) || typeof responses !== 'object') {
    return false;
  }

  // Check if we have responses for all questions
  const hasAllResponses = questions.every(q => {
    const response = responses[q.id];
    if (response === undefined) return false;

    // Validate response type based on question type
    switch (q.type) {
      case 'short':
      case 'paragraph':
        return typeof response.answer === 'string';
      case 'multiple':
        return q.options.includes(response.answer);
      case 'slider':
        return typeof response.answer === 'number' && 
               response.answer >= q.min && 
               response.answer <= q.max;
      default:
        return false;
    }
  });

  return hasAllResponses;
}

// GET: Get all preset forms
router.get('/presets', async (req, res) => {
  const { data, error } = await supabase
    .from('feedback_form')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST: Save a new preset form
router.post('/preset', async (req, res) => {
  const { title, questions } = req.body;

  const { data, error } = await supabase
    .from('feedback_form')
    .insert({ title, questions, created_by: req.body.created_by })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE: Delete a preset form
router.delete('/preset/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('feedback_form')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Preset form deleted successfully' });
});

// POST: Admin publishes a feedback form
router.post('/form', async (req, res) => {
  try {
    const { title, questions, created_by } = req.body;
    const userId = created_by || 'admin'; // Fallback to 'admin' if no user ID provided

    // Ensure questions is an array
    const questionsArray = Array.isArray(questions) ? questions : [];

    const { data, error } = await supabase
      .from('feedback_form')
      .insert({ 
        title, 
        questions: JSON.stringify(questionsArray),
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save form to database' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get all forms for admin
router.get('/form', async (req, res) => {
  try {
    console.log('Fetching forms from database...');
    const { data, error } = await supabase
      .from('feedback_form')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', error.message);
      return res.status(500).json({ 
        error: 'Failed to fetch forms from database', 
        details: error.message 
      });
    }

    console.log('Raw data from database:', data);

    // Parse questions from JSONB
    const forms = data.map(form => {
      try {
        const parsedQuestions = form.questions ? JSON.parse(form.questions) : [];
        console.log('Parsed questions for form:', parsedQuestions);
        return {
          ...form,
          questions: parsedQuestions
        };
      } catch (parseError) {
        console.error('Error parsing questions for form:', form.id, parseError);
        return {
          ...form,
          questions: []
        };
      }
    });

    console.log('Processed forms:', forms);
    res.json(forms);
  } catch (error) {
    console.error('Error in GET /form route:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// POST: Submit feedback form response
router.post('/form/submit', async (req, res) => {
  try {
    const { formId, responses, studentId } = req.body;

    if (!formId || !responses || !studentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate responses
    const { data: form, error: formError } = await supabase
      .from('feedback_form')
      .select('questions')
      .eq('id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      return res.status(404).json({ error: 'Form not found' });
    }

    const formQuestions = JSON.parse(form.questions);
    console.log('Form questions:', formQuestions);
    console.log('Received responses:', responses);
    
    const isValid = validateResponses(formQuestions, responses);
    console.log('Validation result:', isValid);

    if (!isValid) {
      // Find which question failed validation
      const validationErrors = formQuestions.filter(q => {
        const response = responses[q.id];
        if (response === undefined) return true;
        
        switch (q.type) {
          case 'short':
          case 'paragraph':
            return typeof response.answer !== 'string';
          case 'multiple':
            return !q.options.includes(response.answer);
          case 'slider':
            return typeof response.answer !== 'number' || 
                   response.answer < q.min || 
                   response.answer > q.max;
          default:
            return true;
        }
      });
      
      console.error('Validation failed for questions:', validationErrors);
      return res.status(400).json({ 
        error: 'Invalid responses',
        details: validationErrors.map(q => q.id)
      });
    }

    // Save response
    const { error: saveError } = await supabase
      .from('feedback_response')
      .insert({
        form_id: formId,
        responses: responses,
        student_id: studentId
      });

    if (saveError) {
      console.error('Error saving response:', saveError);
      return res.status(500).json({ error: 'Failed to save response' });
    }

    res.json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error in POST /form/submit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get responses for a specific form
router.get('/form/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('feedback_response')
      .select('*, feedback_form (title)')
      .eq('form_id', id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses:', error);
      return res.status(500).json({ error: 'Failed to fetch responses' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /form/:id/responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Student fetches the latest feedback form
router.get('/form/latest', async (req, res) => {
  const { data, error } = await supabase
    .from('feedback_form')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST: Student submits response to feedback form
router.post('/response', async (req, res) => {
  const { form_id, responses, student_id } = req.body;

  const { data, error } = await supabase
    .from('feedback_response')
    .insert({ form_id, responses, student_id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET: Admin fetches all student responses for a form
router.get('/responses/:form_id', async (req, res) => {
  const { form_id } = req.params;

  const { data, error } = await supabase
    .from('feedback_response')
    .select('*')
    .eq('form_id', form_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
