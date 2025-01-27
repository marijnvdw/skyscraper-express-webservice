import express from 'express';
import mongoose from "mongoose";
import skyscraperRouter from './routes/skyscrapers.js'

const app = express();
mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`)

// Middleware voor JSON-gegevens
app.use(express.json());
// Middleware voor www-urlencoded-gegevens
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.header('Accept') !== 'application/json' && req.method !== "OPTIONS") {
        res.status(406).json('Incorrect format, only JSON is allowed as accept header');
    } else {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    }
})

app.get('/',(req,res)=> {
    res.json({message: 'hallooo'})
})

app.use('/skyscraper', skyscraperRouter)

app.listen(process.env.EXPRESS_PORT, () => {
    console.log("de server is gestart")
});

