require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);
const io = socketIo(server, {
    cors: {
        origin: '*', //  Allow all origins (change this in production)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

app.use(cors());

// app.use((req,res,next)=>{
//     console.log("hii",req.headers)
//     next();
// });


const userRoutes = require('./routes/r_user');
const clientRoutes = require('./routes/r_clients');
const centerRoutes = require('./routes/r_centers');
const insurerRoutes = require('./routes/r_insurers');
const testCategoryRoutes = require('./routes/r_test_categories');
const testRoutes = require('./routes/r_tests');
const technicianRoutes = require('./routes/r_technicians');
const appointmentRoutes = require('./routes/r_appointments');
const reportTypeRoutes = require('./routes/r_report_types');
const testRateRoutes = require('./routes/r_test_rates');
const roles = require('./routes/r_roles');

// Middleware
// Placeholder for future webhooks

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Placeholder for routes
app.get('/', (req, res) => {
    res.send('CRM Backend is running!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api', userRoutes);
app.use('/api', clientRoutes);
app.use('/api', centerRoutes);
app.use('/api', insurerRoutes);
app.use('/api', testCategoryRoutes);
app.use('/api', testRoutes);
app.use('/api', technicianRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', reportTypeRoutes);
app.use('/api', testRateRoutes);
app.use('/api',roles);

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



