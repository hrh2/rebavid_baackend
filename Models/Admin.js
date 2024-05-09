const mongoose=require('mongoose');
const joi=require('joi');
const passwordComplexity=require('joi-password-complexity');
require('dotenv').config();


const adminSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    phone: { type: Number, required: true, index: true }, 
    role: { type: String, required: true, index: true }, 
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    image: { type: String, required: false },
});

const validateAdmin = (data) => {
     const schema = joi.object({
        name: joi.string().required().label('Name'),
        email: joi.string().email().required().label('Email'),
        phone: joi.number().required().label('Phone Number'),
        role: joi.string().required().label('Role'),
        password: passwordComplexity().required().label('Password'),
        image: joi.allow(null).label('Image'),

     });
     return schema.validate(data);
};

const Admin=mongoose.model('Admins',adminSchema);
module.exports={
     Admin,
     validateAdmin,
 }
