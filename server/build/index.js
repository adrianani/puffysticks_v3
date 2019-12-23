"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var mongoose = require("mongoose");
// sep
var SocketManager_1 = require("./SocketManager");
mongoose.connect('mongodb://80.240.24.96:27017/puffysticks', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
//mongoose.set('debug', true);
var app = express(), server = http_1.createServer(app), io = socketIo(server), port = 8080;
app.get('/', function (req, res) {
    res.send();
});
server.listen(port, function () {
    console.log('\x1b[1m\x1b[97m%s\x1b[0m\x1b[1m\x1b[36m%s\x1b[0m', 'Server running at', " http://localhost:" + port);
});
io.on('connect', function (socket) { return SocketManager_1.default(socket, io); });
