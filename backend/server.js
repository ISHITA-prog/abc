// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from 'uploads' directory

// Database Connection Pool
// const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password',
    database: 'vendor_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Files will be stored in the 'uploads/' directory
    },
    filename: (req, file, cb) => {
        // Use a unique filename to prevent collisions
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden (invalid token)
        }
        req.user = user; // Attach user payload to request
        next();
    });
};

// --- API Routes ---

// 1. User Registration
app.post('/api/auth/register', async (req, res) => {
    const { email, mobileNumber, password, companyName, companyAddress, legalStructure, panNumber, gstin } = req.body;

    // Basic validation
    if (!email || !mobileNumber || !password || !companyName) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const uniqueId = `VEN-${Date.now()}`; // Simple unique ID generation

        const [result] = await pool.execute(
            'INSERT INTO users (unique_id, email, mobile_number, password, company_name, company_address, legal_structure, pan_number, gstin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [uniqueId, email, mobileNumber, hashedPassword, companyName, companyAddress, legalStructure, panNumber, gstin]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId, uniqueId: uniqueId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email, mobile number, PAN, or GSTIN already registered.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, uniqueId: user.unique_id, isDmOfficial: user.is_dm_official },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({ message: 'Login successful', token: token, user: { id: user.id, uniqueId: user.unique_id, email: user.email, isDmOfficial: user.is_dm_official } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// 3. Get User Profile (Protected Route)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, unique_id, email, mobile_number, company_name, company_address, legal_structure, pan_number, gstin, is_dm_official FROM users WHERE id = ?', [req.user.id]);
        const userProfile = rows[0];

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(userProfile);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// 4. Submit Application Form
// Use upload.array('documents', 5) for multiple files (max 5) or upload.single('document') for one file
app.post('/api/applications/submit', authenticateToken, upload.array('documents', 5), async (req, res) => {
    const { department, formData } = req.body; // formData will be a JSON string from frontend
    const userId = req.user.id;
    const files = req.files;

    if (!department || !formData || !files || files.length === 0) {
        // Clean up uploaded files if validation fails
        if (files) {
            files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(400).json({ message: 'Missing department, form data, or documents' });
    }

    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool
        await connection.beginTransaction(); // Start a transaction

        // Insert application
        const [appResult] = await connection.execute(
            'INSERT INTO applications (user_id, department, form_data) VALUES (?, ?, ?)',
            [userId, department, formData]
        );
        const applicationId = appResult.insertId;

        // Insert document metadata
        for (const file of files) {
            await connection.execute(
                'INSERT INTO documents (application_id, file_name, file_path, mime_type) VALUES (?, ?, ?, ?)',
                [applicationId, file.originalname, file.path, file.mimetype]
            );
        }

        await connection.commit(); // Commit the transaction
        res.status(201).json({ message: 'Application submitted successfully', applicationId: applicationId });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Rollback on error
        }
        // Clean up uploaded files if transaction fails
        if (files) {
            files.forEach(file => fs.unlinkSync(file.path));
        }
        console.error('Application submission error:', error);
        res.status(500).json({ message: 'Server error during application submission' });
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
});

// 5. Get User's Applications (Protected Route)
app.get('/api/user/applications', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [applications] = await pool.execute(
            'SELECT id, department, status, created_at FROM applications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(applications);
    } catch (error) {
        console.error('Fetch applications error:', error);
        res.status(500).json({ message: 'Server error fetching applications' });
    }
});

// 6. Get Single Application Details (Protected Route - for vendor or official)
app.get('/api/applications/:id', authenticateToken, async (req, res) => {
    const applicationId = req.params.id;
    const userId = req.user.id;
    const isDmOfficial = req.user.isDmOfficial;

    try {
        let query = 'SELECT a.id, a.user_id, a.department, a.form_data, a.status, a.rejection_reason, a.created_at, u.unique_id as vendor_unique_id, u.company_name FROM applications a JOIN users u ON a.user_id = u.id WHERE a.id = ?';
        let params = [applicationId];

        // If not a DMRC official, ensure they can only see their own applications
        if (!isDmOfficial) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }

        const [applications] = await pool.execute(query, params);
        const application = applications[0];

        if (!application) {
            return res.status(404).json({ message: 'Application not found or unauthorized' });
        }

        // Fetch associated documents
        const [documents] = await pool.execute('SELECT id, file_name, file_path, mime_type FROM documents WHERE application_id = ?', [applicationId]);
        application.documents = documents.map(doc => ({
            id: doc.id,
            fileName: doc.file_name,
            // Provide a URL to access the file
            fileUrl: `${req.protocol}://${req.get('host')}/${doc.file_path.replace(/\\/g, '/')}`
        }));

        res.json(application);
    } catch (error) {
        console.error('Fetch single application error:', error);
        res.status(500).json({ message: 'Server error fetching application details' });
    }
});

// 7. DMRC Official: Get All Applications (Protected & Admin-only)
app.get('/api/dm/applications', authenticateToken, async (req, res) => {
    if (!req.user.isDmOfficial) {
        return res.status(403).json({ message: 'Access denied. DMRC Official privilege required.' });
    }

    try {
        // Fetch all applications with basic user info
        const [applications] = await pool.execute(
            'SELECT a.id, a.department, a.status, a.created_at, u.unique_id as vendor_unique_id, u.company_name FROM applications a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
        );
        res.json(applications);
    } catch (error) {
        console.error('Fetch all applications error:', error);
        res.status(500).json({ message: 'Server error fetching all applications' });
    }
});

// 8. DMRC Official: Update Application Status (Protected & Admin-only)
app.put('/api/dm/applications/:id/status', authenticateToken, async (req, res) => {
    if (!req.user.isDmOfficial) {
        return res.status(403).json({ message: 'Access denied. DMRC Official privilege required.' });
    }

    const applicationId = req.params.id;
    const { status, rejectionReason } = req.body;

    // Validate status
    const validStatuses = ['Pending Verification', 'Clarification Requested', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        await pool.execute(
            'UPDATE applications SET status = ?, rejection_reason = ? WHERE id = ?',
            [status, rejectionReason, applicationId]
        );
        res.json({ message: 'Application status updated successfully.' });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error updating application status.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
