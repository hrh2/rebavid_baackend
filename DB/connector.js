// connector.js
const mongoose = require('mongoose');
require('dotenv').config()

// Connect to MongoDB
const mongoURI =process.env.MONGODB_URL;
mongoose.connect(mongoURI);
const conn = mongoose.connection;

const initializeGridFS = () => {
  return new Promise((resolve, reject) => {
    conn.once('open', () => {
      // console.log('MongoDB connection opened');
      const gfs = new mongoose.mongo.GridFSBucket(conn.db);
      resolve(gfs);
    });
    conn.on('error', err => {
      // console.error('MongoDB connection error:', err);
      reject(err);
    });
  });
};

module.exports = initializeGridFS;
