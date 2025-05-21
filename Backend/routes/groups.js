import express from 'express';
import { Router } from 'express';
import Group from '../models/Group.js';

const router = Router();

// Get all groups for faculty
router.get('/', async (req, res) => {
    try {
        const { facultyId } = req.query;
        if (!facultyId) {
            return res.status(400).json({ error: 'Faculty ID is required' });
        }
        
        const groups = await Group.getAllByFaculty(facultyId);
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new group
router.post('/', async (req, res) => {
    try {
        const { name, info, facultyId } = req.body;
        
        if (!name || !facultyId) {
            return res.status(400).json({ error: 'Name and facultyId are required' });
        }

        const group = await Group.create(name, facultyId, info);
        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update group status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        if (!id || isActive === undefined) {
            return res.status(400).json({ error: 'ID and isActive status are required' });
        }

        const { data, error } = await supabase
            .from('groups')
            .update({
                is_active: isActive
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating group status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete group
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
