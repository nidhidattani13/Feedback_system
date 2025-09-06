import supabase from '../supabaseClient.js';

class StudentGroup {
    // Add a student to a group
    static async addStudentToGroup(studentId, groupId, subjectId) {
        try {
            const { data, error } = await supabase
                .from('student_groups')
                .insert({
                    student_id: studentId,
                    group_id: groupId,
                    subject_id: subjectId,
                    joined_at: new Date().toISOString(),
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding student to group:', error);
            throw error;
        }
    }

    // Remove a student from a group
    static async removeStudentFromGroup(studentId, groupId) {
        try {
            const { error } = await supabase
                .from('student_groups')
                .update({ is_active: false })
                .eq('student_id', studentId)
                .eq('group_id', groupId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error removing student from group:', error);
            throw error;
        }
    }

    // Get all students in a group
    static async getStudentsInGroup(groupId) {
        try {
            const { data, error } = await supabase
                .from('student_groups')
                .select(`
                    *,
                    students:student_id(enrollmentNumber, name, email),
                    groups:group_id(name, info)
                `)
                .eq('group_id', groupId)
                .eq('is_active', true);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching students in group:', error);
            throw error;
        }
    }

    // Get all groups a student is part of
    static async getStudentGroups(studentId) {
        try {
            const { data, error } = await supabase
                .from('student_groups')
                .select(`
                    *,
                    groups:group_id(name, info, faculty_id),
                    subjects:subject_id(name, info, plan)
                `)
                .eq('student_id', studentId)
                .eq('is_active', true);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching student groups:', error);
            throw error;
        }
    }

    // Get all groups for a subject
    static async getGroupsForSubject(subjectId) {
        try {
            const { data, error } = await supabase
                .from('student_groups')
                .select(`
                    *,
                    groups:group_id(name, info),
                    students:student_id(enrollmentNumber, name, email)
                `)
                .eq('subject_id', subjectId)
                .eq('is_active', true);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching groups for subject:', error);
            throw error;
        }
    }

    // Bulk add students to a group (from Excel file)
    static async bulkAddStudentsToGroup(students, groupId, subjectId) {
        try {
            const studentGroupData = students.map(student => ({
                student_id: student.enrollmentNumber || student.studentId,
                group_id: groupId,
                subject_id: subjectId,
                joined_at: new Date().toISOString(),
                is_active: true
            }));

            const { data, error } = await supabase
                .from('student_groups')
                .insert(studentGroupData)
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error bulk adding students to group:', error);
            throw error;
        }
    }

    // Check if a student is already in a group
    static async isStudentInGroup(studentId, groupId) {
        try {
            const { data, error } = await supabase
                .from('student_groups')
                .select('*')
                .eq('student_id', studentId)
                .eq('group_id', groupId)
                .eq('is_active', true)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            return !!data;
        } catch (error) {
            console.error('Error checking if student is in group:', error);
            return false;
        }
    }
}

export default StudentGroup; 