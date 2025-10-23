const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../lib/auth');
const service = require('../services/s_centers');
const Joi = require('joi');
const { mixedUpload } = require('../lib/multer');

const centerJoiSchema = Joi.object({
  center_code: Joi.string().max(50).allow(null, ''),
  user_id: Joi.number().integer().optional().allow(null, ''),
  center_name: Joi.string().max(255).required(),
  center_type: Joi.string().max(55).required(),
  address: Joi.string().required(),
  owner_name: Joi.string().allow(null, ''),
  contact_number: Joi.string().max(20).allow(null, ''),
  email: Joi.string().email().allow(null, ''),
  city: Joi.string().max(100).allow(null, ''),
  city_type: Joi.string().max(45).allow(null, ''),
  state: Joi.string().max(100).allow(null, ''),
  pincode: Joi.string().allow(null, ''), 
  country: Joi.string().max(45).allow(null, ''),
  gps_latitude: Joi.number().precision(8).allow(null, ''),
  gps_longitude: Joi.number().precision(8).allow(null, ''),
  is_active: Joi.number().valid(0, 1).default(1),
  letterhead_path: Joi.string().max(500).optional().allow(null, ''),

  // associate doctors as JSON strings or objects
  associate_doctor_1_details: Joi.any().allow(null, ''),
  associate_doctor_2_details: Joi.any().allow(null, ''),
  associate_doctor_3_details: Joi.any().allow(null, ''),
  associate_doctor_4_details: Joi.any().allow(null, ''),

  acc_name: Joi.string().max(105).allow(null, ''),
  acc_no: Joi.string().max(105).allow(null, ''),
  ifsc_code: Joi.string().max(105).allow(null, ''),
  receivers_name: Joi.string().max(105).allow(null, ''),
  accredation: Joi.string().max(105).allow(null, '')
});

const centerUpdateJoi = Joi.object({
  center_code: Joi.string().max(50).optional(),
  center_name: Joi.string().max(255).optional(),
  center_type: Joi.string().optional(),
  user_id: Joi.number().integer().optional(),
   owner_name: Joi.string().allow(null, ''),
  address: Joi.string().optional(),
existing_dc_photos: Joi.string().optional().allow(null, ''),
  city: Joi.string().max(100).optional().allow(null, ''),
   city_type: Joi.string().max(45).allow(null, ''),
  state: Joi.string().max(100).optional().allow(null, ''),
  pincode: Joi.string().max(10).optional().allow(null, ''),
  country: Joi.string().max(45).allow(null, ''),
  contact_number: Joi.string().max(20).optional().allow(null, ''),
  email: Joi.string().email().max(255).optional().allow(null, ''),

  gps_latitude: Joi.number().precision(8).optional().allow(null),
  gps_longitude: Joi.number().precision(8).optional().allow(null),

  letterhead_path: Joi.string().max(500).optional().allow(null, ''),

  is_active: Joi.number().valid(0, 1).optional(),
  is_deleted: Joi.number().valid(1).optional(),


  associate_doctor_1_details: Joi.any().allow(null, ''),
  associate_doctor_2_details: Joi.any().allow(null, ''),
  associate_doctor_3_details: Joi.any().allow(null, ''),
  associate_doctor_4_details: Joi.any().allow(null, ''),

  acc_name: Joi.string().max(105).allow(null, ''),
  acc_no: Joi.string().max(105).allow(null, ''),
  ifsc_code: Joi.string().max(105).allow(null, ''),
  receivers_name: Joi.string().max(105).allow(null, ''),
  accredation: Joi.string().max(105).allow(null, '')
})

const deleteCentersSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});


const uploadFields = mixedUpload.fields([
  { name: 'dc_photos', maxCount: 10 },
  { name: 'letterhead_path', maxCount: 1 }
]);


router.get('/centers', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const search = req.query.q || '';
    const sortBy = req.query.sortBy || 'id';
    const sortOrder = req.query.sortOrder || 'DESC';

    const data = await service.listCenters({ 
      page, 
      limit, 
      search,
      sortBy,
      sortOrder
    });
    res.json(data);
  } catch (e) {
    console.error('Error listing centers:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/centers/:id', verifyToken, async (req, res) => {
  try {
    const row = await service.getCenter(req.params.id);
    if (!row) return res.status(404).json({ message: 'Center not found' });
    res.json(row);
  } catch (e) {
    console.error('Error getting center:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// router.post('/centers', verifyToken, checkRole([1]),cpUpload, async (req, res) => {
//   try {
//     const { error, value } = centerJoiSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const parseJsonField = (field) => {
//       if (!field) return null;
//       try {
//         return typeof field === 'object' ? field : JSON.parse(field);
//       } catch {
//         return null;
//       }
//     };


//     const id = await service.createCenter({ ...value, created_by: req.user.id });
//     res.status(201).json({ message: 'Diagnostic Center created successfully', id });
//   } catch (e) {
//     console.error('Error creating center:', e);
//     if (e.code === 'ER_DUP_ENTRY') {
//       res.status(409).json({ message: 'Center code already exists' });
//     } else {
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// });

router.post('/centers', verifyToken, checkRole([1]), uploadFields, async (req, res) => {
  try {
    // req.body fields come as strings, parse JSON if needed (associate_doctor fields)
    const parseJson = (val) => {
      if (!val) return null;
      try {
        return typeof val === 'object' ? val : JSON.parse(val);
      } catch {
        return val; // fallback: keep as string
      }
    };

    const inputData = {
      ...req.body,
      associate_doctor_1_details: parseJson(req.body.associate_doctor_1_details),
      associate_doctor_2_details: parseJson(req.body.associate_doctor_2_details),
      associate_doctor_3_details: parseJson(req.body.associate_doctor_3_details),
      associate_doctor_4_details: parseJson(req.body.associate_doctor_4_details),
    };

    // Validate input
    const { error, value } = centerJoiSchema.validate(inputData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Prepare image paths arrays for dc_photos
    const dcPhotosPaths = (req.files.dc_photos || []).map(file => file.path);
    const letterheadPath = (req.files.letterhead_path && req.files.letterhead_path[0]) ? req.files.letterhead_path[0].path : null;

    // Attach file paths as JSON strings
    const centerData = {
      ...value,
      dc_photos: JSON.stringify(dcPhotosPaths),
      letterhead_path: letterheadPath,
      created_by: req.user.id
    };

    const id = await service.createCenter(centerData);

    res.status(201).json({ message: 'Diagnostic Center created successfully', id });
  } catch (e) {
    console.error('Error creating center:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Center code already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});






// router.put('/centers/:id', verifyToken, checkRole([1]), async (req, res) => {
//   try {
//     const { error, value } = centerUpdateJoi.validate(req.body);
//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     const affected = await service.updateCenter(req.params.id, value);
//     if (!affected) return res.status(404).json({ message: 'Center not found or no changes' });

//     res.json({ updated: affected });
//   } catch (e) {
//     console.error('Error updating center:', e);
//     if (e.code === 'ER_DUP_ENTRY') {
//       res.status(409).json({ message: 'Duplicate center code' });
//     } else {
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// });

router.put('/centers/:id', verifyToken, checkRole([1]), uploadFields, async (req, res) => {
  try {
    // Parse JSON fields if needed (e.g., associate_doctor_X_details)
    const parseJson = (val) => {
      if (!val) return null;
      try {
        return typeof val === 'object' ? val : JSON.parse(val);
      } catch {
        return val; // Fallback: keep as string
      }
    };

    const inputData = {
      ...req.body,
      associate_doctor_1_details: parseJson(req.body.associate_doctor_1_details),
      associate_doctor_2_details: parseJson(req.body.associate_doctor_2_details),
      associate_doctor_3_details: parseJson(req.body.associate_doctor_3_details),
      associate_doctor_4_details: parseJson(req.body.associate_doctor_4_details),
    };

    // Validate input
    const { error, value } = centerUpdateJoi.validate(inputData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Handle file uploads
    const dcPhotosPaths = (req.files?.dc_photos || []).map(file => file.path);
    let existingDcPhotos = [];
    if (req.body.existing_dc_photos) {
      try {
        existingDcPhotos = JSON.parse(req.body.existing_dc_photos);
        if (!Array.isArray(existingDcPhotos)) {
          existingDcPhotos = [];
        }
      } catch (error) {
        console.error('Failed to parse existing_dc_photos:', error);
      }
    }

    // Combine existing and new photos into dc_photos
    const updatedDcPhotos = [...existingDcPhotos, ...dcPhotosPaths];
    const letterheadPath = req.files?.letterhead_path?.[0]?.path || null;

    // Prepare update data, excluding existing_dc_photos
    const updateData = {
      ...value,
      dc_photos: updatedDcPhotos.length > 0 ? JSON.stringify(updatedDcPhotos) : null,
      letterhead_path: letterheadPath || value.letterhead_path || null,
    };

    // Remove existing_dc_photos from updateData to prevent SQL error
    delete updateData.existing_dc_photos;

    const affected = await service.updateCenter(req.params.id, updateData);
    if (!affected) {
      return res.status(404).json({ message: 'Center not found or no changes' });
    }

    res.json({ updated: affected });
  } catch (e) {
    console.error('Error updating center:', e);
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Duplicate center code' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// softdelete
router.post('/centers/delete', verifyToken, checkRole([1]), async (req, res) => {
  const { error, value } = deleteCentersSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const affected = await service.softDeleteCenters(value.ids);
  if (!affected) {
    return res.status(404).json({ message: 'No centers were found or already deleted' });
  }

  res.json({ message: 'Diagnostic Centers soft deleted successfully', updated: affected });
});





router.delete('/centers/:id', verifyToken, checkRole([1]), async (req, res) => {
  try {
    const affected = await service.deleteCenter(req.params.id);
    if (!affected) return res.status(404).json({ message: 'Center not found' });
    res.json({ deleted: affected });
  } catch (e) {
    console.error('Error deleting center:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


