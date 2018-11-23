const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const hsb = require('nodemailer-express-handlebars');
const LIMIT = 80000;
const _24_HOURS_TO_SECONDS = 86400;


/* GET users listing. */
router.get('/',function(req, res, next) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});


// Register
router.post('/register', (req, res, next) => {
    const stringToken = randomstring.generate();
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        userToken: stringToken
  });

  User.addUser(newUser, (err, user) => {
    if(err){
        console.log(err)
      res.json({success: false, msg:'Failed- User already exists!'});
    } else {
        res.json({success: true, msg:'User registered!'});
    }
  });
});


// Authenticate
router.post('/token', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email, (err, user) => {
    if(err) throw err;
    if(!user){
      return res.json({success: false, msg: 'User not found'});
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign({data: user}, config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          jwt_token: `Bearer ${token}`,
          user: user
        });
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

/* justify text */
router.post('/justify', passport.authenticate('jwt', {session:false}),function(req, res, next) {
    let authUser = req.user;
    let text_to_justify = req.body.text;
    let wordCount = text_to_justify.match(/(\w+)/g).length;
    var seconds = new Date().getTime() / 1000;

    //first time
    if(authUser.last_used == null){
        if(wordCount <= LIMIT) {
            authUser.usage = wordCount;
            authUser.last_used = Date.now();
            authUser.save();
            return res.json({success: true, msg: 'justfied text'});
        }

        // not first time
    } else {
        if(( seconds - authUser.last_used.getTime() / 1000) <= _24_HOURS_TO_SECONDS ){
            if(wordCount <= LIMIT) {
                if(authUser.usage + wordCount <= LIMIT){
                    authUser.usage = authUser.usage+ wordCount;
                    authUser.last_used = Date.now();
                    authUser.save();
                    return res.json({success: true, msg: 'not fist justfied text'});
                }
            } 
        } else {
            authUser.usage = 0;
            if(wordCount <= LIMIT) {
                if(authUser.usage + wordCount <= LIMIT){
                    authUser.usage = wordCount;
                    authUser.last_used = Date.now();
                    authUser.save();
                    return res.json({success: true, msg: 'not fist justfied text'});
                }
            }
        }

    }
});



module.exports = router;
