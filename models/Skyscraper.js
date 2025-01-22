import mongoose from "mongoose";

const skyscraperSchema = new mongoose.Schema( {
    title: {type: String, required: true},
    description: {type: String, required: true},
    city: {type: String, required: true},
});

const Skyscraper = mongoose.model('Skyscraper', skyscraperSchema);

export default Skyscraper