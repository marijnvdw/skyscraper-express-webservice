import mongoose from "mongoose";

const skyscraperSchema = new mongoose.Schema( {
    title: {type: String, required: true},
    description: {type: String, required: true},
    city: {type: String, required: true},
    height: {type: String, required: false},
    category: {type: String, required: false, default: '0'},
    favorite: {type: String, required: false, default: 'false'},
    img: {type: String, required: false}

});

const Skyscraper = mongoose.model('Skyscraper', skyscraperSchema);

export default Skyscraper