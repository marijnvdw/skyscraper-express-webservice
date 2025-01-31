import express, {request} from 'express';
import {faker} from "@faker-js/faker";
import Skyscraper from "../models/Skyscraper.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.options('/', (req, res) => {
    res.header('Allow', 'GET, POST, OPTIONS');
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Accept', 'application/json, application/x-www-form-urlencoded');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH');
    res.status(204).send();
});

router.options('/seed', (req, res) => {
    res.header('Allow', 'POST, OPTIONS');
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Accept', 'application/json, application/x-www-form-urlencoded');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Accept', 'application/json, application/x-www-form-urlencoded');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).send();
});

router.get('/', async (req, res) => {
    const skyscrapers = await Skyscraper.find();

    const baseUrl = `${req.protocol}://${req.get('host')}/skyscraper`;

    const items = skyscrapers.map(skyscraper => ({
        ...skyscraper.toObject(),
        _links: {
            self: {href: `${baseUrl}/${skyscraper._id}`},
            collection: {href: baseUrl}
        }
    }));

    res.json({
        items,
        _links: {
            self: {href: baseUrl},
            collection: {href: baseUrl}
        }
    });
});

router.get('/:id', async (req, res) => {
    try {
        const skyscraper = await Skyscraper.findOne({_id: req.params.id});
        if (!skyscraper) {
            return res.status(404).json({message: 'Skyscraper not found'});
        }

        const baseUrl = `${req.protocol}://${req.get('host')}/skyscraper`;
        res.json({
            ...skyscraper.toObject(),
            _links: {
                self: {href: `${baseUrl}/${skyscraper._id}`},
                collection: {href: baseUrl}
            }
        });

    } catch (err) {
        res.status(500).json({message: 'Failed to fetch skyscraper'});
    }
});

const JWT_SECRET = 'programmeren6';
router.post('/login', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is required' });  // Return to stop execution
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (password !== 'programmeren6') {
            return res.status(403).json({ message: 'Invalid credentials' });  // Return to stop execution
        }
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    } catch (e) {
        return res.status(500).json({ message: 'Internal server error', error: e.message });
    }
});



router.patch('/favo/:id', async (req, res) => {
    try {

        const skyscraper = await Skyscraper.findById(req.params.id);

        if (!skyscraper) {
            return res.status(404).json({ message: "Skyscraper not found" });
        }
        console.log('Current favorite status:', skyscraper.favorite);
        if (skyscraper.favorite === 'true') {
            skyscraper.favorite = 'false'
        } else if (skyscraper.favorite === 'false') {
            skyscraper.favorite = 'true'
        }

        await skyscraper.save();

        res.status(200).json({ message: "Favorite status updated", skyscraper });
    } catch (e) {
        res.status(400).json({ message: "Failed to update favorite status", error: e.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const imageUrls = [
            'https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Burj_Khalifa.jpg/200px-Burj_Khalifa.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_Cropped.jpg/220px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_Cropped.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/800px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/The_Twins_SE_Asia_2019_%2849171985716%29_%28cropped%29_2.jpg/250px-The_Twins_SE_Asia_2019_%2849171985716%29_%28cropped%29_2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Azabudai_Hills%2C_opening_day_36_%28cropped%29.jpg/220px-Azabudai_Hills%2C_opening_day_36_%28cropped%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/5/58/Tokyo_Tower_2023.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/30_St_Mary_Axe_from_Leadenhall_Street.jpg/144px-30_St_Mary_Axe_from_Leadenhall_Street.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/The_Shard_from_the_Sky_Garden_2015.jpg/1200px-The_Shard_from_the_Sky_Garden_2015.jpg',
        ];


        const method = req.body.METHOD;
        if (method === 'seed') {
            const method = req.body.DELETEOTHERS;
            if (method == 1) {
                await Skyscraper.deleteMany({});
            }
            for (let i = 0; i < req.body.amount; i++) {
                const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
                await Skyscraper.create({
                    title: faker.word.adjective(),
                    description: faker.lorem.paragraph(2),
                    city: faker.location.city(),
                    height: faker.number.bigInt({ min: 1, max: 200 }),
                    category: faker.number.bigInt({ min: 0, max: 2 }),
                    favorite: 'false',
                    img: randomImage
                });
            }
            res.json({message: `you created ${req.body.amount} skyscrapers`});
        } else {
            let height
            if (req.body.height) {
                height = req.body.height
            } else {
                height = faker.number.bigInt({ min: 1, max: 200 })
            }
            let category
            if (req.body.category) {
                category = req.body.category
            } else {
                category = faker.word.adjective()
            }
            let favorite
            if (req.body.favorite) {
                favorite = req.body.favorite
            } else {
                favorite = 'false'
            }

            const newSkyscraper = await Skyscraper.create({
                title: req.body.title,
                description: req.body.description,
                city: req.body.city,
                height: height,
                category: category,
                favorite: favorite,
                img: randomImage
            });
            res.status(201).json({
                message: `You created ${newSkyscraper.title}`,
                id: newSkyscraper._id
            });
        }

    } catch (e) {
        res.status(400).json({
            message: 'Failed to create skyscraper',
            error: e.message
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const updatedSkyscraper = await Skyscraper.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedSkyscraper) {
            return res.status(404).json({message: "Skyscraper not found"});
        }
        res.status(200).json({message: "Skyscraper updated successfully", Skyscraper: updatedSkyscraper});

    } catch (e) {
        res.status(404).send('Not found');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedSkyscraper = await Skyscraper.findByIdAndDelete(req.params.id);
        if (!deletedSkyscraper) {
            return res.status(404).json({message: "Skyscraper not found"});
        }
        res.status(204).json({message: "Skyscraper deleted successfully", skyscraper: deletedSkyscraper});
    } catch (e) {
        res.status(400).json({message: "Failed to delete Skyscraper", error: e.message});
    }
});



export default router;