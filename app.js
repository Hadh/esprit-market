const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// Connect To Database
mongoose.connect(config.database);
const app = express();

const users = require('./routes/users');
const projects = require('./routes/projects');
const categories = require('./routes/cateogories');
const dash = require('./routes/dash');
const admin_rates = require('./routes/admin_rates');
const investments = require('./routes/investments');


// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//making uploads file publically available
app.use('/uploads',express.static('uploads'));

// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);
app.use('/projects', projects);
app.use('/categories', categories);
app.use('/report',dash);
app.use('/rates',admin_rates);
app.use('/investments',investments);

const port = 3000;
// Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

app.listen(process.env.PORT || port, () => {
    console.log('Server started on port '+port);
});