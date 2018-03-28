const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Project = require('../models/project');
const User = require('../models/user');

/* GET project listing. */
router.get('/',function(req, res, next) {
    Project.find({}, function(err, projects) {
        res.json(projects);
    });
});

/* Post a project*/
router.post('/',passport.authenticate('jwt', {session:false}), function(req, res, next){
    var connectedUser = req.user;
    const newProject = new Project ({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        fundraiser: req.body.fundraiser,
        specs: {
            monetisation: req.body.monetisation,
            innovation: req.body.innovation
        },
        owner: connectedUser,
        accepted: false,
        currentfund:0,
        investors: [],
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
            res.json({success:true,msg:'Retrieved done!', size:projects.length, data:projects});
        }
    })
});

/* Delete a project */

/* Update a project*/

/* Increase fundraiser */

/* Calculate Score*/

/*Accept a project*/

/*Decline a project*/

module.exports = router;