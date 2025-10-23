const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../lib/auth');
const service = require('../services/s_insurers');

const Joi = require('joi');

const insurerSchema = Joi.object({
    insurer_code: Joi.string().max(50).allow(null, ''),
    insurer_name: Joi.string().max(255).allow(null, ''),
    // insurer_type: Joi.string().valid('Life', 'Health', 'General').optional(),
    insurer_type: Joi.string().optional().allow(null, ''),
    contact_number: Joi.string().max(20).optional().allow(null, ''),
    email: Joi.string().email().optional().allow(null, ''),
    is_active: Joi.number().valid(0, 1).optional()
});

const insurerUpdateSchema = Joi.object({
    insurer_code: Joi.string().max(50).optional().allow(null, ''),
    insurer_name: Joi.string().max(255).optional().allow(null, ''),
    insurer_type: Joi.string().allow(null, '').optional(),
    contact_number: Joi.string().max(20).optional().allow(null, ''),
    email: Joi.string().email().optional().allow(null, ''),
    is_active: Joi.number().valid(0, 1).optional()
}); 


const deleteCentersSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});

// router.get('/insurers', verifyToken, async (req, res) => {
//     try { res.json(await service.listInsurers()); } catch (e) { res.status(500).json({ message: 'Internal server error' }); }
// });

router.get('/insurers', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder || 'DESC';

        const data = await service.listInsurers({ 
            page, 
            limit, 
            search,
            sortBy,
            sortOrder
        });
        res.json(data);
    } catch (e) {
        console.error('Error listing insurers:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});





router.get('/insurers/:id', verifyToken, async (req, res) => {
    try { const row = await service.getInsurer(req.params.id); if (!row) return res.status(404).json({ message: 'Not found' }); res.json(row); } catch (e) { res.status(500).json({ message: 'Internal server error' }); }
});


router.post('/insurers', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = insurerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const id = await service.createInsurer(value);
        res.status(201).json({ message: 'Insurer created successfully', id });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Insurer code already exists' });
        }
        console.error('Error creating insurer:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/insurers/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = insurerUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const affected = await service.updateInsurer(req.params.id, value);
        if (!affected) return res.status(404).json({ message: 'Not found or no changes made' });

        res.json({ message: 'Insurer updated successfully', updated: affected });
    } catch (e) {
        console.error('Error updating insurer:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// softdelete
router.post('/insurers/delete', verifyToken, checkRole([1]), async (req, res) => {
  const { error, value } = deleteCentersSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const affected = await service.softDeleteInsurer(value.ids);
  if (!affected) {
    return res.status(404).json({ message: 'No Insurers were found or already deleted' });
  }

  res.json({ message: 'Insurers soft deleted successfully', updated: affected });
});


router.delete('/insurers/:id', verifyToken, checkRole([1]), async (req, res) => {
    try { const affected = await service.deleteInsurer(req.params.id); if (!affected) return res.status(404).json({ message: 'Not found' }); res.json({ deleted: affected }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); }
});

module.exports = router;


