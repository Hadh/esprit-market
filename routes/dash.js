const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Project = require('../models/project');
const User = require('../models/user');


/* GET project listing. */
router.get('/',function(req, res, next) {
    Category.count({}, function( err, count){
        let categories = {
            'categories':count
        };
        Project.count({}, function( err, count){
            let projects = {
                'projects':count
            };
            User.count({investor:'true'}, function( err, count){
                let investors = {
                    'investors':count
                };
                res.json({success:true,categories,investors,projects});
            });
        });
    });
});


module.exports = router;