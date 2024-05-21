require('dotenv').config();
const router = require('express').Router();
const { User, validateOnLogin } = require('../../Models/User');
const { Admin } = require('../../Models/Admin')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

router.post('/', async (req, res) => {
   try {
      const { error } = validateOnLogin(req.body);
      if (error) return res.status(400).send({ message: error.details[0].message });
      // Remove whitespace from email/phone input
      const email_phone = req.body.email_phone.replace(/\s/g, "");
      // Check if email_phone contains only digits (valid phone number)
      const isNumeric = /^\d+$/.test(email_phone);
      let user;
      if (isNumeric) {
         user = await User.findOne({ phone: parseInt(email_phone) });
      } else {
         user = await User.findOne({ email: email_phone });
      }
      if (!user) return res.status(401).send({ message: 'Invalid Email/Phone or Password' });
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(401).send({ message: 'Invalid Email/Phone or Password' });

      const token = jwt.sign({ _id: user._id, email: user.email, phone: user.phone }, process.env.JWT);
      res.status(200).send({ token: token });
   } catch (err) {
      res.status(500).send({ message: err.message });
   }
});

router.post('/admin', async (req, res) => {
   try {
      const { error } = validateOnLogin(req.body);
      if (error) return res.status(400).send({ message: error.details[0].message });
      const email_phone = req.body.email_phone.replace(/\s/g, "");
      const isNumeric = /^\d+$/.test(email_phone);
      let admin;
      if (isNumeric) {
         admin = await Admin.findOne({ phone: parseInt(email_phone) });
      } else {
         admin = await Admin.findOne({ email: email_phone });
      }
      if (!admin) return res.status(401).send({ message: 'Invalid Email/Phone or Password' });
      const validPassword = await bcrypt.compare(req.body.password, admin.password);
      if (!validPassword) return res.status(401).send({ message: 'Invalid Email/Phone or Password' });

      const token = jwt.sign({ _id: admin._id, email: admin.email, phone: admin.phone }, process.env.JWT);
      return res.status(200).send({ token: token });
   } catch (err) {
      return res.status(500).send({ message: err.message });
   }
});

// data validation functions

module.exports = router;
