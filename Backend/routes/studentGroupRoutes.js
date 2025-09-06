import express from 'express';
import supabase from '../supabaseClient.js';
import { authMiddleware, requireFaculty } from '../middleware/authMiddleware.js';
import StudentGroup from '../models/StudentGroup.js';
import * as XLSX from 'xlsx';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// POST: Add a single student to a group
router.post('/add-student', requireFaculty, async (req, res) => {
  try {
    const { studentId, groupId, subjectId } = req.body;

    if (!studentId || !groupId || !subjectId) {
      return res.status(400).json({ error: 'Missing required fields: studentId, groupId, subjectId' });
    }

    // Check if student is already in the group
    const isAlreadyInGroup = await StudentGroup.isStudentInGroup(studentId, groupId);
    if (isAlreadyInGroup) {
      return res.status(400).json({ error: 'Student is already in this group' });
    }

    // Add student to group
    const result = await StudentGroup.addStudentToGroup(studentId, groupId, subjectId);

    res.status(201).json({ 
      message: 'Student added to group successfully',
      data: result 
    });
  } catch (error) {
    console.error('Error adding student to group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Bulk add students to a group from Excel file
router.post('/bulk-add-students', requireFaculty, async (req, res) => {
  try {
    const { groupId, subjectId, students } = req.body;

    if (!groupId || !subjectId || !students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Missing required fields: groupId, subjectId, students array' });
    }

    if (students.length === 0) {
      return res.status(400).json({ error: 'Students array cannot be empty' });
    }

    // Validate student data structure
    const validStudents = students.filter(student => 
      student.enrollmentNumber || student.studentId
    );

    if (validStudents.length === 0) {
      return res.status(400).json({ error: 'No valid student data found' });
    }

    // Bulk add students to group
    const result = await StudentGroup.bulkAddStudentsToGroup(validStudents, groupId, subjectId);

    res.status(201).json({ 
      message: `${result.length} students added to group successfully`,
      data: result 
    });
  } catch (error) {
    console.error('Error bulk adding students to group:', error);
    
    // Provide more specific error messages
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Some students are already in this group' });
    } else if (error.code === '23503') { // Foreign key constraint violation
      res.status(400).json({ error: 'Invalid group ID or subject ID' });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

// POST: Upload Excel file and add students to group
router.post('/upload-excel', requireFaculty, async (req, res) => {
  try {
    const { groupId, subjectId, fileData } = req.body;

    if (!groupId || !subjectId || !fileData) {
      return res.status(400).json({ error: 'Missing required fields: groupId, subjectId, fileData' });
    }

    // Parse Excel data
    let students = [];
    try {
      // If fileData is base64, decode it
      const binaryData = Buffer.from(fileData, 'base64');
      const workbook = XLSX.read(binaryData, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      students = XLSX.utils.sheet_to_json(worksheet);
      
      // Validate required columns
      if (students.length === 0) {
        return res.status(400).json({ error: 'Excel file is empty' });
      }

      const firstStudent = students[0];
      if (!firstStudent.enrollmentNumber && !firstStudent.studentId && !firstStudent['Enrollment Number']) {
        return res.status(400).json({ 
          error: 'Excel must contain "enrollmentNumber", "studentId", or "Enrollment Number" column' 
        });
      }

      // Normalize column names
      students = students.map(student => ({
        enrollmentNumber: student.enrollmentNumber || student.studentId || student['Enrollment Number'],
        name: student.name || student.Name || student['Student Name'],
        email: student.email || student.Email || student['Student Email']
      }));

    } catch (parseError) {
      console.error('Error parsing Excel file:', parseError);
      return res.status(400).json({ error: 'Invalid Excel file format' });
    }

    // Bulk add students to group
    const result = await StudentGroup.bulkAddStudentsToGroup(students, groupId, subjectId);

    res.status(201).json({ 
      message: `${result.length} students added to group successfully from Excel file`,
      data: result 
    });
  } catch (error) {
    console.error('Error processing Excel upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE: Remove a student from a group
router.delete('/remove-student', requireFaculty, async (req, res) => {
  try {
    const { studentId, groupId } = req.body;

    if (!studentId || !groupId) {
      return res.status(400).json({ error: 'Missing required fields: studentId, groupId' });
    }

    // Remove student from group
    await StudentGroup.removeStudentFromGroup(studentId, groupId);

    res.json({ message: 'Student removed from group successfully' });
  } catch (error) {
    console.error('Error removing student from group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get all students in a group
router.get('/group/:groupId/students', requireFaculty, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    // Get students in group
    const students = await StudentGroup.getStudentsInGroup(groupId);

    res.json({ 
      groupId,
      students,
      count: students.length 
    });
  } catch (error) {
    console.error('Error fetching students in group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get all groups for a subject
router.get('/subject/:subjectId/groups', requireFaculty, async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    // Get groups for subject
    const groups = await StudentGroup.getGroupsForSubject(subjectId);

    res.json({ 
      subjectId,
      groups,
      count: groups.length 
    });
  } catch (error) {
    console.error('Error fetching groups for subject:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get all groups a student is part of
router.get('/student/:studentId/groups', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Get student's groups
    const groups = await StudentGroup.getStudentGroups(studentId);

    res.json({ 
      studentId,
      groups,
      count: groups.length 
    });
  } catch (error) {
    console.error('Error fetching student groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get group statistics
router.get('/group/:groupId/stats', requireFaculty, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    // Get students in group
    const students = await StudentGroup.getStudentsInGroup(groupId);

    // Calculate statistics
    const stats = {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.is_active).length,
      groupId,
      lastUpdated: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching group statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 