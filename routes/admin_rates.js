const express = require('express');
const router = express.Router();
const Admin_Rate = require('../models/admin_rate');
const Project = require('../models/project');
const passport = require('passport');
const jwt = require('jsonwebtoken');

/* GET all rates listing. */
router.get('/',function(req, res, next) {
    Admin_Rate.find({}, function(err, categories) {
        res.json(categories);
    });
});

router.get('/:project_id',function(req,res){
    const project_id = req.body.project_id;
    const p = "project._id";
    Admin_Rate.findOne({p:project_id}, function(err, rate) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success: true, rate});
        }
    });
});

router.get('/all/:project_id',function(req,res){
    let allScores=[];
    let allAdmins = [];
    let theAverage=0;
    let project_id = req.params.project_id;
    Project.getProjectById(project_id,function(err,proj){
        if(err){
            console.log(err);
        } else {
            Admin_Rate.find({project:proj}, function(err, rates) {
                if(err){
                    console.log(err);
                } else {
                    console.log(rates);
                    for(let i=0; i< rates.length; i++){
                        allScores.push(rates[i].score);
                        allAdmins.push(rates[i].admin.username);
                    }
                    const sum = allScores.reduce((total, value)=> total + value, 0);
                    theAverage = sum / allScores.length;
                    console.log(sum, theAverage);
                    res.json({success: true, allScores,allAdmins, theAverage});
                }
            });
        }
    });



});

router.post('/',passport.authenticate('jwt', {session:false}),function(req,res){
   const project_id = req.body.project_id;
   const average = req.body.average;
   const admin = req.user;
   console.log(req.user);
   Project.findOne({_id:project_id}, function(err, found_project) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            console.log(found_project);
            let rate = new Admin_Rate({
                project : found_project,
                admin : admin,
                score: average
            });
            rate.save(function(err, data) {
                if(err) {
                    console.log(err);
                } else {
                    res.json({success: true, msg:'Rating registered!'});
                }
            });
        }
    });
});



module.exports = router;