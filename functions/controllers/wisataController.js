const {
    db
} = require("../utils/firebase");

async function createWisata(data) {
    try {
        const newData = {
            id: data.id,
            name: data.name,
            photo: data.photo,
            rating: data.rating,
            description: data.description,
            environment: data.environment,
            scenery: data.scenery,
            category: data.category
        };
        await db.collection('wisata').doc(`/${data.id}/`).create(newData);
    } catch (error) {
        throw error;
    }
}


async function getAllWisata() {
    try {
        const snapshot = await db.collection('wisata').get();
        const allWisata = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allWisata.push({
                id: doc.id,
                name: data.name,
                environment: data.environment,
                scenery: data.scenery,
                category: data.category,
                photo: data.photo, // Tambahkan field photo
                rating: data.rating, // Tambahkan field rating
                description: data.description // Tambahkan field description
            });
        });
        return allWisata;
    } catch (error) {
        throw new Error(`Failed to get all wisata: ${error.message}`);
    }
}

async function updateWisata(id, data) {
    try {
        const documentRef = db.collection('wisata').doc(id);
        await documentRef.update(data);
        return true;
    } catch (error) {
        throw error;
    }
}

async function deleteWisata(id) {
    try {
        const documentRef = db.collection('wisata').doc(id);
        await documentRef.delete();
        return true;
    } catch (error) {
        throw error;
    }
}

async function getWisataByName(name) {
    try {
        const snapshot = await db.collection('wisata').where('name', '==', name).get();
        const wisataByName = [];
        snapshot.forEach(doc => {
            wisataByName.push(doc.data());
        });
        return wisataByName;
    } catch (error) {
        throw new Error(`Failed to get wisata by name: ${error.message}`);
    }
}

async function getWisataByEnvironment(environment) {
    try {
        const snapshot = await db.collection('wisata').where('environment', '==', environment).get();
        const wisataByEnvironment = [];
        snapshot.forEach(doc => {
            wisataByEnvironment.push(doc.data());
        });
        return wisataByEnvironment;
    } catch (error) {
        throw new Error(`Failed to get wisata by environment: ${error.message}`);
    }
}

async function getWisataByScenery(scenery) {
    try {
        const snapshot = await db.collection('wisata').where('scenery', '==', scenery).get();
        const wisataByScenery = [];
        snapshot.forEach(doc => {
            wisataByScenery.push(doc.data());
        });
        return wisataByScenery;
    } catch (error) {
        throw new Error(`Failed to get wisata by scenery: ${error.message}`);
    }
}

async function getWisataByCategory(category) {
    try {
        const snapshot = await db.collection('wisata').where('category', '==', category).get();
        const wisataByCategory = [];
        snapshot.forEach(doc => {
            wisataByCategory.push(doc.data());
        });
        return wisataByCategory;
    } catch (error) {
        throw new Error(`Failed to get wisata by category: ${error.message}`);
    }
}

module.exports = {
    createWisata,
    getAllWisata,
    updateWisata,
    deleteWisata,
    getWisataByName,
    getWisataByEnvironment,
    getWisataByScenery,
    getWisataByCategory
};