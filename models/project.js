const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Project Schema
const ProjectSchema = new Schema({
    name: String,
    description: String,
    category:{
        type: String
    },
    fundraiser: Number,
    owner:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    accepted : {
        type:Boolean,
        default:false
    },
    investors : [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    currentfund: {
        type:Number,
        default:0
    },
    specs:{
        innovation:{
            type: String
        },
        monetisation:{
            type: String
        }
    },
    score:{
        innovation:{
            type:Number,
            default:0
        },
        evolution:{
            type:Number,
            default:0
        },
        impexp: {
            type:Number,
            default:0
        },
    },
    created_at:{
        type:Date,
        default: Date.now()
    }

});

const Project = module.exports = mongoose.model('Project', ProjectSchema);










