import express from 'express';
import { Router } from 'express';
import Subject from '../models/Subject.js';
import Group from '../models/Group.js';

const router = Router();

// Subjects routes
router.post('/subjects', async (req, res) => {
    try {
        const { name, facultyId } = req.body;
        const subject = await Subject.create(name, facultyId);
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/subjects', async (req, res) => {
    try {
        const { facultyId } = req.query;
        const subjects = await Subject.getAllByFaculty(facultyId);
        res.json(subjects);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Groups routes
router.post('/groups', async (req, res) => {
    try {
        const { name, facultyId } = req.body;
        const group = await Group.create(name, facultyId);
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/groups', async (req, res) => {
    try {
        const { facultyId } = req.query;
        const groups = await Group.getAllByFaculty(facultyId);
        res.json(groups);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
