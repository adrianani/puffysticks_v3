import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as mongoose from 'mongoose';
// sep
import {RequestLangWords} from './interfaces';
import LangWord from './mongoose/LangWord';
import Lang from './mongoose/Lang';

mongoose.connect('mongodb://80.240.24.96:27017/puffysticks', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
//mongoose.set('debug', true);

let app             = express(),
    server: Server  = createServer(app),
    io              = socketIo(server),
    port            = 8080;

app.get('/', (req, res) => {
    res.send();
});

server.listen(port, () => {
    console.log('\x1b[1m\x1b[97m%s\x1b[0m\x1b[1m\x1b[36m%s\x1b[0m', 'Server running at', ` http://localhost:${port}`);
});

io.on('connect', (socket: any) => {
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
    socket.on('get lang words', (data: {[key: string]: any}, cb: (res: object) => void ): void => {

        LangWord.find(
            { 
                key: { $in: data.key },
                langid: data.langid,
                articleid: data.articleid,
            }, 
            {
                '_id': 0, 
                'string': 1, 
                'key': 1
            }, (err, docs) => {
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

    // Create lang words
    socket.on('create lang words', (data: object[], cb: (res: object) => void ): void => {
        Lang.create(data, (err, docs) => {
            
        });
    });
});