const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

// Project Schema
const ProjectSchema = new Schema({
    name: String,
    description: String,
    tagline:String,
    category:{
        type: String
    },
    cover:{
        type:Object
    },
    logo:{
        type:Object
    },
    image1:{
        type:Object
    },
    image2:{
        type:Object
    },
    image3:{
        type:Object
    },
    fundraiser: Number,
    owner:{
        type: Object
    },
    status: {
        type: String,
        enum : ['ACCEPTED','PENDING','REFUSED'],
        default: 'PENDING'
    },
    investors : [],
    currentfund: {
        type:Number,
        default:0
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
    revenue: {type:String},
    business_model:{type:String},
    risks:{type:String},
    add_information:{type:String},
    website:{type:String},
    github:{type:String},
    stack:{type:String},
    created_at:{
        type:Date,
        default: Date.now()
    }

});

const Project = module.exports = mongoose.model('Project', ProjectSchema);

module.exports.getProjectById = function(id, callback){
    Project.findById(id, callback);
};








