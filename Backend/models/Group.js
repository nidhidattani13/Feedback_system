import supabase from '../supabaseClient.js';

class Group {
    static async create(name, facultyId, info) {
        try {
            const { data, error } = await supabase
                .from('groups')
                .insert({
                    name,
                    faculty_id: facultyId,
                    info,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    static async getAllByFaculty(facultyId) {
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('*')
                .eq('faculty_id', facultyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    }
}

export default Group;
