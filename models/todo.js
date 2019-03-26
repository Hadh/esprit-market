const mongoose = require('mongoose');

// Todo Schema
const TodoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    created_at: {
        type: Date
    },
    user : {
        type: Object
    }
});

const Todo = module.exports = mongoose.model('Todo', TodoSchema);

module.exports.getTodoById = function (id, callback) {
    Todo.findById(id, callback);
};

module.exports.addTodo = function(newTodo, callback){
        newTodo.save(callback);
  };