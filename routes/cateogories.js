const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Category = require('../models/category');



/* GET categories listing. */
router.get('/',function(req, res, next) {
    Category.find({}, function(err, categories) {
        res.json(categories);
    });
});


/* Add a Category or an array of categories*/
router.post('/', function(req, res) {
    let arr = new Array();
    for(let i=0; i< req.body.name.length;i++){
        arr.push(req.body.name[i])
    }
    if(arr.length == 1){
        var new_category = new Category({
            name: arr[0]
        });
        new_category.save(function(err, resp) {
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    message: 'something went wrong'
                });
            } else {
                console.log(resp);
                res.send({
                    success: true,
                    data: resp,
                    message: 'the category has been saved'
                });
            }
        });
    } else {
        for( let i=0; i< arr.length; i++){
            let new_category2 = new Category({
                name: arr[i]
            });
            new_category2.save(function(err, resp) {
                if (err) {
                    console.log(err);
                    res.send({
                        success: false,
                        message: 'something went wrong'
                    });
                } else {
                    console.log(resp);
                    if(i== arr.length -1) {
                        res.send({
                            success: true,
                            data: resp,
                            message: 'the category has been saved'
                        });
                    }
                }
            });
        }
    }
});

module.exports = router;