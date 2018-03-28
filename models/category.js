const mongoose = require('mongoose');
const config = require('../config/database');
const Schema = mongoose.Schema;

// Category Schema
const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    created_at:{
        type:Date,
        default: Date.now()
    }
});

const Cateogories = module.exports = mongoose.model('Category', CategorySchema);










