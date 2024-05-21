const express = require('express');
const router = express.Router();
const { validateOneTimeCode } = require('../../Models/OneTimeCode');
const { User } = require('../../Models/User'); // Import your User model
const { Admin } = require('../../Models/Admin');

// Define a route to handle email verification
router.get('/email', async (req, res) => {
    try {
        const { email, code, role } = req.query;
        const { valid, message } = await validateOneTimeCode(email, code);
        if (valid) {
            // If the email validation is successful, update the user's isVerified property
            let user;
            if (role == "Admin") {
                user = await Admin.findOneAndUpdate(
                    { email: email },
                    { $set: { isVerified: true } },
                    { new: true }
                );
            } else {
                user = await User.findOneAndUpdate(
                    { email: email },
                    { $set: { isVerified: true } },
                    { new: true }
                );
            }
            if (user) {
                return res.status(200).send(`
                    <html>
                        <head><title>Email Verified</title></head>
                        <body>
                            <h1>Email Verified Successfully</h1>
                            <p>Your email (${email}) has been verified.</p>
                            Continue<a href="https://anfilms.vercel.app">an_videos</a>
                        </body>
                    </html>
                `);
            } else {
                return res.status(404).send('User not found');
            }
        } else {
            return res.status(400).send(message);
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

module.exports = router;
