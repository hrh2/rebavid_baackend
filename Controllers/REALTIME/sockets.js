const socketIo = require('socket.io');

function setupSocket(server) {
    const io = socketIo(server, {
        cors: {
            origin: "*",              // Allow connections from all domains
            methods: ["GET", "POST"], // Specify allowed methods
            credentials: true         // Whether to allow credentials (cookies, authorization headers, etc.)
        }
    });

    io.on('connection', (socket) => {
        // console.log('user online');
        // Register your event handlers
        require('../REALTIME/SendMessages')(socket, io);
        require('../REALTIME/RecievingMessages')(socket, io);
        // require('./socketHandlers/otherModuleHandler')(socket, io);

        socket.on('disconnect', () => {
            // console.log('A user disconnected');
        });
    });
}

module.exports = setupSocket;
