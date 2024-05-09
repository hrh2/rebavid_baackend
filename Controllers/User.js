const express = require('express');
const router = express.Router();
const { verifyToken, extractUserIdFromToken } = require('../Middlewares/Token-verification');
const {User} = require('../Models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.put('/', verifyToken, async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      image,
      password,
    } = req.body;
    try {
      const userID = extractUserIdFromToken(req);
      const user = await User.findById(userID);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Validate the user's password
      if (!password)return res.status(401).json({message: 'Please enter your password'});

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Create an object with the fields you want to update
      const updateFields = {};
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (image) updateFields.image = image;
  
      // Use findByIdAndUpdate to update the user document
      const updatedUser = await User.findByIdAndUpdate(userID, updateFields, { new: true });
  
      // Renew the user's JWT token
      const token = jwt.sign(
        { _id: user._id, email: user.email, phone: user.phone },
        process.env.JWT
      );
  
      return res.json({ message: 'Your account is up to date', token });
      
    } catch (err) {
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }
  });
  
  


router.delete('/:id',verifyToken, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

       return res.json({ message: 'Account deleted successfully' });
    } catch (err) {
       return res.status(500).send('Server error : ' + err.message);
    }
});

router.get('/',verifyToken, async (req, res) => {
    try {
        const userID=extractUserIdFromToken(req)
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).send('Server error : ' + err.message);
    }
});

module.exports = router;

