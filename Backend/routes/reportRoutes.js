import express from 'express';
import supabase from '../supabaseClient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendMonthlyReportEmail } from '../services/emailService.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET: Generate monthly report for a specific class/subject
router.get('/monthly/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { month, year } = req.query;

    // Validate month and year
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get daily feedback for the month
    const { data: dailyFeedback, error: feedbackError } = await supabase
      .from('daily_feedback')
      .select(`
        *,
        faculty:facultyId(name, email),
        students:studentId(enrollmentNumber, name)
      `)
      .eq('subjectId', subjectId)
      .gte('lectureDate', startDate.toISOString().split('T')[0])
      .lte('lectureDate', endDate.toISOString().split('T')[0]);

    if (feedbackError) {
      console.error('Error fetching daily feedback:', feedbackError);
      return res.status(500).json({ error: 'Failed to fetch daily feedback' });
    }

    // Get assessment plans and verifications for the month
    const { data: assessmentPlans, error: planError } = await supabase
      .from('assessment_plans')
      .select(`
        *,
        faculty:facultyId(name, email)
      `)
      .eq('subjectId', subjectId)
      .gte('plannedDate', startDate.toISOString().split('T')[0])
      .lte('plannedDate', endDate.toISOString().split('T')[0]);

    if (planError) {
      console.error('Error fetching assessment plans:', planError);
      return res.status(500).json({ error: 'Failed to fetch assessment plans' });
    }

    // Get assessment verifications
    let assessmentVerifications = [];
    if (assessmentPlans && assessmentPlans.length > 0) {
      const planIds = assessmentPlans.map(plan => plan.id);
      const { data: verifications, error: verificationError } = await supabase
        .from('assessment_verifications')
        .select(`
          *,
          students:studentId(enrollmentNumber, name)
        `)
        .in('assessmentPlanId', planIds);

      if (verificationError) {
        console.error('Error fetching verifications:', verificationError);
      } else {
        assessmentVerifications = verifications || [];
      }
    }

    // Get academic events and verifications for the month
    const { data: academicEvents, error: eventError } = await supabase
      .from('academic_events')
      .select(`
        *,
        faculty:facultyId(name, email)
      `)
      .eq('subjectId', subjectId)
      .gte('scheduledDate', startDate.toISOString())
      .lte('scheduledDate', endDate.toISOString());

    if (eventError) {
      console.error('Error fetching academic events:', eventError);
      return res.status(500).json({ error: 'Failed to fetch academic events' });
    }

    // Get event verifications
    let eventVerifications = [];
    if (academicEvents && academicEvents.length > 0) {
      const eventIds = academicEvents.map(event => event.id);
      const { data: eventVerts, error: eventVerError } = await supabase
        .from('event_verifications')
        .select(`
          *,
          students:studentId(enrollmentNumber, name)
        `)
        .in('eventId', eventIds);

      if (eventVerError) {
        console.error('Error fetching event verifications:', eventVerError);
      } else {
        eventVerifications = eventVerts || [];
      }
    }

    // Calculate comprehensive summary
    const summary = {
      period: {
        month: month,
        year: year,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      dailyFeedback: {
        totalFeedback: dailyFeedback?.length || 0,
        averageLectureRating: dailyFeedback && dailyFeedback.length > 0 ? 
          (dailyFeedback.reduce((sum, item) => sum + item.lectureRating, 0) / dailyFeedback.length).toFixed(2) : 0,
        averageFacultyRating: dailyFeedback && dailyFeedback.length > 0 ? 
          (dailyFeedback.reduce((sum, item) => sum + item.facultyRating, 0) / dailyFeedback.length).toFixed(2) : 0,
        ratingDistribution: {
          lecture: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          faculty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      },
      assessments: {
        totalPlanned: assessmentPlans?.length || 0,
        totalCompleted: assessmentPlans?.filter(plan => plan.status === 'completed').length || 0,
        totalCancelled: assessmentPlans?.filter(plan => plan.status === 'cancelled').length || 0,
        averageCompletionRate: assessmentVerifications.length > 0 ? 
          ((assessmentVerifications.filter(v => v.isCompleted).length / assessmentVerifications.length) * 100).toFixed(2) : 0
      },
      academicEvents: {
        totalScheduled: academicEvents?.length || 0,
        totalCompleted: academicEvents?.filter(event => event.status === 'completed').length || 0,
        totalCancelled: academicEvents?.filter(event => event.status === 'cancelled').length || 0,
        averageCompletionRate: eventVerifications.length > 0 ? 
          ((eventVerifications.filter(v => v.isCompleted).length / eventVerifications.length) * 100).toFixed(2) : 0
      }
    };

    // Calculate rating distribution
    if (dailyFeedback) {
      dailyFeedback.forEach(item => {
        summary.dailyFeedback.ratingDistribution.lecture[item.lectureRating]++;
        summary.dailyFeedback.ratingDistribution.faculty[item.facultyRating]++;
      });
    }

    // Faculty performance analysis
    const facultyPerformance = {};
    if (dailyFeedback) {
      dailyFeedback.forEach(item => {
        if (!facultyPerformance[item.facultyId]) {
          facultyPerformance[item.facultyId] = {
            name: item.faculty?.name || 'Unknown',
            email: item.faculty?.email || 'Unknown',
            totalFeedback: 0,
            totalLectureRating: 0,
            totalFacultyRating: 0,
            averageLectureRating: 0,
            averageFacultyRating: 0
          };
        }
        
        facultyPerformance[item.facultyId].totalFeedback++;
        facultyPerformance[item.facultyId].totalLectureRating += item.lectureRating;
        facultyPerformance[item.facultyId].totalFacultyRating += item.facultyRating;
      });

      // Calculate averages
      Object.keys(facultyPerformance).forEach(facultyId => {
        const faculty = facultyPerformance[facultyId];
        faculty.averageLectureRating = (faculty.totalLectureRating / faculty.totalFeedback).toFixed(2);
        faculty.averageFacultyRating = (faculty.totalFacultyRating / faculty.totalFeedback).toFixed(2);
      });
    }

    const report = {
      summary,
      facultyPerformance,
      dailyFeedback: dailyFeedback || [],
      assessmentPlans: assessmentPlans || [],
      assessmentVerifications: assessmentVerifications || [],
      academicEvents: academicEvents || [],
      eventVerifications: eventVerifications || []
    };

    res.json(report);
  } catch (error) {
    console.error('Error in GET /reports/monthly/:subjectId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Send monthly report to HOD email
router.post('/send-monthly/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { month, year, hodEmail } = req.body;

    if (!month || !year || !hodEmail) {
      return res.status(400).json({ error: 'Month, year, and HOD email are required' });
    }

    // Generate the report first
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get subject information
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('name, code')
      .eq('id', subjectId)
      .single();

    if (subjectError || !subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Get the monthly report data (reuse the logic from the GET endpoint)
    // ... (same logic as above to generate report data)

    // Send email
    const emailResult = await sendMonthlyReportEmail(hodEmail, subject, month, year, startDate, endDate);

    if (emailResult.success) {
      res.json({ 
        message: 'Monthly report sent successfully to HOD',
        emailResult 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send monthly report email',
        emailResult 
      });
    }
  } catch (error) {
    console.error('Error in POST /reports/send-monthly/:subjectId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get comprehensive dashboard data for HOD
router.get('/dashboard/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    let start, end;
    if (!startDate || !endDate) {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    // Get all data for the period
    const { data: dailyFeedback, error: feedbackError } = await supabase
      .from('daily_feedback')
      .select('*')
      .eq('subjectId', subjectId)
      .gte('lectureDate', start.toISOString().split('T')[0])
      .lte('lectureDate', end.toISOString().split('T')[0]);

    const { data: assessmentPlans, error: planError } = await supabase
      .from('assessment_plans')
      .select('*')
      .eq('subjectId', subjectId)
      .gte('plannedDate', start.toISOString().split('T')[0])
      .lte('plannedDate', end.toISOString().split('T')[0]);

    const { data: academicEvents, error: eventError } = await supabase
      .from('academic_events')
      .select('*')
      .eq('subjectId', subjectId)
      .gte('scheduledDate', start.toISOString())
      .lte('scheduledDate', end.toISOString());

    if (feedbackError || planError || eventError) {
      console.error('Error fetching dashboard data:', { feedbackError, planError, eventError });
      return res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }

    // Calculate trends and insights
    const dashboard = {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      overview: {
        totalFeedback: dailyFeedback?.length || 0,
        totalAssessments: assessmentPlans?.length || 0,
        totalEvents: academicEvents?.length || 0
      },
      trends: {
        dailyFeedbackTrend: calculateDailyTrend(dailyFeedback, 'lectureDate'),
        assessmentCompletionTrend: calculateAssessmentTrend(assessmentPlans),
        eventCompletionTrend: calculateEventTrend(academicEvents)
      },
      insights: generateInsights(dailyFeedback, assessmentPlans, academicEvents)
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error in GET /reports/dashboard/:subjectId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculateDailyTrend(feedback, dateField) {
  if (!feedback || feedback.length === 0) return [];
  
  const dailyStats = {};
  feedback.forEach(item => {
    const date = item[dateField];
    if (!dailyStats[date]) {
      dailyStats[date] = { count: 0, totalRating: 0 };
    }
    dailyStats[date].count++;
    dailyStats[date].totalRating += item.lectureRating;
  });

  return Object.keys(dailyStats).map(date => ({
    date,
    count: dailyStats[date].count,
    averageRating: (dailyStats[date].totalRating / dailyStats[date].count).toFixed(2)
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function calculateAssessmentTrend(assessments) {
  if (!assessments || assessments.length === 0) return [];
  
  const weeklyStats = {};
  assessments.forEach(assessment => {
    const weekStart = getWeekStart(assessment.plannedDate);
    if (!weeklyStats[weekStart]) {
      weeklyStats[weekStart] = { planned: 0, completed: 0, cancelled: 0 };
    }
    weeklyStats[weekStart][assessment.status]++;
  });

  return Object.keys(weeklyStats).map(week => ({
    week,
    ...weeklyStats[week]
  })).sort((a, b) => new Date(a.week) - new Date(b.week));
}

function calculateEventTrend(events) {
  if (!events || events.length === 0) return [];
  
  const monthlyStats = {};
  events.forEach(event => {
    const month = event.scheduledDate.substring(0, 7); // YYYY-MM
    if (!monthlyStats[month]) {
      monthlyStats[month] = { scheduled: 0, completed: 0, cancelled: 0 };
    }
    monthlyStats[month][event.status]++;
  });

  return Object.keys(monthlyStats).map(month => ({
    month,
    ...monthlyStats[month]
  })).sort((a, b) => a.month.localeCompare(b.month));
}

function getWeekStart(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

function generateInsights(feedback, assessments, events) {
  const insights = [];

  if (feedback && feedback.length > 0) {
    const avgRating = feedback.reduce((sum, item) => sum + item.lectureRating, 0) / feedback.length;
    if (avgRating < 3) {
      insights.push('Low average lecture ratings detected. Consider reviewing teaching methods.');
    } else if (avgRating > 4) {
      insights.push('High average lecture ratings. Teaching methods are effective.');
    }
  }

  if (assessments && assessments.length > 0) {
    const completionRate = assessments.filter(a => a.status === 'completed').length / assessments.length;
    if (completionRate < 0.8) {
      insights.push('Assessment completion rate is below target. Review scheduling and communication.');
    }
  }

  if (events && events.length > 0) {
    const eventCompletionRate = events.filter(e => e.status === 'completed').length / events.length;
    if (eventCompletionRate < 0.9) {
      insights.push('Academic event completion rate needs improvement. Check event planning and execution.');
    }
  }

  return insights;
}

export default router;
