const router = require('express').Router();
const { Message,validateMessage } = require('../Models/Message');
require('dotenv').config();

router.post('/us', async (req, res) => {
    try {
        const { error } =await validateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const message = new Message(req.body);
            // Save the user
        await message.save();
        return res.status(201).json({ message: "Message Sent!"});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/us',verifyToken, async (req, res) => {
    try {
        const messages = await Message.find();
        if (!messages) {
            return res.status(404).json({ message: 'Currently no messages' });
        }
        return res.status(200).json(messages);
    } catch (err) {
        return res.status(500).json({message:err.message});
    }
});

module.exports=router