const admin = require("firebase-admin");
const {
    initializeApp
} = require("firebase/app");
const {
    getAuth
} = require("firebase/auth");
var serviceAccount = require("../permission.json");

const firebaseConfig = {
    apiKey: "AIzaSyAnCsuwy6HruGI8jbKiqyAfcN2MlRlau7A",
    authDomain: "project-capstone-bec58.firebaseapp.com",
    projectId: "project-capstone-bec58",
    storageBucket: "project-capstone-bec58.appspot.com",
    messagingSenderId: "361841512958",
    appId: "1:361841512958:web:09296a6bebb6c47725b0af",
    measurementId: "G-CNRS1B7F3Z"
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