const {
    db
} = require("../utils/firebase");

// Function to filter out undefined values from an object
function filterUndefinedValues(data) {
    return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
}

async function createWisata(data) {
    try {
        const filteredData = filterUndefinedValues(data);
        await db.collection('wisata').doc(data.id).set(filteredData);
    } catch (error) {
        throw new Error(`Failed to create wisata: ${error.message}`);
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
                photo: data.photo,
                rating: data.rating,
                description: data.description,
                lat: data.lat,
                lon: data.lon,
                environment_classes: data.environment_classes,
                scenery_classes: data.scenery_classes,
                category_classes: data.category_classes,
            });
        });
        return allWisata;
    } catch (error) {
        throw new Error(`Failed to get all wisata: ${error.message}`);
    }
}

async function updateWisata(id, data) {
    try {
        const filteredData = filterUndefinedValues(data);
        const documentRef = db.collection('wisata').doc(id);
        await documentRef.update(filteredData);
        return true;
    } catch (error) {
        throw new Error(`Failed to update wisata: ${error.message}`);
    }
}

async function deleteWisata(id) {
    try {
        const documentRef = db.collection('wisata').doc(id);
        await documentRef.delete();
        return true;
    } catch (error) {
        throw new Error(`Failed to delete wisata: ${error.message}`);
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

async function getWisataByEnvironment(environment_classes) {
    try {
        const snapshot = await db.collection('wisata').where('environment_classes', '==', environment_classes).get();
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
        const snapshot = await db.collection('wisata').where('scenery_classes', '==', scenery).get();
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
        const snapshot = await db.collection('wisata').where('category_classes', '==', category).get();
        const wisataByCategory = [];
        snapshot.forEach(doc => {
            wisataByCategory.push(doc.data());
        });
        return wisataByCategory;
    } catch (error) {
        throw new Error(`Failed to get wisata by category: ${error.message}`);
    }
}

async function getTopWisata() {
    try {
        const snapshot = await db.collection('wisata').orderBy('rating', 'desc').limit(10).get();
        const topWisata = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            topWisata.push({
                id: doc.id,
                name: data.name,
                photo: data.photo,
                rating: data.rating,
                description: data.description,
                lat: data.lat,
                lon: data.lon,
                environment: data.environment_classes,
                scenery: data.scenery_classes,
                category: data.category_classes,
            });
        });
        return topWisata;
    } catch (error) {
        throw new Error(`Failed to get top wisata: ${error.message}`);
    }
}

async function getNearestWisata(userLat, userLng) {
    try {
        const snapshot = await db.collection('wisata').get();
        const allWisata = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allWisata.push({
                id: doc.id,
                name: data.name,
                photo: data.photo,
                rating: data.rating,
                description: data.description,
                lat: data.lat,
                lon: data.lon,
                environment: data.environment_classes,
                scenery: data.scenery_classes,
                category: data.category_classes,
            });
        });

        allWisata.sort((a, b) => {
            const distanceA = Math.sqrt(Math.pow(a.lat - userLat, 2) + Math.pow(a.lon - userLng, 2));
            const distanceB = Math.sqrt(Math.pow(b.lat - userLat, 2) + Math.pow(b.lon - userLng, 2));
            return distanceA - distanceB;
        });

        return allWisata.slice(0, 10);
    } catch (error) {
        throw new Error(`Failed to get nearest wisata: ${error.message}`);
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
    getWisataByCategory,
    getTopWisata,
    getNearestWisata
};
