import express from 'express';
import {faker} from "@faker-js/faker";
import Skyscraper from "../models/Skyscraper.js";

const router = express.Router();

router.options('/', (req, res) => {
    res.header('Allow', 'GET, POST, OPTIONS');
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Accept', 'application/json, application/x-www-form-urlencoded');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send();
});

router.options('/seed', (req, res) => {
    res.header('Allow', 'POST, OPTIONS');
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Accept', 'application/json, application/x-www-form-urlencoded');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Accept', 'application/json, application/x-www-form-urlencoded');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    //res.json({message: 'hier komt een lijstt'});
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
        //res.json({message: `you created ${req.params.id} spots`});
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch skyscraper'});
    }
});

router.post('/seed', async (req, res) => {
    try {
        await Skyscraper.deleteMany({});

        for (let i = 0; i < req.body.amount; i++) {
            await Skyscraper.create({
                title: faker.word.adjective(),
                description: faker.lorem.paragraph(3),
                city: faker.lorem.paragraph({min: 1, max: 5})
            });
        }
        res.json({message: `you created ${req.body.amount} spots`});
    } catch (e) {
        res.status(404).send('Not found');
    }
});

router.post('/', async (req, res) => {
    try {
        await Skyscraper.create({
            title: req.body.title,
            description: req.body.description,
            city: req.body.city
        });
        res.status(201).json({message: `you created ${req.body.title}`});
    } catch (e) {
        res.status(400).json({message: 'Failed to create skyscraper', error: e.message});
    }
});


router.put('/:id', async (req, res) => {
    try {
        const updatedSkyscraper = await Skyscraper.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
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
            return res.status(404).json({ message: "Skyscraper not found" });
        }
        res.status(204).json({ message: "Skyscraper deleted successfully", skyscraper: deletedSkyscraper });
    } catch (e) {
        res.status(400).json({ message: "Failed to delete Skyscraper", error: e.message });
    }
});


export default router;