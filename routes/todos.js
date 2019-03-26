const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Todo = require('../models/Todo');

/* GET Todos listing. */
router.get('/', function (req, res, next) {
  Todo.find({}, function (err, Todos) {
    res.json(Todos);
  });
});

// Add a todo passport.authenticate('jwt', {session: false}),
router.post('/addTodo',passport.authenticate('jwt', {session: false}), (req, res, next) => {
  let newTodo = new Todo({
    title: req.body.title,
    user: req.user,
    description: req.body.description,
    created_at: Date.now()
  });

  Todo.addTodo(newTodo, (err, Todo) => {
    if (err) {
      console.log(err)
      res.json({
        success: false,
        msg: 'Error!'
      });
    } else {
      res.json({
        success: true,
        msg: 'Todo added!'
      });
    }
  });
});

/* justify text */
router.post('/justify', passport.authenticate('jwt', {session: false}), function (req, res, next) {
  let authTodo = req.Todo;
  let text_to_justify = req.body.text;
  res.json({
    Todo: authTodo
  });
});

router.put('/updateTodo/:id', passport.authenticate('jwt', {session: false}), function (req, res, next) {
  const id = req.params.id;
  const updateOps = {};
  for (const [key, value] of Object.entries(req.body)) {
    updateOps[key] = value;
  }
  Todo.updateOne({
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

router.delete('/deleteTodo/:id',(req,res,next)=>{
  const id = req.params.id;
  console.log(id);
  Todo.remove({_id : id})
  .exec()
  .then(doc=>{
      res.status(200).json(res);
  })
  .catch(err=>{
      res.status(500).json(err)
  });
})


module.exports = router;