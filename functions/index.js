const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./permission.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const express = require('express');
const app = express();
const db = admin.firestore();

const cors = require("cors");
app.use(cors({
    origin: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Route
app.get('/hello-world', (req, res) => {
    return res.status(200).send('Hello World');
});

// Create
app.post('/wisata/create', async (req, res) => {
    try {
        await db.collection('wisata').doc('/' + req.body.id + '/')
            .create({
                name: req.body.name, // Fixed typo here
                scenery: req.body.scenery,
                environment: req.body.environment,
                category: req.body.category,
            });

        return res.status(200).send({
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: error.message
        });
    }
});

// Read
app.get('/wisata/:id', async (req, res) => {
    try {
        const document = db.collection('wisata').doc(req.params.id);
        const item = await document.get();
        if (!item.exists) {
            return res.status(404).send({
                error: 'Document not found'
            });
        }
        return res.status(200).send(item.data());
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: error.message
        });
    }
});

// Update
app.put('/wisata/:id', async (req, res) => {
    try {
        const document = db.collection('wisata').doc(req.params.id);
        await document.update(req.body);
        return res.status(200).send({
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: error.message
        });
    }
});

// Delete
app.delete('/wisata/:id', async (req, res) => {
    try {
        const document = db.collection('wisata').doc(req.params.id);
        await document.delete();
        return res.status(200).send({
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            error: error.message
        });
    }
});

// Export the API to Firebase Cloud Function
exports.app = functions.https.onRequest(app);
