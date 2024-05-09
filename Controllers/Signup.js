const router = require('express').Router();
const { User, validateUser } = require('../Models/User');
const {Admin,validateAdmin} = require('../Models/Admin')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOneTimeCode } = require('../Models/OneTimeCode');
const {sendVerificationEmail} = require('./mailing/emailVerification')
require('dotenv').config();

router.post('/', async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            password: hash,
            image: req.body.image,
            isVerified: false,
        });

        const verificationCode = await generateOneTimeCode(req.body.email);

        try {
            await sendVerificationEmail(req.body.email, verificationCode,"User");
            // Save the user
            await user.save();
            // Generate JWT token
            const token = jwt.sign({ _id: user._id, email: user.email, phone: user.phone }, process.env.JWT);

            return res.status(200).send({ token: token, message: 'Validation code sent. Check your email.' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/admin', async (req, res) => {
    try {
        const { error } = validateAdmin(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        
        const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            password: hash,
            image: req.body.image,
            isVerified: false,
        });

        const verificationCode = await generateOneTimeCode(req.body.email);

        try {
            await sendVerificationEmail(req.body.email, verificationCode,"Admin");
            // Save the user
            await admin.save();
            // Generate JWT token
            const token = jwt.sign({ _id: admin._id, email: admin.email, phone: admin.phone }, process.env.JWT);
            return res.status(200).send({ token: token, message: 'Validation code sent. Check your email.' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
