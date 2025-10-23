const express = require('express');
const router = express.Router();
const Joi = require('joi');
const service = require('../services/s_test_rates');
const { verifyToken, checkRole } = require('../lib/auth');




// ===============================
// Joi Validation Schemas
// ===============================
const testRateSchema = Joi.object({
    client_id: Joi.number().integer().positive().optional().allow(null),
    center_id: Joi.number().integer().positive().optional().allow(null),
    insurer_id: Joi.number().integer().positive().allow(null).optional().allow(null),
    rate_type: Joi.string().valid('test', 'category').required(),
    test_id: Joi.when('rate_type', {
        is: 'test',
        then: Joi.number().integer().positive().required(),
        otherwise: Joi.number().integer().positive().allow(null)
    }),
    category_id: Joi.when('rate_type', {
        is: 'category',
        then: Joi.number().integer().positive().required(),
        otherwise: Joi.number().integer().positive().allow(null)
    }),
    rate: Joi.number().precision(2).positive().required(),
    is_active: Joi.number().valid(0, 1).optional(),
});

const testRateUpdateSchema = Joi.object({
    client_id: Joi.number().integer().positive().optional().allow(null),
    center_id: Joi.number().integer().positive().optional().allow(null),
    insurer_id: Joi.number().integer().positive().allow(null).optional().allow(null),
    rate_type: Joi.string().valid('test', 'category').optional(),
    test_id: Joi.number().integer().positive().optional().allow(null),
    category_id: Joi.number().integer().positive().optional().allow(null),
    rate: Joi.number().precision(2).positive().optional(),
    is_active: Joi.number().valid(0, 1).optional(),
});

const deleteTestRatesSchema = Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

// ===============================
// Routes
// ===============================

// List test rates (with pagination + search)
router.get('/test-rates', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';

        const data = await service.listTestRates({ page, limit, search });
        res.json(data);
    } catch (e) {
        console.error('Error listing test rates:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get test rate by ID
router.get('/test-rates/:id', verifyToken, async (req, res) => {
    try {
        const row = await service.getTestRate(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) {
        console.error('Error getting test rate:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new test rate
router.post('/test-rates', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = testRateSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const id = await service.createTestRate({ ...value, created_by: req.user.id });
        res.status(201).json({ message: 'Test rate created successfully', id });
    } catch (e) {
        console.error('Error creating test rate:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update test rate
router.put('/test-rates/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = testRateUpdateSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const affected = await service.updateTestRate(req.params.id, value);
        if (!affected) return res.status(404).json({ message: 'Not found or no changes made' });

        res.json({ message: 'Test rate updated successfully', updated: affected });
    } catch (e) {
        console.error('Error updating test rate:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Soft delete multiple test rates
router.post('/test-rates/delete', verifyToken, checkRole([1]), async (req, res) => {
    const { error, value } = deleteTestRatesSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const affected = await service.softDeleteTestRate(value.ids);
        if (!affected) return res.status(404).json({ message: 'No test rates found or already deleted' });

        res.json({ message: 'Test rates soft deleted successfully', updated: affected });
    } catch (e) {
        console.error('Error soft deleting test rates:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Hard delete a test rate
router.delete('/test-rates/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const affected = await service.deleteTestRate(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Not found' });

        res.json({ message: 'Test rate deleted successfully', deleted: affected });
    } catch (e) {
        console.error('Error deleting test rate:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// get table data
router.get('/test-rates/client/:clientId',verifyToken, async (req, res) => {
    const clientId = parseInt(req.params.clientId);

    if (isNaN(clientId)) {
        return res.status(400).json({ message: 'Invalid client ID' });
    }

    try {
        const data = await service.getClientTestRates(clientId);
        res.json(data);
    } catch (err) {
        console.error('Error fetching client test rates:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Get combined tests and categories
router.get('/test-rates/items/combined', verifyToken, async (req, res) => {
    try {
        const items = await service.getAvailableItemsCombined();
        res.json({ data: items });
    } catch (e) {
        console.error('Error getting combined items:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
