let {createServer}  = require('http'),
    express         = require('express'),
    socketIo        = require('socket.io'),
    mongoose        = require('mongoose'),
    // sep
    SocketManager   = require('./SocketManager');

mongoose.connect('mongodb://80.240.24.96:27017/puffysticks', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});
mongoose.set('debug', true);

let app     = express(),
    server  = createServer(app),
    io      = socketIo(server),
    port    = 8080;

app.get('/', (req, res) => {
    res.send();
});

server.listen(port, () => {
    console.log('\x1b[1m\x1b[97m%s\x1b[0m\x1b[1m\x1b[36m%s\x1b[0m', 'Server running at', ` http://localhost:${port}`);
});

io.on('connect', (socket) => SocketManager(socket, io));