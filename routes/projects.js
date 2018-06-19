const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Project = require('../models/project');
const User = require('../models/user');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    } else {
        cb(null, false)
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

/* GET project listing. */
router.get('/',function(req, res, next) {
    Project.find({}, function(err, projects) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,projects});
        }
    });
});

/*Get last 3 */
router.get('/last_projects',function(req,res){
   Project.find({},{},{limit: 3},function(err, projects){
       if(err){
           res.json({success:false,msg:'Something went wrong'});
           console.log(err);
       } else {
           res.json({success:true,projects});
       }
   });
});

/* Get List of accepted projects*/
router.get('/accepted',function(req, res, next) {
    Project.find({status:'ACCEPTED'}, function(err, projects) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,projects});
        }
    });
});

/* Get List of refused projects*/
router.get('/refused',function(req, res, next) {
    Project.find({status:'REFUSED'}, function(err, projects) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,projects});
        }
    });
});

/* Get project by id*/
router.get('/project/:project_id',function(req, res, next) {
    var project_id = req.params.project_id;
    Project.findOne({_id:project_id}, function(err, project) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,project});
        }
    });
});

/*Get count of each project with category*/
router.get('/category_count', function(req,res){
    Project.aggregate( [  {$group : { _id : '$category', count : {$sum : 1}}}],function(err,obj){
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,obj});
        }
    });
});

/**** WEBHOOK for DiaglogFlow**/
router.post('/webhook',function(req,res){
   console.log('Retrieved a post request');
    if(!req.body) return res.sendStatus(400);
    res.setHeader('Content-Type', 'application/json');
    console.log('Heres the post request from dialoagFlow');
    console.log(req.body);
    console.log('got param', req.body.queryResult.parameters['categories']);
    var category = req.body.queryResult.parameters['categories'];

    var regex = new RegExp(["^", category, "$"].join(""), "i");
    Project.find({category:regex},function(err,p){
        if(err){
            console.log(err,'Something went wrong');
        } else {
            let response = "";
            let responseObj = {
                "fulfillmentText": response,
                "fulfillmentMessage":[{"text": {"text": [p.length]}}],
                "source": ""
            };
            console.log('Here is the response to dialogFlow');
            console.log(p.length);
            return res.json(responseObj);
        }
    });

});



/* Post a project*/      //,passport.authenticate('jwt', {session:false}),
router.post('/',upload.any(),function(req, res, next){
    const connectedUser = req.user;
    const newProject = new Project ({
        name: req.body.name,
        description: req.body.description,
        tagline: req.body.tagline,
        category: req.body.category,
        logo:  req.files[0],
        cover:  req.files[1],
        image1:  req.files[2],
        image2:  req.files[3],
        image3:  req.files[4],
        fundraiser: req.body.fundraiser,
        owner: connectedUser,
        status: 'PENDING',
        currentfund:0,
        investors: [],
        revenue:req.body.revenue,
        business_model:req.body.business_model,
        risks:req.body.risks,
        add_information:req.body.add_information,
        website:req.body.website
    });
    console.log(newProject);
    newProject.save(function(err, data) {
        if(err) {
            console.log("hhhh",err);
            res.json({success:false, msg: "Some error occurred while creating the Project."});
        } else {
            res.json({success: true, msg:'Project registered! You will hear from us soon'});
        }
    });
});

/* Get all projects by a certain category*/
router.get('/:category_name',function(req, res){
    var category_name = req.params.category_name;
    var regex = new RegExp(["^", category_name, "$"].join(""), "i");
    Project.find({category:regex},function(err,projects){
        if(err){
            console.log(err,'Something went wrong');
        } else {
            res.json({success:true,msg:'Retrieved done!', projects});
        }
    })
});

/* Get all projects of a given user */
router.get('/user/:user_id',function(req, res){
    let user_id = req.params.user_id;
    User.getUserById(user_id,function(err,thatUser){
        if(err){
            console.log(err);
        } else {
            Project.find({owner: thatUser},function(err,projects){
                if(err){
                    console.log(err,'Something went wrong');
                } else {
                    res.json({success:true,msg:'Retrieved done!', projects});
                }
            })
        }
    });
});

/*Invest in a project : Make user investor and add him to the project investors */
router.post('/project/:project_id',passport.authenticate('jwt', {session:false}),function(req, res, next) {
    let user = req.user;
    let project_id = req.params.project_id;
    /* Make User investor */
    let query = {'investor':true};
    User.findByIdAndUpdate( user._id,query, function(err, doc){
        if (err) console.log('Ooops!');
        else {
            console.log('User Became Investor!');
            /* Add investor to project investors array*/
            Project.findByIdAndUpdate(project_id, { "$push": { "investors": doc } },function(err,resp){
                if(err){
                    console.log(err,'Something went wrong');
                } else {
                    res.json({success:true,msg:'Update done!'});
                }
            });
        }
    });
});

/* Delete a project */
router.delete('/:project_id',passport.authenticate('jwt', {session:false}),function(req, res, next) {
    const project_id = req.params.project_id;
    Project.findByIdAndRemove({_id: project_id} , function(err,resp){
        if(err) console.log('Something went wrong');
        else {
            res.status(200).json({success:true, msg:'Deleted Project Successfully'});
        }
    });
});

/* Update a project*/

/* Increase fundraiser */

/* Calculate Score*/

/*Accept a project*/
router.put('/accept/:project_id', function(req, res, next){
   project_id = req.params.project_id;
   const query = {status:'ACCEPTED'};
    Project.findOneAndUpdate( { _id:  project_id }, query, function(err,resp){
        if(err) console.log('Something went wrong');
        else {
            console.log(resp);
            res.status(200).json({success:true, msg:'Updated Project Successfully'});
        }
    });
});

/*Decline a project*/

module.exports = router;