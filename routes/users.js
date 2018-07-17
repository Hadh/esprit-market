const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const hsb = require('nodemailer-express-handlebars');


/* GET users listing. */
router.get('/',function(req, res, next) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});

/*Get users that are project owners*/
router.get('/owners',function(req,res){
   User.find({investor: false , admin: false}, function(err,owners){
     if(err) console.log(err);
     else {
         res.json({success:true,owners})
     }
   });
});
/*Get users that are investors*/
router.get('/invests',function(req,res){
    User.find({investor: true}, function(err,invests){
        if(err) console.log(err);
        else {
            res.json({success:true,invests})
        }
    });
});

//get all admins
router.get('/get_admins',function(req,res){
    User.find({admin: true}, function(err,admins){
        if(err) console.log(err);
        else {
            res.json({success:true,admins})
        }
    });
});

// Register
router.post('/register', (req, res, next) => {
  const stringToken = randomstring.generate();
    let newUser = new User({
        name: req.body.name,
        username: req.body.username,
        job: req.body.job,
        city: req.body.city,
        phone: req.body.phone,
        address : req.body.address,
        email: req.body.email,
        password: req.body.password,
        investor: false,
        admin:false,
        active: false,
        secretToken: stringToken
  });

  User.addUser(newUser, (err, user) => {
    if(err){
      res.json({success: false, msg:'Failed- User already exists!'});
    } else {
        const html = `Hi There, </br> Thank you for registrating on ESPRIT-MARKET.<br> Please Verify Your Account
        by Typing The Following Token </br> Token: ${stringToken} <br> On The Following Page : <a href='...'>Verify Page</a> 
        <br> Have a lovely day!
        ESPRIT-MARKET TEAM`;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    type: 'OAuth2',
                    user: 'soccerstar.laouini@gmail.com',
                    clientId: '883810856659-pct8m1teccu5d332hkt1nj15e24ha8qv.apps.googleusercontent.com',
                    clientSecret: '9O1HkeZlYDLkJbzLYoIEyAu3',
                    refreshToken: '1/-eC9S575Y-kvEW2gsR6190YZ3f4bt0cVcg_4yt_ne-Y',
                    accessToken: 'ya29.GluKBYeXA9sPxayM0xn8DG_oDFJx_TaA7jKHfeYU0JgyTqStC6WiL7z6jQ6Axxs2LYSzYugZKJWLcNQeLTGDsfAMnx04fV5hglfRxJg6y3gkTmtElIeYqZ-6EFyy'
            }
        });

        transporter.use('compile', hsb({
            viewPath: 'views/email',
            extName:'.hbs'
        }));

        var mailOptions = {
            from: 'ESPRIT-MARKET Team',
            to: newUser.email,
            subject: 'Account Verification',
            template:'verification',
            context:{
                stringToken:stringToken
            }
            //text: html
        };

        transporter.sendMail(mailOptions, function (err, res) {
            if(err){
                console.log('Error');
            } else {
                console.log('Email Sent');
            }
        });


        res.json({success: true, msg:'User registered! Please Check your email'});
    }
  });
});

router.post('/add_admin',function(req,res){
    let newAdmin = new User({
        name: req.body.name,
        username: req.body.username,
        job: req.body.job,
        city: req.body.city,
        phone: req.body.phone,
        address : req.body.address,
        email: req.body.email,
        password: req.body.password,
        investor: false,
        admin:true,
        active: false
    });
    User.addUser(newAdmin, (err, user) => {
       if(err) console.log(err);
       else {
           res.json({success:true, msg: "Admin added with success"});
       }
    });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email, (err, user) => {
    if(err) throw err;
    if(!user){
      return res.json({success: false, msg: 'User not found'});
    }
      /*check if user account is active*/
    if(!user.active)
        return res.json({success: false, msg: 'Please Verify You Account!'});
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign({data: user}, config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: `Bearer ${token}`,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

router.route('/verify')
    .get( (req, res) => {
        return res.json({success: false, msg: 'You should be seeing the verify page'});
    })
    .post(async (req, res, next) => {
        try{
            const secretToken = req.body.secretToken;
            const user = await User.findOne({ 'secretToken' : secretToken });
            if(!user){
                return res.json({success: false, msg: 'Error - No User Found!'});
            }
            user.active = true;
            user.secretToken = "";
            await user.save();
            return res.json({success: true, msg: 'Thank you! You may now login'});

        } catch (error){
            next(error);
        }

    });

module.exports = router;
