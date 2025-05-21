import supabase from '../supabaseClient.js';

class Subject {
    static async create(name, facultyId, info, plan) {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .insert({
                    name,
                    faculty_id: facultyId,
                    info,
                    plan,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    }

    static async getAllByFaculty(facultyId) {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .eq('faculty_id', facultyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    }
}

export default Subject;
