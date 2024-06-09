const express = require('express');
const bcrypt = require('bcrypt');
const {
    register,
    login,
    logout
} = require('../controllers/authController');
const {
    db
} = require('../utils/firebase');

const router = express.Router();


router.use(express.urlencoded({
    extended: true
}));

// User Registration Route
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword,
            username
        } = req.body;

        if (!email || !password || !confirmPassword || !username) {
            return res.status(400).json({
                message: 'Please fill in all fields!'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match!'
            });
        }

        const userExists = await db.collection('users').where('email', '==', email).get();

        if (!userExists.empty) {
            return res.status(400).json({
                message: 'User already exists. Please login.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await register(email, hashedPassword, username);

        await db.collection('users').doc(userId).set({
            username,
            email,
            password: hashedPassword, // Store hashed password, not plain text
        });

        res.status(200).json({
            message: 'Registration Successful!'
        });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({
            message: 'Registration failed: ' + error.message
        });
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password!'
            });
        }

        const userData = await db.collection('users').where('email', '==', email).get();

        if (userData.empty) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        const hashedPassword = userData.docs[0].data().password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            return res.status(400).json({
                message: 'Incorrect password'
            });
        }

        res.status(200).json({
            message: 'Login successful!'
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({
            message: 'Login failed: ' + error.message
        });
    }
});

// User Logout Route
router.post('/logout', async (req, res) => {
    try {
        await logout();
        res.status(200).json({
            message: 'Logout successful!'
        });
    } catch (error) {
        console.error('Logout failed:', error);
        res.status(500).json({
            message: 'Logout failed: ' + error.message
        });
    }
});

module.exports = router;