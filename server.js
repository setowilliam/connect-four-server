const express = require("express");
const app = express();
const path = require("path");

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static("public"));
// setup socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userList = [];
var gameList = [];
io.on('connection', function (socket) {
    console.log('a user connected'); // show when the user connected
    socket.emit('connect');
    let userName;

    socket.on('username', function(un) {
        userName = un;
        userList.push(userName);
        io.emit('add user', userName);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected'); // show when the user disconnected
        let index = userList.indexOf(userName);
        if (index != -1) {
            connectedUsers.splice(index, 1);
            io.emit('remove user', userName);
        }
    });

    socket.on('chat message', function (msg) { // when the socket recieves a "chat message"
        console.log("user sent: " + msg);
        io.emit('chat message', JSON.stringify({user: userName, msg: msg})); // send the message back to the users
    });

    socket.on('add game', function(game) {
        gameList.push(game);
        io.emit('add game', game);
    })

    socket.on('remove game', function(game) {
        gameList.splice(gameList.indexOf(game), 1);
        io.emit('remove game', game);
    })
});

http.listen(HTTP_PORT, () => { // note - we use http here, not app
    console.log("listening on: " + HTTP_PORT);
});