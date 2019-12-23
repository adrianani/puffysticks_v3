"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var mongoose = require("mongoose");
var LangWord_1 = require("./mongoose/LangWord");
var Lang_1 = require("./mongoose/Lang");
mongoose.connect('mongodb://80.240.24.96:27017/puffysticks', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
//mongoose.set('debug', true);
var app = express(), server = http_1.createServer(app), io = socketIo(server), port = 8080;
app.get('/', function (req, res) {
    res.send();
});
server.listen(port, function () {
    console.log('\x1b[1m\x1b[97m%s\x1b[0m\x1b[1m\x1b[36m%s\x1b[0m', 'Server running at', " http://localhost:" + port);
});
io.on('connect', function (socket) {
    console.log(socket.id);
    /* Lang.create({shortcut: 'en', name: 'english', default: true}, (err, lang) => {
        console.log(lang.id, err);
        LangWord.create(
            {key: 'work_with_us_question', string: 'Interested in working with us?', langid: lang._id},
            {key: 'contact_us', string: 'get in touch', langid: lang._id},
            {key: 'categories', string: 'categories', langid: lang._id},
            {key: 'all', string: 'all', langid: lang._id},
            {key: 'logos', string: 'logos', langid: lang._id},
            {key: 'web_design', string: 'web design', langid: lang._id},
            {key: 'ipb_themes', string: 'ipb design', langid: lang._id},
            {key: 'illustrations_and_drawings', string: 'illustration & drawings', langid: lang._id},
        );
    }); */
    /**
     * @desc fetch lang words from database on request
     * @param RequestLangWords  data    - words to be returned
     * @param function          cb      - callback to execute with response
     *
     * @return void
     */
    socket.on('get lang words', function (data, cb) {
        LangWord_1.default.find({
            key: { $in: data.key },
            langid: data.langid,
            articleid: data.articleid,
        }, {
            '_id': 0,
            'string': 1,
            'key': 1
        }, function (err, docs) {
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
    // Create lang words
    socket.on('create lang words', function (data, cb) {
        Lang_1.default.create(data, function (err, docs) {
        });
    });
});
