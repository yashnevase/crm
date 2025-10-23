const express = require('express');
const router = express.Router();
const service = require('../services/s_clients');
const Joi = require('joi');
const { verifyToken, checkRole } = require('../lib/auth');
const { mixedUpload } = require('../lib/multer');




const registerClientJoi = Joi.object({
    client_code: Joi.string().alphanum().max(50).allow(null, ''),
    client_name: Joi.string().max(255).required(),
    client_type: Joi.string().allow(null,''),
    registered_address: Joi.string().allow(null, ''),
    gst_number: Joi.string().length(15).allow(null, ''),
    pan_number: Joi.string().length(10).allow(null, ''),
    mode_of_payment: Joi.string().allow(null, ''),
    payment_frequency: Joi.string().allow(null, ''),
    is_active: Joi.number().valid(0, 1).default(1),
    validity_period_start: Joi.date().allow(null),
    validity_period_end: Joi.date().allow(null),
    insurer_ids: Joi.array().items(Joi.number().integer().positive()).optional(),

    // New fields
    state: Joi.string().max(45).allow(null, ''),
    city: Joi.string().max(45).allow(null, ''),
    pincode: Joi.string().max(45).allow(null, ''),
    country: Joi.string().max(45).allow(null, ''),
    email_id: Joi.string().email().max(45).allow(null, ''),
    email_id_2: Joi.string().email().max(45).allow(null, ''),
    email_id_3: Joi.string().email().max(45).allow(null, ''),
    contact_person_name: Joi.string().max(45).allow(null, ''),
    contact_person_no: Joi.string().max(45).allow(null, ''),
    contact_person_address: Joi.string().max(455).allow(null, ''),
    onboarding_date: Joi.date().allow(null),
    agreement_id: Joi.string().max(45).allow(null, ''),
    invoice_format_upload: Joi.string().allow(null, ''), // stores file path
    mou: Joi.string().max(45).allow(null, ''),
    IRDAI_no: Joi.string().max(45).allow(null, ''),
    validity_period_start: Joi.date().allow(null),
    validity_period_end: Joi.date().allow(null),
    insurer_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
});

const updateClientJoi = Joi.object({
client_code: Joi.string().alphanum().max(50).allow(null, ''),
    client_name: Joi.string().max(255).optional(),
    client_type: Joi.string().allow(null, '').optional(),
    registered_address: Joi.string().optional().allow(null, ''),
    gst_number: Joi.string().length(15).allow(null, '').optional(),
    pan_number: Joi.string().length(10).allow(null, '').optional(),
    mode_of_payment: Joi.string().allow(null, '').optional(),
    payment_frequency: Joi.string().optional().allow(null, ''),
    is_active: Joi.number().valid(0, 1).optional(),

    // New fields optional on update
    state: Joi.string().max(45).optional().allow(null, ''),
    city: Joi.string().max(45).optional().allow(null, ''),
    pincode: Joi.string().max(45).optional().allow(null, ''),
    country: Joi.string().max(45).optional().allow(null, ''),
    email_id: Joi.string().email().max(45).optional().allow(null, ''),
    email_id_2: Joi.string().email().max(45).optional().allow(null, ''),
    email_id_3: Joi.string().email().max(45).optional().allow(null, ''),
    contact_person_name: Joi.string().max(45).optional().allow(null, ''),
    contact_person_no: Joi.string().max(45).optional().allow(null, ''),
    contact_person_address: Joi.string().max(455).optional().allow(null, ''),
    onboarding_date: Joi.date().optional().allow(null),
    agreement_id: Joi.string().max(45).optional().allow(null, ''),
    invoice_format_upload: Joi.string().optional().allow(null, ''),
    mou: Joi.string().max(45).optional().allow(null, ''),
    IRDAI_no: Joi.string().max(45).optional().allow(null, ''),
    validity_period_start: Joi.date().allow(null).optional(),
    validity_period_end: Joi.date().allow(null).optional(),
    insurer_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
});


const deleteCentersSchema = Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});


router.get('/clients', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder || 'DESC';

        const data = await service.listClients({ 
            page, 
            limit, 
            search,
            sortBy,
            sortOrder
        });
        res.json(data);
    } catch (e) {
        console.error('Error listing clients:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/clients/:id', verifyToken, async (req, res) => {
    try {
        const row = await service.getClient(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/clients', verifyToken, checkRole([1]), mixedUpload.single('invoice_format_upload'), async (req, res) => {
    try {
        // Validate input
        const { error, value } = registerClientJoi.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        if (req.file) {
            value.invoice_format_upload = req.file.path;
        }

        // Call createClient with validated + additional metadata
        const id = await service.createClient({
            ...value,
            created_by: req.user.id // from token
        });

        res.status(201).json({ message: 'Client created successfully', id });

    } catch (e) {
        console.error('Error creating client:', e);

        // Check for duplicate entry error code from MySQL
        if (e.code === 'ER_DUP_ENTRY' && e.sqlMessage.includes('client_code')) {
            return res.status(409).json({ message: 'Client code already exists. Please use a unique client code.' });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
});



router.put('/clients/:id', verifyToken, checkRole([1]), mixedUpload.single('invoice_format_upload'), async (req, res) => {
    try {
        delete req.body.client_code;

        const { error, value } = updateClientJoi.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

         // Debug logging
        console.log('Received insurer_ids:', value.insurer_ids);
        console.log('Type of insurer_ids:', typeof value.insurer_ids);

        
          // Handle file upload
        if (req.file) {
            value.invoice_format_upload = req.file.path;
        } else if (req.body.invoice_format_upload === '') {
            value.invoice_format_upload = null;
        }


        const affected = await service.updateClient(req.params.id, value);
        if (!affected) return res.status(404).json({ message: 'Not found or no changes made' });

        res.json({ updated: affected });
    } catch (e) {
        console.error('Error updating client:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// softdelete
router.post('/clients/delete', verifyToken, checkRole([1]), async (req, res) => {
    const { error, value } = deleteCentersSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const affected = await service.softDeleteClients(value.ids);
    if (!affected) {
        return res.status(404).json({ message: 'No Clients were found or already deleted' });
    }

    res.json({ message: 'Clients deleted successfully', updated: affected });
});


router.delete('/clients/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const affected = await service.deleteClient(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Not found' });
        res.json({ deleted: affected });
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;


