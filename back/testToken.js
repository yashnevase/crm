const { generateToken } = require('./lib/auth'); // adjust path
const jwt = require('jsonwebtoken');

const user = { id: 2, role_id: 1 };
const token = generateToken(user);
console.log('Token:', token);

const decoded = jwt.decode(token);
console.log('Expires at (epoch seconds):', decoded.exp);
console.log('Current time (epoch seconds):', Math.floor(Date.now() / 1000));
