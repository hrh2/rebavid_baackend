const express = require('express');
const router = express.Router();
const { verifyToken, extractUserIdFromToken } = require('../Middlewares/Token-verification');
const {Admin} = require('../Models/Admin')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.put('/', verifyToken, async (req, res) => {
    const {
        name,
        email,
        phone,
        image,
        password,
    } = req.body;
    try {
      const userID = extractUserIdFromToken(req);
      const admin = await Admin.findById(userID);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      // Validate the user's password
      if (!password)return res.status(401).json({message: 'Please enter your password'});

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Create an object with the fields you want to update
      const updateFields = {};
      if (name) updateFields.email = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (image) updateFields.image = image;
  
      // Use findByIdAndUpdate to update the user document
      const updatedUser = await Admin.findByIdAndUpdate(userID, updateFields, { new: true });
  
      // Renew the user's JWT token
      const token = jwt.sign(
        { _id: admin._id, email: admin.email, phone: admin.phone },
        process.env.JWT
      );
  
      return res.json({ message: 'Your account is up to date', token });
      
    } catch (err) {
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }
  });
  
  


router.delete('/:id',verifyToken, async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

       return res.json({ message: 'Account deleted successfully' });
    } catch (err) {
       return res.status(500).send('Server error : ' + err.message);
    }
});

router.get('/',verifyToken, async (req, res) => {
    try {
        const userID=extractUserIdFromToken(req)
        const admin = await Admin.findById(userID);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        return res.status(200).json(admin);
    } catch (err) {
        return res.status(500).send('Server error : ' + err.message);
    }
});

module.exports = router;

