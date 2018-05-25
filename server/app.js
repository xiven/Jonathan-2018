var express = require('express');
var app = express();
var db = require('./db');

//routes for registering and logging in
var AuthController = require('./auth/AuthController');
app.use('/api/auth', AuthController);

//routes for sending and verifying messages
var MessageController = require('./msg/MessageController');
app.use('/api/msg', MessageController);

module.exports = app;