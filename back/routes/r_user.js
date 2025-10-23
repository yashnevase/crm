const express = require('express');
const router = express.Router();
const Joi = require('joi');
const s_user = require('../services/s_user');
const { generateToken, verifyToken, checkRole, hashPassword } = require('../lib/auth');
const axios = require('axios');

// Joi schema for user registration
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    full_name: Joi.string().max(100).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    confirmPassword: Joi.string().min(4).optional(),
    role_id: Joi.number().integer().valid(1, 2, 3,4).default(1) ,// 1=Admin, 2=TPA, 3=Center
    is_active: Joi.number().integer().valid(1,0).optional()
});

// Joi schema for user login
const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    captchaToken:Joi.string().required()
});

// Joi schema for user update
const updateSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    full_name: Joi.string().max(100).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(4).optional(),
    role_id: Joi.number().integer().valid(1, 2, 3 ,4).optional(), 
     is_active: Joi.number().integer().valid(1,0).optional()
});

const changePasswordSchema = Joi.object({
    new_password: Joi.string().min(4).required().label('New Password'),
    confirm_new_password: Joi.string().valid(Joi.ref('new_password')).required().label('Confirm Password')
        .messages({ 'any.only': 'Confirm Password must match New Password' }),
})

const deleteUsersSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, email, password, role_id,mobile,full_name } = value;

        const existingUser = await s_user.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this username already exists' });
        }

        const userId = await s_user.addUser(username, email, password, role_id,mobile,full_name);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/login
// router.post('/auth/login', async (req, res) => {
//     try {
//         const { error, value } = loginSchema.validate(req.body);
//         if (error) return res.status(400).json({ message: error.details[0].message });

//         const { username, password } = value;
//         const user = await s_user.getUserByUsername(username);

//         if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//         const isMatch = await s_user.comparePassword(password, user.password_hash);
//         if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//         // Prepare response object
//         const userObj = {
//             id: user.id,
//             username: user.username,
//             email: user.email,
//             role_id: user.role_id,
//             full_name: user.full_name,
//             mobile: user.mobile,
//             is_active: user.is_active,
//             technician_id:user.technician_id,
//             diagnostic_center_id:user.diagnostic_center_id
//         };

//         const token = generateToken(userObj);
//         res.json({ message: 'Logged in successfully', token, user: userObj });
//     } catch (error) {
//         console.error('Error logging in user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


router.post('/auth/login', async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, password, captchaToken } = value;

        if (!captchaToken) {
            return res.status(400).json({ message: 'Captcha token is missing' });
        }

        // Verify the captcha token with Google
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        const captchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret,
                response: captchaToken,
            },
        });

        const captchaResult = captchaResponse.data;

        if (!captchaResult.success) {
            return res.status(403).json({ message: 'Failed captcha verification' });
        }
        
        // Continue with user authentication
        const user = await s_user.getUserByUsername(username);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await s_user.comparePassword(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Prepare response object
        const userObj = {
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id,
            full_name: user.full_name,
            mobile: user.mobile,
            is_active: user.is_active,
            technician_id: user.technician_id,
            diagnostic_center_id: user.diagnostic_center_id,
        };

        const token = generateToken(userObj);
        res.json({ message: 'Logged in successfully', token, user: userObj });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// GET /api/users/me
router.get('/users/me', verifyToken, async (req, res) => {
    try {
        const user = await s_user.getUserById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/users (Admin only)

router.get('/users/Get', verifyToken, checkRole([1,3]), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder || 'DESC';

        const users = await s_user.getAllUsers({ 
            page, 
            limit, 
            search,
            sortBy,
            sortOrder
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// add user

// POST /api/auth/register
router.post('/users/Add', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { username, email, password, role_id,mobile,full_name } = value;

        const existingUser = await s_user.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this username already exists' });
        }

        const userId = await s_user.addUser(username, email, password, role_id,mobile,full_name);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// PUT /api/users/:id - Update user profile
router.put('/users/:id', verifyToken, async (req, res) => {
    try {
        const { error, value } = updateSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const targetUserId = parseInt(req.params.id, 10);
        const requester = req.user;

        // Allow update if admin or user updating their own profile
        if (requester.role_id !== 1 && requester.id !== targetUserId) {
            return res.status(403).json({ message: 'Forbidden: You cannot update this user' });
        }

        const user = await s_user.getUserById(targetUserId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updatedUserId = await s_user.updateUser(targetUserId, value);
        res.json({ message: 'User updated successfully', userId: updatedUserId });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// softdelete
router.post('/users/delete', verifyToken, checkRole([1]), async (req, res) => {
  const { error, value } = deleteUsersSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const affected = await s_user.softDeleteUser(value.ids);
  if (!affected) {
    return res.status(404).json({ message: 'No users were found or already deleted' });
  }

  res.json({ message: 'users soft deleted successfully', updated: affected });
});


// change password

router.put('/change-password/:id', verifyToken, async (req, res) => {
    try {
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { new_password } = value;
        const targetUserId = parseInt(req.params.id, 10);
        const requester = req.user;

        // Only allow admin or the user themselves
        if (requester.role_id !== 1 && requester.id !== targetUserId) {
            return res.status(403).json({ message: 'Forbidden: You cannot update this user' });
        }

        const user = await s_user.getUserById(targetUserId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await s_user.changePassword(targetUserId, new_password);

        return res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;








