import express from 'express';
import supabase from '../supabaseClient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST: Submit daily feedback
router.post('/submit', async (req, res) => {
  try {
    const { studentId, subjectId, facultyId, lectureDate, lectureRating, facultyRating, lectureComments, facultyComments } = req.body;

    // Validate required fields
    if (!studentId || !subjectId || !facultyId || !lectureDate || !lectureRating || !facultyRating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate ratings
    if (lectureRating < 1 || lectureRating > 5 || facultyRating < 1 || facultyRating > 5) {
      return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
    }

    // Check if feedback already exists for this student, subject, and date
    const { data: existingFeedback, error: checkError } = await supabase
      .from('daily_feedback')
      .select('*')
      .eq('studentId', studentId)
      .eq('subjectId', subjectId)
      .eq('lectureDate', lectureDate)
      .single();

    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this subject on this date' });
    }

    // Submit feedback
    const { data, error } = await supabase
      .from('daily_feedback')
      .insert({
        studentId,
        subjectId,
        facultyId,
        lectureDate,
        lectureRating,
        facultyRating,
        lectureComments,
        facultyComments,
        isEditable: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting feedback:', error);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }

    res.status(201).json({ 
      message: 'Daily feedback submitted successfully',
      data 
    });
  } catch (error) {
    console.error('Error in POST /daily-feedback/submit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Edit daily feedback (within 24 hours)
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lectureRating, facultyRating, lectureComments, facultyComments } = req.body;

    // Get the feedback to check if it's editable
    const { data: feedback, error: fetchError } = await supabase
      .from('daily_feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if feedback is still editable (within 24 hours)
    const feedbackDate = new Date(feedback.createdAt);
    const currentDate = new Date();
    const hoursDiff = (currentDate - feedbackDate) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(400).json({ error: 'Feedback can only be edited within 24 hours of submission' });
    }

    // Update feedback
    const { data, error } = await supabase
      .from('daily_feedback')
      .update({
        lectureRating,
        facultyRating,
        lectureComments,
        facultyComments,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      return res.status(500).json({ error: 'Failed to update feedback' });
    }

    res.json({ 
      message: 'Feedback updated successfully',
      data 
    });
  } catch (error) {
    console.error('Error in PUT /daily-feedback/edit/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get student's daily feedback history
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, subjectId, startDate, endDate } = req.query;

    let query = supabase
      .from('daily_feedback')
      .select(`
        *,
        subjects:subjectId(name),
        faculty:facultyId(name, email)
      `)
      .eq('studentId', studentId)
      .order('lectureDate', { ascending: false });

    // Apply filters
    if (subjectId) {
      query = query.eq('subjectId', subjectId);
    }
    if (startDate) {
      query = query.gte('lectureDate', startDate);
    }
    if (endDate) {
      query = query.lte('lectureDate', endDate);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /daily-feedback/student/:studentId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get faculty's feedback summary
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('daily_feedback')
      .select('*')
      .eq('facultyId', facultyId);

    if (startDate) {
      query = query.gte('lectureDate', startDate);
    }
    if (endDate) {
      query = query.lte('lectureDate', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching faculty feedback:', error);
      return res.status(500).json({ error: 'Failed to fetch faculty feedback' });
    }

    // Calculate summary statistics
    const summary = {
      totalFeedback: data.length,
      averageLectureRating: data.length > 0 ? 
        (data.reduce((sum, item) => sum + item.lectureRating, 0) / data.length).toFixed(2) : 0,
      averageFacultyRating: data.length > 0 ? 
        (data.reduce((sum, item) => sum + item.facultyRating, 0) / data.length).toFixed(2) : 0,
      ratingDistribution: {
        lecture: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        faculty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    };

    // Calculate rating distribution
    data.forEach(item => {
      summary.ratingDistribution.lecture[item.lectureRating]++;
      summary.ratingDistribution.faculty[item.facultyRating]++;
    });

    res.json({
      summary,
      feedback: data
    });
  } catch (error) {
    console.error('Error in GET /daily-feedback/faculty/:facultyId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get subject feedback summary
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('daily_feedback')
      .select('*')
      .eq('subjectId', subjectId);

    if (startDate) {
      query = query.gte('lectureDate', startDate);
    }
    if (endDate) {
      query = query.lte('lectureDate', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subject feedback:', error);
      return res.status(500).json({ error: 'Failed to fetch subject feedback' });
    }

    // Calculate summary statistics
    const summary = {
      totalFeedback: data.length,
      averageLectureRating: data.length > 0 ? 
        (data.reduce((sum, item) => sum + item.lectureRating, 0) / data.length).toFixed(2) : 0,
      averageFacultyRating: data.length > 0 ? 
        (data.reduce((sum, item) => sum + item.facultyRating, 0) / data.length).toFixed(2) : 0,
      facultyPerformance: {}
    };

    // Calculate faculty performance
    data.forEach(item => {
      if (!summary.facultyPerformance[item.facultyId]) {
        summary.facultyPerformance[item.facultyId] = {
          totalFeedback: 0,
          averageLectureRating: 0,
          averageFacultyRating: 0,
          totalLectureRating: 0,
          totalFacultyRating: 0
        };
      }
      
      summary.facultyPerformance[item.facultyId].totalFeedback++;
      summary.facultyPerformance[item.facultyId].totalLectureRating += item.lectureRating;
      summary.facultyPerformance[item.facultyId].totalFacultyRating += item.facultyRating;
    });

    // Calculate averages for each faculty
    Object.keys(summary.facultyPerformance).forEach(facultyId => {
      const faculty = summary.facultyPerformance[facultyId];
      faculty.averageLectureRating = (faculty.totalLectureRating / faculty.totalFeedback).toFixed(2);
      faculty.averageFacultyRating = (faculty.totalFacultyRating / faculty.totalFeedback).toFixed(2);
    });

    res.json({
      summary,
      feedback: data
    });
  } catch (error) {
    console.error('Error in GET /daily-feedback/subject/:subjectId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 