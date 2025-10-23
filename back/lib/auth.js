const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const SECRET_KEY = process.env.JWT_SECRET || 'fgdfgdfgdfgdfgdfgdfgdfgdfgdfgdfg'; 

const generateToken = (user) => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ id: user.id, role_id: user.role_id }, SECRET_KEY, { expiresIn });
};



const verifyCaptcha = async (token) => {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
            secret,
            response: token,
        },
    });

    return response.data; // { success, score, action, challenge_ts, hostname }
};


const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified; // { id, role_id }
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const checkRole = (roleIds) => (req, res, next) => {
    if (!roleIds.includes(req.user.role_id)) {
        return res.status(403).json({ message: 'Access Denied: No Permissions' });
    }
    next();
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = {
    generateToken,
    verifyToken,
    checkRole,
    hashPassword,
    comparePassword,
    verifyCaptcha
};




