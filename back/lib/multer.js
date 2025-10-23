// upload.js
const multer = require('multer');
const path = require('path');

// Memory storage (can use diskStorage if needed)
const memoryStorage = multer.memoryStorage();

// Disk storage for PDFs or other files
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Image upload (JPEG, PNG, GIF)
const imageUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const mimetype = allowed.test(file.mimetype);
        const extname = allowed.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});

// PDF upload
const pdfUpload = multer({
    storage: diskStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max (adjust as needed)
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            return cb(null, true);
        }
        cb(new Error('Only PDF files are allowed'));
    }
});

// Excel Upload Middleware
const excelUpload = multer({
    storage: diskStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['.xls', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            return cb(null, true);
        }
        cb(new Error('Only Excel files (.xls, .xlsx) are allowed'));
    }
});


const mixedUpload = multer({
    storage: diskStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF or image files are allowed'));
        }
    }
});


const upload = multer({ 
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or image files are allowed'));
    }
  }
});

module.exports = {
    imageUpload,
    pdfUpload,
    excelUpload,
    mixedUpload,
    upload
};
