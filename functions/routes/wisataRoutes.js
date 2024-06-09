const express = require('express');
const {
    nanoid
} = require('nanoid');
const {
    createWisata,
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

router.post('/create', async (req, res) => {
    try {
        const id = nanoid();
        const {
            name,
            environment,
            scenery,
            category,
            photo,
            rating,
            description
        } = req.body;

        if (!name || !environment || !scenery || !category || !photo || !rating || !description) {
            return res.status(400).json({
                error: "Semua bidang harus diisi"
            });
        }

        const newData = {
            id,
            name,
            photo,
            rating,
            description,
            environment,
            scenery,
            category
        };

        await createWisata(newData);
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