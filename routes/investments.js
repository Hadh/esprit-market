const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Investment = require('../models/investment');
const Project = require('../models/project');
const User = require('../models/user');


/* GET investments listing. */
router.get('/',function(req, res, next) {
    Investment.find({}, function(err, investments) {
        res.json(investments);
    });
});

router.get('/new',function(req,res){
    Investment.find({status:'NEW'}, function(err, newInvestments) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,newInvestments});
        }
    });
});

router.get('/seen',function(req,res){
    Investment.find({status:'DONE'}, function(err, doneInvestments) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            res.json({success:true,doneInvestments});
        }
    });
});

/* POST an investment */
router.post('/',passport.authenticate('jwt', {session:false}), function(req,res){
    const connected_admin = req.user;
    const project_id = req.body.project_id;
    Project.findOne({_id:project_id}, function(err, found_project) {
        if(err){
            res.json({success:false,msg:'Something went wrong'});
            console.log(err);
        } else {
            console.log(found_project);
            const investment = new Investment({
                investor : connected_admin,
                amount : req.body.amount,
                add_info: req.body.add_info,
                project :found_project,
                status : 'NEW'
            });
            investment.save(function(err, data) {
                if(err) {
                    console.log(err);
                } else {
                    res.json({success: true, msg:'Investment registered!'});
                }
            });
        }
    });
});

/*Mark an investment as DONE*/
router.put('/markasdone/:investment_id',function (req,res) {
    const investment_id = req.params.investment_id;
    const query = {status:'DONE'};
    Investment.findOneAndUpdate( { _id:  investment_id }, query, function(err,resp){
        if(err) console.log('Something went wrong');
        else {
            console.log(resp);
            res.status(200).json({success:true, msg:'Updated Investment Successfully'});
        }
    });
});


module.exports = router;