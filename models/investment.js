const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

//investment Schema
const InvestmentSchema = new Schema({
    investor: Object,
    project: Object,
    amount: Number,
    add_info: String,
    status: {
        type: String,
        enum : ['DONE','NEW'],
        default: 'NEW'
    },
    created_at:{
        type:Date,
        default: Date.now()
    }
});
const Investment = module.exports = mongoose.model('Investment', InvestmentSchema);

