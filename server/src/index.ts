import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as mongoose from 'mongoose';
// sep
import SocketManager from './SocketManager';

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

io.on('connect', (socket: any) => SocketManager(socket, io));