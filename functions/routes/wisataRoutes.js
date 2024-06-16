const express = require('express');
const axios = require('axios');
const {
    db
} = require("../utils/firebase");
const {
    nanoid
} = require('nanoid');
const {
    // createWisata, //di create wisata ini tidak menggunakan fungsi controllernya ya!
    getAllWisata,
    updateWisata,
    deleteWisata,
    getWisataByName,
    getWisataByEnvironment,
    getWisataByScenery,
    getWisataByCategory,
    getWisata
} = require('../controllers/wisataController');

const router = express.Router();

// Middleware untuk parsing body dengan format x-www-form-urlencoded
router.use(express.urlencoded({
    extended: true
}));

// create wisata
router.post('/create', async (req, res) => {
    try {
        const id = nanoid();
        // request body nama_wisata
        const {
            name_wisata,
        } = req.body;
        // cek body request tidak boleh kosong!
        if (!name_wisata) {
            return res.status(400).json({
                error: "Semua bidang harus diisi"
            });
        }

        // apiKey dari gmaps api
        const apiKey = 'AIzaSyDv4gTOl7wC_UV3BEqEjnsObpJJUuq8Oc8';
        // untuk mendapatkan data_wisata berdasarkan nama_wisata dari request body, berdasarkan region:ID (indonesia)
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name_wisata)}&inputtype=textquery&fields=photos,formatted_address,name,rating,geometry&key=${apiKey}&region=ID`);
        // ini untuk mengecek misalnya data yang di cari tidak ada di gmaps api
        if (response.data.status !== 'OK') {
            return res.status(400).json({
                error: true,
                message: response.data.error_message || 'Kesalahan saat mencari data wisata'
            });
        }

        const place = response.data.candidates[0]; // Mengambil data dari respons API
        if (!place) {
            return res.status(404).json({
                error: true,
                message: 'Tempat wisata tidak ditemukan'
            });
        }

        // data respone
        const newData = {
            id,
            name_wisata: place.name, // nama_wisata
            // mengambil gambar url dari gmaps api
            photoURL: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}` : '',
            rating: place.rating || 'Tidak ada rating',
            description: place.formatted_address || 'Tidak ada deskripsi',
            lat: place.lat || 'Tidak ada lat',
            lon: place.lon || 'Tidak ada lon',
        };

        // mengirim data ke firestore
        await db.collection('wisata').doc(id).set(newData);

        // respone body
        return res.status(200).json({
            success: true,
            data: newData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

// Get Top Places
router.get('/top', async (req, res) => {
    try {
        const topWisata = await getTopWisata();
        return res.status(200).json(topWisata);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
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
                error: "Lat dan Lng harus diisi"
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
        const {
            id,
            name,
            photo,
            rating,
            description,
            environment,
            scenery,
            category
        } = req.query;
        let data;
        if (name) {
            data = await getWisataByName(name);
        } else if (environment) {
            data = await getWisataByEnvironment(environment);
        } else if (scenery) {
            data = await getWisataByScenery(scenery);
        } else if (category) {
            data = await getWisataByCategory(category);
        } else {
            data = await getAllWisata();
        }

        const filteredData = data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));
        return res.status(200).json(filteredData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get('/filter', async (req, res) => {
    try {
        const {
            name,
            environment,
            scenery,
            category
        } = req.query;

        // Gather all provided filters
        const filters = {
            name,
            environment,
            scenery,
            category
        };
        const providedFilters = Object.keys(filters).filter(key => filters[key] !== undefined);

        if (providedFilters.length !== 2) {
            return res.status(400).json({
                error: "Please provide exactly two filters"
            });
        }

        let data;

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
            return res.status(400).json({
                error: "Please provide exactly two filters"
            });
        }

        const filteredData = data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));

        return res.status(200).json(filteredData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get('/name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const data = await getWisataByName(name);
        const filteredData = data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));
        return res.status(200).json(filteredData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});



router.get('/environment/:environment', async (req, res) => {
    try {
        const environment = req.params.environment;
        const data = await getWisataByEnvironment(environment);
        const filteredData = data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));
        return res.status(200).json(filteredData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get('/scenery/:scenery', async (req, res) => {
    try {
        const scenery = req.params.scenery;
        const data = await getWisataByScenery(scenery);
        const filteredData = data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));
        return res.status(200).json(filteredData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const data = await getWisataByCategory(category);
        const filteredData = data.map(item => ({
            id: item.id,
            name: item.name,
            photo: item.photo,
            rating: item.rating,
            description: item.description,
            environment: item.environment,
            scenery: item.scenery,
            category: item.category
        }));
        return res.status(200).json(filteredData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        await updateWisata(id, updatedData);

        const updatedWisata = await getWisataByName(updatedData.name);

        return res.status(200).json({
            success: true,
            data: updatedWisata
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await deleteWisata(id);
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;