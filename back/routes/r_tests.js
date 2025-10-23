const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { verifyToken, checkRole } = require('../lib/auth');
const service = require('../services/s_tests');

// ===============================
// Joi Validation Schemas
// ===============================
const testSchema = Joi.object({
    test_name: Joi.string().max(255).required(),
    description: Joi.string().allow(null, '').optional(),
    is_active: Joi.number().valid(0, 1).optional(),
});

const testUpdateSchema = Joi.object({
    test_name: Joi.string().max(255).optional(),
    description: Joi.string().allow(null, '').optional(),
    is_active: Joi.number().valid(0, 1).optional(),
});

const deleteTestsSchema = Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

// ===============================
// Routes
// ===============================

// List all tests (with pagination + search + sorting)
router.get('/test', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder || 'DESC';

        const data = await service.listTests({ 
            page, 
            limit, 
            search,
            sortBy,
            sortOrder
        });
        res.json(data);
    } catch (e) {
        console.error('Error listing tests:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a single test by ID
router.get('/test/:id', verifyToken, async (req, res) => {
    try {
        const row = await service.getTest(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) {
        console.error('Error getting test:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new test
router.post('/test', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = testSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const id = await service.createTest(value);
        res.status(201).json({ message: 'Test created successfully', id });
    } catch (e) {
        console.error('Error creating test:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a test
router.put('/test/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = testUpdateSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const affected = await service.updateTest(req.params.id, value);
        if (!affected) return res.status(404).json({ message: 'Not found or no changes made' });

        res.json({ message: 'Test updated successfully', updated: affected });
    } catch (e) {
        console.error('Error updating test:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Soft delete multiple tests
router.post('/test/delete', verifyToken, checkRole([1]), async (req, res) => {
    const { error, value } = deleteTestsSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const affected = await service.softDeleteTest(value.ids);
        if (!affected) return res.status(404).json({ message: 'No tests found or already deleted' });

        res.json({ message: 'Tests soft deleted successfully', updated: affected });
    } catch (e) {
        console.error('Error soft deleting tests:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Hard delete single test
router.delete('/test/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const affected = await service.deleteTest(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Not found' });

        res.json({ message: 'Test deleted successfully', deleted: affected });
    } catch (e) {
        console.error('Error deleting test:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
