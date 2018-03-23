const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

/* GET users listing. */
router.get('/',function(req, res, next) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
      name: req.body.name,
      username: req.body.username,
      job: req.body.job,
      birth_date: req.body.birth_date,
      email: req.body.email,
      password: req.body.password,
      investor: false,
      admin:false,
      confirmed: false
  });

  User.addUser(newUser, (err, user) => {
    if(err){
      res.json({success: false, msg:'Failed- User already exists!'});
    } else {
      res.json({success: true, msg:'User registered'});
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

module.exports = router;
