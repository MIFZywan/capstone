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
                photo: data.photo, // Tambahkan field photo
                rating: data.rating, // Tambahkan field rating
                description: data.description, // Tambahkan field description
                lat: data.lat,
                lon: data.lon,
                environment: data.environment,
                scenery: data.scenery,
                category: data.category,
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

async function getTopWisata() {
    try {
        const snapshot = await db.collection('wisata').orderBy('rating', 'desc').limit(10).get();
        const topWisata = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            topWisata.push({
                id: doc.id,
                name: data.name,
                environment: data.environment,
                scenery: data.scenery,
                category: data.category,
                photo: data.photo,
                rating: data.rating,
                description: data.description
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
                environment: data.environment,
                scenery: data.scenery,
                category: data.category,
                photo: data.photo,
                rating: data.rating,
                description: data.description,
                location: data.location
            });
        });

        allWisata.sort((a, b) => {
            const distanceA = Math.sqrt(Math.pow(a.location.lat - userLat, 2) + Math.pow(a.location.lng - userLng, 2));
            const distanceB = Math.sqrt(Math.pow(b.location.lat - userLat, 2) + Math.pow(b.location.lng - userLng, 2));
            return distanceA - distanceB;
        });

        return allWisata.slice(0, 10);
    } catch (error) {
        throw new Error(`Failed to get nearest wisata: ${error.message}`);
    }
}

async function getWisataByFilters(filters) {
    try {
        let data = [];
        const {
            name,
            environment,
            scenery,
            category
        } = filters;

        if (name && environment) {
            data = (await getWisataByName(name)).filter(item => item.environment === environment);
        } else if (name && scenery) {
            data = (await getWisataByName(name)).filter(item => item.scenery === scenery);
        } else if (name && category) {
            data = (await getWisataByName(name)).filter(item => item.category === category);
        } else if (environment && scenery) {
            data = (await getWisataByEnvironment(environment)).filter(item => item.scenery === scenery);
        } else if (environment && category) {
            data = (await getWisataByEnvironment(environment)).filter(item => item.category === category);
        } else if (scenery && category) {
            data = (await getWisataByScenery(scenery)).filter(item => item.category === category);
        } else {
            throw new Error("Please provide exactly two filters");
        }

        return data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));
    } catch (error) {
        throw new Error(`Failed to get wisata by filters: ${error.message}`);
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
    getNearestWisata,
    getWisataByFilters
};