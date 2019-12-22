import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

let app = express(),
    server  = createServer(app),
    io      = socketIo(server),
    port    = 8080;

app.get('/', (req, res) => {
    res.send();
});

server.listen(port, () => {
    console.log(`Running server on port ${port}`);
});


io.on('connect', (socket: any) => {
    console.log(socket.id);
});