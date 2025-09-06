import express from 'express';
import supabase from '../supabaseClient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST: Faculty creates weekly assessment plan
router.post('/create', async (req, res) => {
  try {
    const { facultyId, subjectId, weekStartDate, weekEndDate, assessmentType, topic, description, plannedDate } = req.body;

    // Validate required fields
    if (!facultyId || !subjectId || !weekStartDate || !weekEndDate || !assessmentType || !topic || !plannedDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate assessment type
    const validTypes = ['quiz', 'assignment', 'presentation', 'exam', 'project', 'other'];
    if (!validTypes.includes(assessmentType)) {
      return res.status(400).json({ error: 'Invalid assessment type' });
    }

    // Validate dates
    const startDate = new Date(weekStartDate);
    const endDate = new Date(weekEndDate);
    const planned = new Date(plannedDate);

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Week start date must be before week end date' });
    }

    if (planned < startDate || planned > endDate) {
      return res.status(400).json({ error: 'Planned date must be within the week range' });
    }

    // Create assessment plan
    const { data, error } = await supabase
      .from('assessment_plans')
      .insert({
        facultyId,
        subjectId,
        weekStartDate: startDate.toISOString().split('T')[0],
        weekEndDate: endDate.toISOString().split('T')[0],
        assessmentType,
        topic,
        description,
        plannedDate: planned.toISOString().split('T')[0],
        status: 'planned'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment plan:', error);
      return res.status(500).json({ error: 'Failed to create assessment plan' });
    }

    res.status(201).json({ 
      message: 'Assessment plan created successfully',
      data 
    });
  } catch (error) {
    console.error('Error in POST /assessment-plan/create:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get faculty's assessment plans
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { weekStartDate, weekEndDate, status } = req.query;

    let query = supabase
      .from('assessment_plans')
      .select(`
        *,
        subjects:subjectId(name, code)
      `)
      .eq('facultyId', facultyId)
      .order('plannedDate', { ascending: false });

    // Apply filters
    if (weekStartDate) {
      query = query.gte('weekStartDate', weekStartDate);
    }
    if (weekEndDate) {
      query = query.lte('weekEndDate', weekEndDate);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assessment plans:', error);
      return res.status(500).json({ error: 'Failed to fetch assessment plans' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /assessment-plan/faculty/:facultyId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get assessment plans for a subject
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { weekStartDate, weekEndDate } = req.query;

    let query = supabase
      .from('assessment_plans')
      .select(`
        *,
        faculty:facultyId(name, email)
      `)
      .eq('subjectId', subjectId)
      .order('plannedDate', { ascending: false });

    // Apply filters
    if (weekStartDate) {
      query = query.gte('weekStartDate', weekStartDate);
    }
    if (weekEndDate) {
      query = query.lte('weekEndDate', weekEndDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subject assessment plans:', error);
      return res.status(500).json({ error: 'Failed to fetch assessment plans' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in GET /assessment-plan/subject/:subjectId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update assessment plan status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['planned', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update status
    const { data, error } = await supabase
      .from('assessment_plans')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating assessment plan status:', error);
      return res.status(500).json({ error: 'Failed to update assessment plan status' });
    }

    res.json({ 
      message: 'Assessment plan status updated successfully',
      data 
    });
  } catch (error) {
    console.error('Error in PUT /assessment-plan/:id/status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE: Delete assessment plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are any verifications
    const { data: verifications, error: checkError } = await supabase
      .from('assessment_verifications')
      .select('*')
      .eq('assessmentPlanId', id);

    if (checkError) {
      console.error('Error checking verifications:', checkError);
      return res.status(500).json({ error: 'Failed to check verifications' });
    }

    if (verifications && verifications.length > 0) {
      return res.status(400).json({ error: 'Cannot delete assessment plan with existing verifications' });
    }

    // Delete assessment plan
    const { error } = await supabase
      .from('assessment_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting assessment plan:', error);
      return res.status(500).json({ error: 'Failed to delete assessment plan' });
    }

    res.json({ message: 'Assessment plan deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /assessment-plan/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 