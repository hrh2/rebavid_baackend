const randomatic = require('randomatic');
const { Schema, model } = require('mongoose');

const oneTimeCodeSchema = new Schema({
    email: String,
    code: String,
    expiresAt: Date,
    isUsed: { type: Boolean, default: false } // Add isUsed field to the schema
});

const OneTimeCode = model('OneTimeCode', oneTimeCodeSchema);

function generateCode() {
    return randomatic('0', 5);
}

async function generateOneTimeCode(email) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
    const newCode = new OneTimeCode({
        email: email,
        code: code,
        expiresAt: expiresAt
    });
    await newCode.save();
    return code;
}

async function validateOneTimeCode(email, code) {
    const now = new Date();
    const result = await OneTimeCode.findOne({ email: email, code: code });

    if (!result) {
        return { valid: false, message: 'No record found with the provided email and code' };
    } else if (result.isUsed) {
        return { valid: false, message: 'Code has already been used' };
    } else if (result.expiresAt <= now) {
        return { valid: false, message: 'Code has expired. Request another.' };
    } else {
        // Mark the code as used
        result.isUsed = true;
        await result.save();
        return { valid: true, message: 'Email verified Successfully' };
    }
}

module.exports = { generateOneTimeCode, validateOneTimeCode };
