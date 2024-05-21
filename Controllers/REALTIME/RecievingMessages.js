const { verifySocketsToken } = require('../../Middlewares/Token-verification');
const { Message, validateMessage } = require('../../Models/Message');

module.exports = (socket, io) => {
    socket.on('get_messages', verifySocketsToken, async () => {
        try {
            if (socket.role === ('CEO'||'COO'||'CTO'||'CFO'||'CMO')) {
                const messages = await Message.find();
                if (!messages || messages.length === 0) {
                    socket.emit('no_messages', { message: 'Currently no messages' });
                    return;
                }
                socket.emit('messages', messages);
            } else {
                socket.emit('error_message', { message: 'Only admins can read messages' });
            }
        } catch (error) {
            socket.emit('error_message', { message: error.message });
        }
    });
};
