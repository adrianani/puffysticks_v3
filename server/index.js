const {
    createServer
} = require('http'),
    express = require('express'),
    socketIo = require('socket.io'),
    mongoose = require('mongoose'),
    CronJob = require('cron').CronJob,
    fs = require('fs'),
    path = require('path'),
    // sep
    SocketManager = require('./SocketManager');

mongoose.connect('mongodb://80.240.24.96:27017/puffysticks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
//mongoose.set('debug', true);


new CronJob('0 */30 * * * *', function() {
    fs.readdir(path.resolve('./dist/imgs/temp/'), (err, files) => {
        if(err) console.log(err);
        files.forEach(file => {
            if(file !== '.gitkeep') {
                fs.stat(path.resolve('./dist/imgs/temp/', file), (err, stats) => {
                    if(err) console.log(err);
                    let now = new Date().getTime(),
                        deleteTime = new Date(stats.ctime).getTime() + 3_600_000;
                    if(now > deleteTime) {
                        fs.unlink(path.join('./dist/imgs/temp/', file), err => {
                            if(err) console.log(err);
                            let _id = file.split('.')[0];
                            mongoose.model('Image').deleteOne({_id}, err => {
                                if(err) console.log(err);
                            });
                        });
                    }
                });
            }
        });
    });
    fs.readdir(path.resolve('./dist/imgs/compr/'), (err, files) => {
        if(err) console.log(err);
        files.forEach(file => {
            if(file !== '.gitkeep') {
                fs.stat(path.resolve('./dist/imgs/compr/', file), (err, stats) => {
                    if(err) console.log(err);
                    let now = new Date().getTime(),
                        deleteTime = new Date(stats.ctime).getTime() + 3_600_000,
                        _id = file.split('.')[0];
                    mongoose.model('Image').findById(_id, 'processed', (err, image) => {
                        if(!image || image.processed) {
                            fs.unlink(path.join('./dist/imgs/compr/', file), err => {
                                if(err) console.log(err);
                            });
                        }
                        if(image && !image.processed && now > deleteTime) {
                            fs.unlink(path.join('./dist/imgs/compr/', file), err => {
                                if(err) console.log(err);
                                mongoose.model('Image').deleteOne({_id}, err => {
                                    if(err) console.log(err);
                                });
                            });
                        }
                    });
                });
            }
        });
    });
}, null, true);

let app = express(),
    server = createServer(app),
    io = socketIo(server),
    port = 8080;

app.get('/', (req, res) => {
    res.send();
});

server.listen(port, () => {
    console.log('\x1b[1m\x1b[97m%s\x1b[0m\x1b[1m\x1b[36m%s\x1b[0m', 'Server running at', ` http://localhost:${port}`);
});

io.on('connect', (socket) => SocketManager(socket, io));