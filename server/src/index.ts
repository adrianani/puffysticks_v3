import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as mongoose from 'mongoose';
// sep
import {LangRequest} from './interfaces';
import LangWord from './mongoose/LangWord';
import Lang from './mongoose/Lang';

mongoose.connect('mongodb://localhost:27017/puffysticks', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

let app             = express(),
    server: Server  = createServer(app),
    io              = socketIo(server),
    port            = 8080;

app.get('/', (req, res) => {
    Lang.create({shortcut: 'en', name: 'english', default: true}, (err, lang) => {
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
    });
    res.send();
});

server.listen(port, () => {
    console.log(`Running server on port ${port}`);
});

io.on('connect', (socket: any) => {
    console.log(socket.id);

    // Request lang string
    socket.on('get lang words', (data: LangRequest, cb: (res: object) => void ): void => {
        data.key = new RegExp(`^(${data.key})$`);
        LangWord.find(data, {'_id': 0, 'string': 1, 'key': 1}, (err, docs) => {
            let success = true,
                res = {},
                errors: string[] = [];
            if(err) {
                success = false;
                errors.push('Unexpected lang error');
            }

            if(docs.length == 0) {
                success = false;
                errors.push('Unknown lang key');
            }

            docs.forEach(value => {
                res[value.key] = value.string;
            });

            cb({success, res, errors});
        });
    });
});