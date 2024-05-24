const nodemailer = require('nodemailer');
const { Resend } =require("resend");
require('dotenv').config()
const resend = new Resend(process.env.MAILER_TOKEN);



/*onst transporter = nodemailer.createTransport({
    service: 'hotmail',
    host:"smtp.office365.com" ,
    port: 587,
    auth: {
        user: process.env.MAILER,
        pass: process.env.MAILER_PASSWORD
    }
});
*/

// Function to send verification email
/*
async function sendVerificationEmail(email, verificationCode,role) {
    const mailOptions = {
        from: process.env.MAILER,
        to: email,
        subject: 'REBAvid Verification Code',
        text: 'Below is a code for your email validation',
        html: `
            <h1>${verificationCode}</h1>
            <p>
            Click the following link to verify:
            <a href="https://rebavid-auth-api.onrender.com/api/v1/verify/email?email=${email}&code=${verificationCode}&role=${role}">Verify</a>
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
}*/
async function sendVerificationEmail(email, role) {
    const verificationCode = await generateOneTimeCode(email);
    if (!process.env.MAILER) {
        throw new Error("MAILER environment variable is not set.");
    }
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.MAILER,
            to: [email],
            subject: 'REBAvid Verification Code',
            text: 'Below is a code for your email validation',
            html: `
                <div>
                    <h1>${verificationCode}</h1>
                    <p>
                        Click the following link to verify:
                        <a href="https://rebavid-auth-api.onrender.com/api/v1/verify/email?email=${encodeURIComponent(email)}&code=${verificationCode}&role=${role}">Verify</a>
                    </p>
                </div>
            `
        });

        if (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
        return {
            success: true,
            data: data
        };
    } catch (error) {
        // console.error(`Error sending verification email to ${email}:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {sendVerificationEmail}