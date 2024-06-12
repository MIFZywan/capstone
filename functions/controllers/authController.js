const {
    auth
} = require("../utils/firebase");
const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} = require("firebase/auth");
const bcrypt = require('bcrypt');


// register
async function register(email, password) {
    try {
        // Hash password sebelum membuat pengguna baru
        const hashedPassword = await bcrypt.hash(password, 10);

        // Buat pengguna baru dengan email dan password yang di-hash
        const userCredential = await createUserWithEmailAndPassword(auth, email, hashedPassword);

        // Mengembalikan UID pengguna yang baru dibuat
        return userCredential.user.uid;
    } catch (error) {
        throw error;
    }
}


// login
async function login(email, password) {
    try {
        // Ambil data pengguna berdasarkan email
        const userData = await db.collection("users").where("email", "==", email).get();

        if (userData.empty) {
            throw new Error("Email tidak ditemukan");
        }

        // Ambil password yang sudah di-hash dari data pengguna
        const hashedPassword = userData.docs[0].data().password;

        // Bandingkan password yang dimasukkan dengan password yang sudah di-hash
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            throw new Error("Password salah");
        }

        // Lakukan login menggunakan Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Mengembalikan UID pengguna yang berhasil login
        return userCredential.user.uid;
    } catch (error) {
        throw error;
    }
}

async function update(username){
    
}

// logout
async function logout() {
    try {
        // Sign out pengguna yang sedang login
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    register,
    login,
    logout
};