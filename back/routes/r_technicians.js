const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../lib/auth');
const service = require('../services/s_technicians');
const Joi = require('joi');

const technicianSchema = Joi.object({
  user_id: Joi.number().integer().optional().allow(null),
  center_id: Joi.number().integer().required(),
  technician_code: Joi.string().max(50).required(),
  full_name: Joi.string().max(255).required(),
  mobile: Joi.string().max(20).required(),
  email: Joi.string().email().max(255).optional().allow(null, ''),
  home_gps_latitude: Joi.number().precision(8).optional().allow(null),
  home_gps_longitude: Joi.number().precision(8).optional().allow(null),
  home_address: Joi.string().optional().allow(null, ''),
  qualification: Joi.string().max(255).optional().allow(null, ''),
  experience_years: Joi.number().integer().min(0).optional().allow(null),
  is_active: Joi.number().optional()
});

const technicianUpdateSchema = technicianSchema.fork(Object.keys(technicianSchema.describe().keys), field => field.optional());

const deletetechnicianSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});



// router.get('/technicians', verifyToken, async (req, res) => { try { res.json(await service.listTechnicians()); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });

router.get('/technicians', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder || 'DESC';

        const data = await service.listTechnicians({ 
            page, 
            limit, 
            search,
            sortBy,
            sortOrder
        });
        res.json(data);
    } catch (e) {
        console.error('Error listing technicians:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});








router.get('/technicians/:id', verifyToken, async (req, res) => { try { const row = await service.getTechnician(req.params.id); if (!row) return res.status(404).json({ message: 'Not found' }); res.json(row); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });
// router.post('/technicians', verifyToken, checkRole([1]), async (req, res) => { try { const id = await service.createTechnician(req.body); res.status(201).json({ id }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });

router.post('/technicians', verifyToken, checkRole([1,3]), async (req, res) => {
  try {
    const { error, value } = technicianSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const id = await service.createTechnician(value);
    res.status(201).json({ id });
  } catch (e) {
    console.error('Create technician error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// router.put('/technicians/:id', verifyToken, checkRole([1]), async (req, res) => { try { const affected = await service.updateTechnician(req.params.id, req.body); if (!affected) return res.status(404).json({ message: 'Not found' }); res.json({ updated: affected }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });


router.put('/technicians/:id', verifyToken, checkRole([1,3]), async (req, res) => {
  try {
    const { error, value } = technicianUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const affected = await service.updateTechnician(req.params.id, value);
    if (!affected) return res.status(404).json({ message: 'Not found or no changes' });

    res.json({ updated: affected });
  } catch (e) {
    console.error('Update technician error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// softdelete
router.post('/technicians/delete', verifyToken, checkRole([1,3]), async (req, res) => {
  const { error, value } = deletetechnicianSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const affected = await service.softDeleteTechnician(value.ids);
  if (!affected) {
    return res.status(404).json({ message: 'No technicians were found or already deleted' });
  }

  res.json({ message: 'technicians soft deleted successfully', updated: affected });
});



router.delete('/technicians/:id', verifyToken, checkRole([1,3]), async (req, res) => { try { const affected = await service.deleteTechnician(req.params.id); if (!affected) return res.status(404).json({ message: 'Not found' }); res.json({ deleted: affected }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });

module.exports = router;


