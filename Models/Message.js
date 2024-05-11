const mongoose=require('mongoose');
const joi=require('joi');
require('dotenv').config();


const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    message: { type: String, required: true, index: true },
    isResolved: { type: Boolean, default: false },
});

const validateMessage = (data) => {
     const schema = joi.object({
          name: joi.string().required().label('Name'),
          message: joi.string().required().label('Message'),
          email: joi.string().email().required().label('Email'),
     });
     return schema.validate(data);
};

const Message=mongoose.model('Messages',messageSchema);


  
module.exports={
     Message,
     validateMessage
 }
