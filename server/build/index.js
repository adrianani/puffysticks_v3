"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var app = express(), server = http_1.createServer(app), io = socketIo(server), port = 8080;
app.get('/', function (req, res) {
    res.send();
});
server.listen(port, function () {
    console.log("Running server on port " + port);
});
io.on('connect', function (socket) {
    console.log(socket.id);
});
