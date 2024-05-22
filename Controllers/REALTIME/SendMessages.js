const { Message, validateMessage } = require('../../Models/Message');
const { verifyToken } = require('../../Middlewares/Token-verification');

module.exports = (socket, io) => {
    socket.on('send_message', async (data) => {
        try {
            const { error } = await validateMessage(data);
            if (error) {
                socket.emit('error_message', { message: error.details[0].message });
                return;
            }
            const message = new Message(data);
            await message.save();
            io.emit('new_message', message);  // Broadcast the message to all connected clients
            socket.emit('message_sent', { message: 'Message sent successfully!' });  // Acknowledge the sender
        } catch (error) {
            socket.emit('error_message', { message: error.message });
        }
    });
};
