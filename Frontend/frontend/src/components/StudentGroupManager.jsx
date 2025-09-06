import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import './StudentGroupManager.css';

const StudentGroupManager = ({ group, subject, subjects, onClose, onUpdate }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [newStudent, setNewStudent] = useState({
    enrollmentNumber: '',
    name: '',
    email: ''
  });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  useEffect(() => {
    if (group && group.id) {
      fetchStudentsInGroup();
    }
  }, [group]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const fetchStudentsInGroup = async () => {
    try {
      setLoading(true);
      console.log('Fetching students for group:', group.id);
      const response = await api.get(`/student-groups/group/${group.id}/students`);
      console.log('Students response:', response.data);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.enrollmentNumber.trim()) {
      toast.error('Enrollment number is required');
      return;
    }

    if (!selectedSubject?.id) {
      toast.error('Please select a subject first');
      return;
    }

    try {
      setLoading(true);
      await api.post('/student-groups/add-student', {
        studentId: newStudent.enrollmentNumber,
        groupId: group.id,
        subjectId: selectedSubject.id
      });

      toast.success('Student added successfully');
      setNewStudent({ enrollmentNumber: '', name: '', email: '' });
      setShowAddStudent(false);
      fetchStudentsInGroup();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the group?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete('/student-groups/remove-student', {
        data: {
          studentId,
          groupId: group.id
        }
      });

      toast.success('Student removed successfully');
      fetchStudentsInGroup();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error(error.response?.data?.error || 'Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setUploadingExcel(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const binaryData = event.target.result;
          console.log('Excel file loaded, processing...');
          
          const workbook = XLSX.read(binaryData, { type: 'binary' });
          console.log('Workbook sheets:', workbook.SheetNames);
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            toast.error('No sheets found in Excel file');
            return;
          }
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          if (!worksheet) {
            toast.error('Could not read the first sheet of the Excel file');
            return;
          }
          
          // Convert to JSON
          const students = XLSX.utils.sheet_to_json(worksheet);
          console.log('Raw Excel data:', students);
          
          if (students.length === 0) {
            toast.error('Excel file is empty');
            return;
          }

          // Validate and normalize data
          const validStudents = students.map(student => ({
            enrollmentNumber: student.enrollmentNumber || student.studentId || student['Enrollment Number'] || student['Enrollment Number'],
            name: student.name || student.Name || student['Student Name'] || '',
            email: student.email || student.Email || student['Student Email'] || ''
          })).filter(s => s.enrollmentNumber);
          
          console.log('Valid students:', validStudents);

          if (validStudents.length === 0) {
            toast.error('No valid student data found in Excel');
            return;
          }

          if (!selectedSubject?.id) {
            toast.error('Please select a subject first');
            return;
          }

          // Upload students
          console.log('Sending data to API:', {
            groupId: group.id,
            subjectId: selectedSubject.id,
            students: validStudents
          });
          
          const response = await api.post('/student-groups/bulk-add-students', {
            groupId: group.id,
            subjectId: selectedSubject.id,
            students: validStudents
          });
          
          console.log('API response:', response.data);

          toast.success(`${validStudents.length} students added successfully`);
          fetchStudentsInGroup();
          if (onUpdate) onUpdate();
          setExcelFile(null);
        } catch (error) {
          console.error('Error processing Excel:', error);
          if (error.response) {
            // Server responded with error status
            toast.error(error.response.data?.error || 'Server error while processing Excel file');
          } else if (error.request) {
            // Request was made but no response received
            toast.error('Network error. Please check your connection and try again.');
          } else {
            // Something else happened
            toast.error('Error processing Excel file: ' + error.message);
          }
        }
      };
      
      reader.onerror = () => {
        toast.error('Error reading Excel file');
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading Excel:', error);
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data?.error || 'Server error while uploading Excel file');
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        toast.error('Failed to upload Excel file: ' + error.message);
      }
    } finally {
      setUploadingExcel(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Enrollment Number': 'EN2021CS001',
        'Student Name': 'John Doe',
        'Student Email': 'john.doe@example.com'
      },
      {
        'Enrollment Number': 'EN2021CS002',
        'Student Name': 'Jane Smith',
        'Student Email': 'jane.smith@example.com'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    
    XLSX.writeFile(wb, 'student_group_template.xlsx');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="student-group-manager"
    >
      <div className="manager-header">
        <h2>Manage Students - {group?.name}</h2>
        <div className="subject-selector">
          <label htmlFor="subject-select">Subject:</label>
          <select
            id="subject-select"
            value={selectedSubject?.id || ''}
            onChange={(e) => {
              const subject = subjects.find(s => s.id === parseInt(e.target.value));
              setSelectedSubject(subject);
            }}
            className="subject-dropdown"
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="manager-content">
                {/* Actions Section */}
        <div className="actions-section">
          {!selectedSubject?.id && (
            <div className="warning-message">
              ⚠️ Please select a subject above to start managing students
            </div>
          )}
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => setShowAddStudent(true)}
              disabled={loading || !selectedSubject?.id}
              title={!selectedSubject?.id ? 'Please select a subject first' : ''}
            >
              + Add Student
            </button>
            
            <label className="action-btn secondary file-upload">
              📁 Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                style={{ display: 'none' }}
                disabled={uploadingExcel || loading || !selectedSubject?.id}
                title={!selectedSubject?.id ? 'Please select a subject first' : ''}
              />
            </label>
            
            <button 
              className="action-btn secondary"
              onClick={downloadTemplate}
            >
              📥 Download Template
            </button>
          </div>

          {uploadingExcel && (
            <div className="upload-status">
              <div className="spinner"></div>
              <span>Processing Excel file...</span>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        <AnimatePresence>
          {showAddStudent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="add-student-modal"
            >
              <h3>Add New Student</h3>
              <div className="form-group">
                <label>Enrollment Number *</label>
                <input
                  type="text"
                  value={newStudent.enrollmentNumber}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, enrollmentNumber: e.target.value }))}
                  placeholder="Enter enrollment number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter student name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter student email"
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="btn primary"
                  onClick={handleAddStudent}
                  disabled={loading || !newStudent.enrollmentNumber.trim()}
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
                <button 
                  className="btn secondary"
                  onClick={() => setShowAddStudent(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Students List */}
        <div className="students-section">
          <div className="section-header">
            <h3>Students in Group ({students.length})</h3>
            <button 
              className="refresh-btn"
              onClick={fetchStudentsInGroup}
              disabled={loading}
            >
              🔄
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>No students in this group yet</p>
              <p>Add students manually or upload an Excel file</p>
            </div>
          ) : (
            <div className="students-list">
              {students.map((student, index) => (
                <motion.div
                  key={student.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="student-item"
                >
                  <div className="student-info">
                    <div className="student-main">
                      <span className="student-name">
                        {student.students?.name || student.name || 'Unknown Name'}
                      </span>
                      <span className="student-enrollment">
                        {student.students?.enrollmentNumber || student.student_id || 'No ID'}
                      </span>
                    </div>
                    {student.students?.email && (
                      <span className="student-email">{student.students.email}</span>
                    )}
                  </div>
                  <div className="student-actions">
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveStudent(student.student_id || student.students?.enrollmentNumber)}
                      disabled={loading}
                      title="Remove from group"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentGroupManager; 