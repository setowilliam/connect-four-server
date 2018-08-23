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
    socket.emit('connected user', userList, gameList);
    let userName;

    socket.on('username', function (un) {
        userName = un;
        userList.push(userName);
        io.emit('add user', userName);
    });

    socket.on('disconnect', function () {
        console.log('user disconnected'); // show when the user disconnected
        userList.splice(userList.indexOf(userName), 1);
        io.emit('remove user', userName);
        for (let i = 0; i < gameList.length; i++) {
            if (gameList[i].hostPlayer == socket.id) {
                gameList.splice(i, 1);
                io.emit('remove game', gameList[i]);
                break;
            }
        }
    });

    socket.on('chat message', function (msg) { // when the socket recieves a "chat message"
        console.log("user sent: " + msg);
        io.emit('chat message', JSON.stringify({ user: userName, msg: msg })); // send the message back to the users
    });

    socket.on('add game', function (game) {
        let gameObj = { gameName: game, hostPlayer: socket.id };
        gameList.push(gameObj);
        io.emit('add game', gameObj);
    })

    socket.on('remove game', function (gameName) {
        for (let i = 0; i < gameList.length; i++) {
            if (gameList[i].gameName == gameName) {
                gameList.splice(i, 1);
                io.emit('remove game', gameName);
                break;
            }
        }
    })
});

http.listen(HTTP_PORT, () => { // note - we use http here, not app
    console.log("listening on: " + HTTP_PORT);
});