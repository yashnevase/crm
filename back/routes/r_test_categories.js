const express = require('express')
const router = express.Router()
const service = require('../services/s_test_categories')
const Joi = require('joi')
const { verifyToken, checkRole } = require('../lib/auth')

const createCategoryJoi = Joi.object({
    category_name: Joi.string().max(255).required(),
    description: Joi.string().allow(null, ''),
    is_active: Joi.number().valid(0, 1).default(1),
    test_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
})

const updateCategoryJoi = Joi.object({
    category_name: Joi.string().max(255).optional(),
    description: Joi.string().allow(null, '').optional(),
    is_active: Joi.number().valid(0, 1).optional(),
    test_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
})

const softDeleteCategoryJoi = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).required(),
});




router.get('/category', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 0
        const search = req.query.q || ''
        const sortBy = req.query.sortBy || 'id'
        const sortOrder = req.query.sortOrder || 'DESC'

        const data = await service.listCategories({ 
            page, 
            limit, 
            search,
            sortBy,
            sortOrder
        })
        res.json(data)
    } catch (e) {
        console.error('Error listing categories:', e)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.get('/category/:id', verifyToken, async (req, res) => {
    try {
        const row = await service.getCategory(req.params.id)
        if (!row) return res.status(404).json({ message: 'Not found' })
        res.json(row)
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post('/category', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = createCategoryJoi.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        const id = await service.createCategory(value)
        res.status(201).json({ message: 'Category created successfully', id })
    } catch (e) {
        console.error('Error creating category:', e)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.put('/category/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const { error, value } = updateCategoryJoi.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        const affected = await service.updateCategory(req.params.id, value)
        if (!affected) return res.status(404).json({ message: 'Not found or no changes made' })

        res.json({ updated: affected })
    } catch (e) {
        console.error('Error updating category:', e)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.delete('/category/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const affected = await service.deleteCategory(req.params.id)
        if (!affected) return res.status(404).json({ message: 'Not found' })
        res.json({ deleted: affected })
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' })
    }
})



// softdelete
router.post('/category/delete', verifyToken, checkRole([1]), async (req, res) => {
  const { error, value } = softDeleteCategoryJoi.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const affected = await service.softDeleteCategory(value.ids);
  if (!affected) {
    return res.status(404).json({ message: 'No category were found or already deleted' });
  }

  res.json({ message: 'category soft deleted successfully', updated: affected });
});




module.exports = router