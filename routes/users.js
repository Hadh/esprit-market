const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  User.addUser(newUser, (err, user) => {
    if (err) {
      console.log(err)
      res.json({
        success: false,
        msg: 'Failed- User already exists!'
      });
    } else {
      res.json({
        success: true,
        msg: 'User registered!'
      });
    }
  });
});

// Authenticate
router.post('/login', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        msg: 'User not found'
      });
    }
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign({
          data: user
        }, config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          jwt_token: `Bearer ${token}`,
          user: user
        });
      } else {
        return res.json({
          success: false,
          msg: 'Wrong password'
        });
      }
    });
  });
});

/* justify text */
router.post('/justify', passport.authenticate('jwt', {session: false}), function (req, res, next) {
  let authUser = req.user;
  let text_to_justify = req.body.text;
  res.json({
    user: authUser
  });
});

router.put('/updateUser/:id', passport.authenticate('jwt', {session: false}), function (req, res, next) {
  const id = req.params.id;
  const updateOps = {};
  for (const [key, value] of Object.entries(req.body)) {
    updateOps[key] = value;
  }
  User.updateOne({
      _id: id
    }, {
      $set: updateOps
    })
    .exec()
    .then(doc => {
      res.status(200).json(doc)
    })
    .catch(err => {
      res.status(500).json(err)
    });
});

router.delete('/deleteUser/:id',(req,res,next)=>{
  const id = req.params.id;
  console.log(id);
  User.remove({_id : id})
  .exec()
  .then(doc=>{
      res.status(200).json(res);
  })
  .catch(err=>{
      res.status(500).json(err)
  });
})


module.exports = router;