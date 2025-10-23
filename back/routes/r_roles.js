// routes/roles.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { verifyToken, checkRole } = require('../lib/auth');
const service = require('../services/s_roles');

// JOI Validation Schema
const roleSchema = Joi.object({
    role_name: Joi.string().max(50).required(),
    description: Joi.string().allow(null, '').optional(),
});

// GET /roles - List all roles
// router.get('/roles', async (req, res) => {
//     try {
//         const data = await service.listRoles();
//         res.json(data);
//     } catch (e) {
//         console.error('Error listing roles:', e);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
router.get('/roles', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';

        const data = await service.listRoles({ page, limit, search });
        res.json(data);
    } catch (e) {
        console.error('Error listing insurers:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/roles', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0; 
        const search = req.query.q || '';

        const data = await service.listRoles({ page, limit, search });
        res.json(data);
    } catch (e) {
        console.error('Error listing roles:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /roles/:id - Get role by ID
router.get('/roles/:id', verifyToken, async (req, res) => {
    try {
        const role = await service.getRole(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json(role);
    } catch (e) {
        console.error('Error getting role:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /roles - Create new role
router.post('/roles', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = roleSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const id = await service.createRole(value);
        res.status(201).json({ message: 'Role created successfully', id });
    } catch (e) {
        console.error('Error creating role:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /roles/:id - Update a role
router.put('/roles/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = roleSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const affected = await service.updateRole(req.params.id, value);
        if (!affected) return res.status(404).json({ message: 'Role not found or no changes made' });

        res.json({ updated: affected });
    } catch (e) {
        console.error('Error updating role:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /roles/:id - Delete a role
router.delete('/roles/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const affected = await service.deleteRole(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Role not found' });

        res.json({ deleted: affected });
    } catch (e) {
        console.error('Error deleting role:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
