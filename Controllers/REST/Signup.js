const router = require('express').Router();
const { User, validateUser } = require('../../Models/User');
const { Admin, validateAdmin } = require('../../Models/Admin')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../MAILING/emailVerification')
require('dotenv').config();


router.post('/', async (req, res) => {
    try {
        // Validate user input
        const { error } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if email is already in use
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "That email has been used by another user" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user instance
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            image: req.body.image,
            isVerified: false,
        });

        

        // Send verification email
        try {
            await sendVerificationEmail(req.body.email, "User");
            
            // Save the user to the database
            await user.save();
            
            // Generate JWT token
            const token = jwt.sign(
                { _id: user._id, email: user.email, phone: user.phone },
                process.env.JWT,
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            return res.status(200).send({ token, message: 'Validation code sent. Check your email.' });
        } catch (emailError) {
            console.error(`Error sending verification email: ${emailError}`);
            return res.status(500).json({ message: 'Error sending verification email. Please try again later.' });
        }
    } catch (serverError) {
        console.error(`Server error: ${serverError}`);
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
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

        // const verificationCode = await generateOneTimeCode(req.body.email);

        try {
            await sendVerificationEmail(req.body.email, "Admin");
            // Save the user
            await admin.save();
            // Generate JWT token
            const token = jwt.sign({ _id: admin._id, email: admin.email, phone: admin.phone,role:admin.role}, process.env.JWT);
            return res.status(200).send({ token: token, message: 'Validation code sent. Check your email.' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
