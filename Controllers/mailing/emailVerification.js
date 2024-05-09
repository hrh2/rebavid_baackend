const nodemailer = require('nodemailer');
require('dotenv').config();



const transporter = nodemailer.createTransport({
    service: 'hotmail',
    // host:"smtp.office365.com" ,
    // port: 587,
    auth: {
        user: process.env.MAILER,
        pass: process.env.MAILER_PASSWORD
    }
});

// Function to send verification email
async function sendVerificationEmail(email, verificationCode,role) {
    const mailOptions = {
        from: process.env.MAILER,
        to: email,
        subject: 'anfilms Verification Code',
        text: 'Below is a code for your email validation',
        html: `
            <h1>${verificationCode}</h1>
            <p>
            Click the following link to verify:
            <a href="https://api-anfilms.onrender.com/api/v1/verify/email?email=${email}&code=${verificationCode}&role=${role}">Verify</a>
            </p>
        `
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
}


module.exports = {sendVerificationEmail}