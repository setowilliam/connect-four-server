const express = require("express");
const app = express();
const path = require("path");

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static("public"));
// setup socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);
var connectedUsers = [];

io.on('connection', function (socket) {
    console.log('a user connected'); // show when the user connected
    socket.emit('all connected users', connectedUsers);
    let userName;

    socket.on('username', function(un) {
        userName = un;
        connectedUsers.push(userName);
        io.emit('connected user', userName);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected'); // show when the user disconnected
        connectedUsers.splice(connectedUsers.indexOf(userName), 1);
        io.emit('disconnected user', userName);
    });

    socket.on('chat message', function (msg) { // when the socket recieves a "chat message"
        console.log("user sent: " + msg);
        io.emit('chat message', JSON.stringify({user: userName, msg: msg})); // send the message back to the users
    });
});

http.listen(HTTP_PORT, () => { // note - we use http here, not app
    console.log("listening on: " + HTTP_PORT);
});