const express = require('express');
const bcrypt = require('bcrypt');
const {
    register,
    login,
    update,
    logout
} = require('../controllers/authController');
const {
    db
} = require('../utils/firebase');
const { user } = require('firebase-functions/v1/auth');

const router = express.Router();


router.use(express.urlencoded({
    extended: true
}));
router.use(express.json());

// kurang menambahkan jwt

// User Registration Route
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword,
            username
        } = req.body;

        // data tidak boleh kosong
        if (!email || !password || !confirmPassword || !username) {
            return res.status(400).json({
                "error": true,
                message: 'Please fill in all fields!'
            });
        }

        // password tidak sama
        if (password !== confirmPassword) {
            return res.status(400).json({
                "error": true,
                message: 'Passwords do not match!'
            });
        }

        // ngecek apakah sudah ada email yang terdaftar
        const userExists = await db.collection('users').where('email', '==', email).get();

        // user telah terdaftar
        if (!userExists.empty) {
            return res.status(400).json({
                "error": true,
                message: 'User already exists. Please login.'
            });
        }

        // enkripsi
        const hashedPassword = await bcrypt.hash(password, 10);

        // mendaftarkan user ke auth firebase
        const userId = await register(email, hashedPassword, username);

        // memasukan semua data ke firestore
        await db.collection('users').doc(userId).set({
            username,
            email,
            password: hashedPassword, // Store hashed password, not plain text
        });

        res.status(200).json({
            "error": false,
            message: 'User Created',
        });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({
            "error": true,
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
                "error": true,
                message: 'Please provide email and password!'
            });
        }

        const userData = await db.collection('users').where('email', '==', email).get();

        if (userData.empty) {
            return res.status(400).json({
                "error": true,
                message: 'User not found'
            });
        }

        const hashedPassword = userData.docs[0].data().password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            return res.status(400).json({
                "error": true,
                message: 'Incorrect password'
            });
        }

        res.status(200).json({
            "error": false,
            message: 'Login successful!'
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({
            "error": true,
            message: 'Login failed: ' + error.message
        });
    }
});

// update user
router.put('/users/:id', async (req, res) => {
    try {
        const uid = req.params.id;
        const {
            username,
            password
        } = req.body;

        // Validate input
        if (!username && !password) {
            return res.status(400).json({
                "error": true,
                message: 'Please provide a username or password to update!'
            });
        }

        // Update user information
        await update(uid, {
            username,
            password
        });

        res.status(200).json({
            "error": false,
            message: 'User updated successfully!'
        });
    } catch (error) {
        console.error('Update failed:', error);
        res.status(500).json({
            "error": true,
            message: 'Update failed: ' + error.message
        });
    }
});

// User Logout Route
router.post('/logout', async (req, res) => {
    try {
        await logout();
        res.status(200).json({
            "error": false,
            message: 'Logout successful!'
        });
    } catch (error) {
        console.error('Logout failed:', error);
        res.status(500).json({
            "error": true,
            message: 'Logout failed: ' + error.message
        });
    }
});

module.exports = router;