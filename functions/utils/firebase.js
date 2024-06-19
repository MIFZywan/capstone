const admin = require("firebase-admin");
const {
    initializeApp
} = require("firebase/app");
const {
    getAuth
} = require("firebase/auth");
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

var serviceAccount = require(process.env.SERVICE_ACCOUNT_PATH);

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = getAuth(firebaseApp);

module.exports = {
    db,
    auth
};
