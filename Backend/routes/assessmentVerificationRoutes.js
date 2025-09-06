import express from 'express';
import supabase from '../supabaseClient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST: Student verifies assessment completion
router.post('/verify', async (req, res) => {
  try {
    const { assessmentPlanId, studentId, isCompleted, comments } = req.body;

    // Validate required fields
    if (!assessmentPlanId || !studentId || typeof isCompleted !== 'boolean') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if assessment plan exists
    const { data: assessmentPlan, error: planError } = await supabase
      .from('assessment_plans')
      .select('*')
      .eq('id', assessmentPlanId)
      .single();

    if (planError || !assessmentPlan) {
      return res.status(404).json({ error: 'Assessment plan not found' });
    }

    // Check if verification already exists
    const { data: existingVerification, error: checkError } = await supabase
      .from('assessment_verifications')
      .select('*')
      .eq('assessmentPlanId', assessmentPlanId)
      .eq('studentId', studentId)
      .single();

    if (existingVerification) {
      // Update existing verification
      const { data, error } = await supabase
        .from('assessment_verifications')
        .update({
          isCompleted,
          comments,
          verificationDate: new Date().toISOString()
        })
        .eq('id', existingVerification.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating verification:', error);
        return res.status(500).json({ error: 'Failed to update verification' });
      }

      res.json({ 
        message: 'Assessment verification updated successfully',
        data 
      });
    } else {
      // Create new verification
      const { data, error } = await supabase
        .from('assessment_verifications')
        .insert({
          assessmentPlanId,
          studentId,
          isCompleted,
          comments,
          verificationDate: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating verification:', error);
        return res.status(500).json({ error: 'Failed to create verification' });
      }

      res.status(201).json({ 
        message: 'Assessment verification created successfully',
        data 
      });
    }
  } catch (error) {
    console.error('Error in POST /assessment-verification/verify:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get verification status for an assessment plan
router.get('/assessment/:assessmentPlanId', async (req, res) => {
  try {
    const { assessmentPlanId } = req.params;

    const { data, error } = await supabase
      .from('assessment_verifications')
      .select(`
        *,
        students:studentId(enrollmentNumber, name)
      `)
      .eq('assessmentPlanId', assessmentPlanId);

    if (error) {
      console.error('Error fetching verifications:', error);
      return res.status(500).json({ error: 'Failed to fetch verifications' });
    }

    // Calculate verification summary
    const summary = {
      totalStudents: data.length,
      completedCount: data.filter(v => v.isCompleted).length,
      notCompletedCount: data.filter(v => !v.isCompleted).length,
      completionRate: data.length > 0 ? 
        ((data.filter(v => v.isCompleted).length / data.length) * 100).toFixed(2) : 0
    };

    res.json({
      summary,
      verifications: data
    });
  } catch (error) {
    console.error('Error in GET /assessment-verification/assessment/:assessmentPlanId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get student's verification history
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, subjectId, startDate, endDate } = req.query;

    let query = supabase
      .from('assessment_verifications')
      .select(`
        *,
        assessment_plans!inner(
          *,
          subjects:subjectId(name, code),
          faculty:facultyId(name, email)
        )
      `)
      .eq('studentId', studentId)
      .order('verificationDate', { ascending: false });

    // Apply filters
    if (subjectId) {
      query = query.eq('assessment_plans.subjectId', subjectId);
    }
    if (startDate) {
      query = query.gte('assessment_plans.plannedDate', startDate);
    }
    if (endDate) {
      query = query.lte('assessment_plans.plannedDate', endDate);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching student verifications:', error);
      return res.status(500).json({ error: 'Failed to fetch verifications' });
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
    console.error('Error in GET /assessment-verification/student/:studentId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get faculty verification summary
router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { startDate, endDate } = req.query;

    // Get assessment plans for the faculty
    let assessmentQuery = supabase
      .from('assessment_plans')
      .select('id, topic, plannedDate, status')
      .eq('facultyId', facultyId);

    if (startDate) {
      assessmentQuery = assessmentQuery.gte('plannedDate', startDate);
    }
    if (endDate) {
      assessmentQuery = assessmentQuery.lte('plannedDate', endDate);
    }

    const { data: assessmentPlans, error: planError } = await assessmentQuery;

    if (planError) {
      console.error('Error fetching assessment plans:', planError);
      return res.status(500).json({ error: 'Failed to fetch assessment plans' });
    }

    if (!assessmentPlans || assessmentPlans.length === 0) {
      return res.json({
        summary: {
          totalAssessments: 0,
          totalVerifications: 0,
          averageCompletionRate: 0
        },
        assessments: []
      });
    }

    // Get verification data for all assessment plans
    const assessmentIds = assessmentPlans.map(plan => plan.id);
    const { data: verifications, error: verificationError } = await supabase
      .from('assessment_verifications')
      .select('*')
      .in('assessmentPlanId', assessmentIds);

    if (verificationError) {
      console.error('Error fetching verifications:', verificationError);
      return res.status(500).json({ error: 'Failed to fetch verifications' });
    }

    // Calculate summary
    const summary = {
      totalAssessments: assessmentPlans.length,
      totalVerifications: verifications.length,
      averageCompletionRate: verifications.length > 0 ? 
        ((verifications.filter(v => v.isCompleted).length / verifications.length) * 100).toFixed(2) : 0
    };

    // Add verification data to assessment plans
    const assessmentsWithVerifications = assessmentPlans.map(plan => {
      const planVerifications = verifications.filter(v => v.assessmentPlanId === plan.id);
      return {
        ...plan,
        verifications: planVerifications,
        completionRate: planVerifications.length > 0 ? 
          ((planVerifications.filter(v => v.isCompleted).length / planVerifications.length) * 100).toFixed(2) : 0
      };
    });

    res.json({
      summary,
      assessments: assessmentsWithVerifications
    });
  } catch (error) {
    console.error('Error in GET /assessment-verification/faculty/:facultyId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 