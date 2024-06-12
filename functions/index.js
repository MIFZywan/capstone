const functions = require("firebase-functions");
const express = require('express');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const wisataRoutes = require('./routes/wisataRoutes');

const app = express();

app.use(cors({
    origin: true
}));
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/wisata', wisataRoutes);

exports.app = functions.https.onRequest(app);
