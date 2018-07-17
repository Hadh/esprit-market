const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

//admin_rate Schema
const Admin_RateSchema = new Schema({
    admin: Object,
    project: Object,
    score: Number,
    created_at:{
        type:Date,
        default: Date.now()
    }
});
const Admin_Rate = module.exports = mongoose.model('Admin_Rate', Admin_RateSchema);

