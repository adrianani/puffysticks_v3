"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var mongoose = require("mongoose");
var LangWord_1 = require("./mongoose/LangWord");
var Lang_1 = require("./mongoose/Lang");
mongoose.connect('mongodb://localhost:27017/puffysticks', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
var app = express(), server = http_1.createServer(app), io = socketIo(server), port = 8080;
app.get('/', function (req, res) {
    Lang_1.default.create({ shortcut: 'en', name: 'english', default: true }, function (err, lang) {
        LangWord_1.default.create({ key: 'work_with_us_question', string: 'Interested in working with us?', langid: lang._id }, { key: 'contact_us', string: 'get in touch', langid: lang._id }, { key: 'categories', string: 'categories', langid: lang._id }, { key: 'all', string: 'all', langid: lang._id }, { key: 'logos', string: 'logos', langid: lang._id }, { key: 'web_design', string: 'web design', langid: lang._id }, { key: 'ipb_themes', string: 'ipb design', langid: lang._id }, { key: 'illustrations_and_drawings', string: 'illustration & drawings', langid: lang._id });
    });
    res.send();
});
server.listen(port, function () {
    console.log("Running server on port " + port);
});
io.on('connect', function (socket) {
    console.log(socket.id);
    // Request lang string
    socket.on('get lang words', function (data, cb) {
        data.key = new RegExp("^(" + data.key + ")$");
        LangWord_1.default.find(data, { '_id': 0, 'string': 1, 'key': 1 }, function (err, docs) {
            var success = true, res = {}, errors = [];
            if (err) {
                success = false;
                errors.push('Unexpected lang error');
            }
            if (docs.length == 0) {
                success = false;
                errors.push('Unknown lang key');
            }
            docs.forEach(function (value) {
                res[value.key] = value.string;
            });
            cb({ success: success, res: res, errors: errors });
        });
    });
});
