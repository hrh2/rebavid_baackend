const socketIo = require('socket.io');

function setupSocket(server) {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('user online');
        // Additional event handlers can be registered here
        require('../REALTIME/SendMessages')(socket, io);
        require('../REALTIME/RecievingMessages')(socket, io);
        // require('./socketHandlers/otherModuleHandler')(socket, io);

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}

module.exports = setupSocket;
