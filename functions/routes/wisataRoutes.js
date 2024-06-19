const express = require('express');
const axios = require('axios');
const {
    db
} = require("../utils/firebase");
const {
    nanoid
} = require('nanoid');
const dotenv = require('dotenv');
const {
    getAllWisata,
    updateWisata,
    deleteWisata,
    getTopWisata,
    getWisataByName,
    getWisataByEnvironment,
    getWisataByScenery,
    getWisataByCategory,
    getWisata
} = require('../controllers/wisataController');

dotenv.config();

const router = express.Router();

// Middleware untuk parsing body dengan format x-www-form-urlencoded
router.use(express.urlencoded({
    extended: true
}));

// create wisata
router.post('/create', async (req, res) => {
    try {
        const id = nanoid();
        // request body nama
        const {
            name
        } = req.body;
        // cek body request tidak boleh kosong!
        if (!name) {
            return res.status(400).json({
                error: "All fields must be filled"
            });
        }

        // apiKey dari gmaps api
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        // untuk mendapatkan data berdasarkan nama dari request body, berdasarkan region:ID (indonesia)
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=photos,formatted_address,name,rating,geometry&key=${apiKey}&region=ID`);

        if (response.data.status !== 'OK') {
            return res.status(400).json({
                error: true,
                message: response.data.error_message || 'Error while searching for wisata data'
            });
        }

        const place = response.data.candidates[0];

        if (!place) {
            return res.status(404).json({
                error: true,
                message: 'Wisata not found'
            });
        }

        const newData = {
            id,
            name: place.name,
            photoURL: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}` : '',
            rating: place.rating || 'No rating',
            description: place.formatted_address || 'No description',
            lat: place.geometry.location.lat || 'No lat',
            lon: place.geometry.location.lng || 'No lon',
        };

        // mengirim data ke firestore
        await db.collection('wisata').doc(id).set(newData);

        // respone body
        return res.status(200).json({
            error: false,
            message: "Wisata create successfully",
            data: newData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            error: error.message
        });
    }
});

// Get Top Places
router.get('/top', async (req, res) => {
    try {
        const topWisata = await getTopWisata();
        return res.status(200).json({
            error: false,
            message: "Wisata fetched successfully",
            data: topWisata
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            error: error.message
        });
    }
});

// Get Nearest Places
router.get('/nearest', async (req, res) => {
    try {
        const {
            lat,
            lng
        } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                error: "Lat and Lng must be filled"
            });
        }
        const nearestWisata = await getNearestWisata(parseFloat(lat), parseFloat(lng));
        return res.status(200).json(nearestWisata);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('wisata').get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        const filteredData = [];
        snapshot.forEach(doc => {
            const wisata = {
                id: doc.id,
                name: doc.data().name,
                photoURL: doc.data().photoURL,
                rating: doc.data().rating,
                description: doc.data().description,
                lat: doc.data().lat,
                lon: doc.data().lon,
                environment_classes: doc.data().environment_classes,
                scenery_classes: doc.data().scenery_classes,
                category_classes: doc.data().category_classes
            };
            filteredData.push(wisata);
        });

        filteredData.sort((a, b) => a.name.localeCompare(b.name));

        return res.status(200).json({
            error: false,
            message: "Wisata fetched successfully",
            data: filteredData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: 'Failed to retrieve wisata',
            error: error.message
        });
    }
});

// Method to retrieve tourist spots by name
router.get('/name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const snapshot = await db.collection('wisata').where('name', '==', name).get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        const filteredData = [];
        snapshot.forEach(doc => {
            const wisata = {
                id: doc.id,
                name: doc.data().name,
                photoURL: doc.data().photoURL,
                rating: doc.data().rating,
                description: doc.data().description,
                lat: doc.data().lat,
                lon: doc.data().lon,
                environment_classes: doc.data().environment_classes,
                scenery_classes: doc.data().scenery_classes,
                category_classes: doc.data().category_classes
            };
            filteredData.push(wisata);
        });

        return res.status(200).json({
            error: false,
            message: "Wisata fetched successfully",
            data: filteredData
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});



router.get('/environment/:environment', async (req, res) => {
    try {
        const environment = req.params.environment;
        if (!environment) {
            return res.status(400).json({
                error: "Environment parameter is required"
            });
        }
        const snapshot = await db.collection('wisata').where('environment_classes', '==', environment).get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        const filteredData = [];
        snapshot.forEach(doc => {
            const wisata = {
                id: doc.id,
                name: doc.data().name,
                photoURL: doc.data().photoURL,
                rating: doc.data().rating,
                description: doc.data().description,
                lat: doc.data().lat,
                lon: doc.data().lon,
                environment_classes: doc.data().environment_classes,
                scenery_classes: doc.data().scenery_classes,
                category_classes: doc.data().category_classes
            };
            filteredData.push(wisata);
        });

        return res.status(200).json({
            error: false,
            message: "Wisata fetched successfully",
            data: filteredData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});


router.get('/scenery/:scenery', async (req, res) => {
    try {
        const scenery = req.params.scenery;
        if (!scenery) {
            return res.status(400).json({
                error: "Scenery parameter is required"
            });
        }
        const snapshot = await db.collection('wisata').where('scenery_classes', '==', scenery).get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        const filteredData = [];
        snapshot.forEach(doc => {
            const wisata = {
                id: doc.id,
                name: doc.data().name,
                photoURL: doc.data().photoURL,
                rating: doc.data().rating,
                description: doc.data().description,
                lat: doc.data().lat,
                lon: doc.data().lon,
                environment_classes: doc.data().environment_classes,
                scenery_classes: doc.data().scenery_classes,
                category_classes: doc.data().category_classes
            };
            filteredData.push(wisata);
        });

        return res.status(200).json({
            error: false,
            message: "Wisata fetched successfully",
            data: filteredData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        if (!category) {
            return res.status(400).json({
                error: "Category parameter is required"
            });
        }
        const snapshot = await db.collection('wisata').where('category_classes', '==', category).get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        const filteredData = [];
        snapshot.forEach(doc => {
            const wisata = {
                id: doc.id,
                name: doc.data().name,
                photoURL: doc.data().photoURL,
                rating: doc.data().rating,
                description: doc.data().description,
                lat: doc.data().lat,
                lon: doc.data().lon,
                environment_classes: doc.data().environment_classes,
                scenery_classes: doc.data().scenery_classes,
                category_classes: doc.data().category_classes
            };
            filteredData.push(wisata);
        });

        return res.status(200).json({
            error: false,
            message: "Wisata fetched successfully",
            data: filteredData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

// Method to update tourist spot by ID
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        // Update data in Firestore
        await db.collection('wisata').doc(id).update(updatedData);

        // Fetch updated tourist spot data
        const snapshot = await db.collection('wisata').doc(id).get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        const updatedWisata = snapshot.data();

        return res.status(200).json({
            error: false,
            message: 'Wisata has been successfully updated',
            data: {
                id: snapshot.id,
                name: updatedWisata.name,
                photo: updatedWisata.photoURL,
                rating: updatedWisata.rating,
                description: updatedWisata.description,
                lat: updatedWisata.lat,
                lon: updatedWisata.lon,
                environment_classes: updatedWisata.environment_classes || '',
                scenery_classes: updatedWisata.scenery_classes || '',
                category_classes: updatedWisata.category_classes || ''
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: 'Failed to update wisata',
            error: error.message
        });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Get the document snapshot
        const snapshot = await db.collection('wisata').doc(id).get();

        // Check if the document exists
        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: 'Wisata not found'
            });
        }

        // Delete the document
        await db.collection('wisata').doc(id).delete();

        return res.status(200).json({
            error: false,
            message: 'Wisata data has been successfully deleted'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: 'Failed to delete wisata data',
            error: error.message
        });
    }
});

module.exports = router;