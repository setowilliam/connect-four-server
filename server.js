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
        let index = userList.indexOf(userName)
        if (index != -1) {
            userList.splice(index, 1);
            io.emit('remove user', userName);
            for (let i = 0; i < gameList.length; i++) {
                if (gameList[i].hostPlayer == socket.id) {
                    gameList.splice(i, 1);
                    io.emit('remove game', gameList[i]);
                    break;
                }
            }
        }
    });

    socket.on('chat message', function (msg) { // when the socket recieves a "chat message"
        console.log("user sent: " + msg);
        io.emit('chat message', JSON.stringify({ user: userName, msg: msg })); // send the message back to the users
    });

    socket.on('add game', function (game) {
        let gameObj = { gameName: game, hostPlayer: socket.id, status: true };
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

    socket.on('join game', function (game) {
        for (let i = 0; i < gameList.length; i++) {
            if (gameList[i].hostPlayer == game.hostPlayer) {
                gameList[i] = game;
                socket.join(gameList[i].hostPlayer);
                io.emit('update game', game);
                gameList[i].grid = initializeGrid();
                io.to(gameList[i].hostPlayer).emit('start game');
                break;
            }
        }
    })

    socket.on('change state', function (column, game, color) {
        for (let i = 0; i < gameList.length; i++) {
            if (gameList[i].hostPlayer == game.hostPlayer) {
                gameList[i].grid.columns[column].cells[gameList[i].grid.columns[column].count].color = color;
                gameList[i].grid.columns[column].count++;
                io.to(game.hostPlayer).emit('change state', (column, gameList[i].grid.columns[column].count));
            }
        }
    })
});


http.listen(HTTP_PORT, () => { // note - we use http here, not app
    console.log("listening on: " + HTTP_PORT);
});

function initializeGrid() {
    let grid = {columns: []};
    for (let i = 0; i < 7; i++) {
        grid.columns.push({count: 0, cells: []});
        for (let k = 0; k < 6; k++) {
            grid.columns[i].cells.push({id: k, color: "none", state: 0});
        }
    }
    return grid;
}