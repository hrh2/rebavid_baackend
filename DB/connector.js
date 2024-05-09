const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URL;
mongoose.connect(mongoURI);
const conn = mongoose.connection;

const initializeGridFS = (options) => {
  return new Promise((resolve, reject) => {
    conn.once('open', () => {
      const gfs = new mongoose.mongo.GridFSBucket(conn.db, options);
      resolve(gfs);
    });
    conn.on('error', err => {
      reject(err);
    });
  });
};

module.exports = initializeGridFS;
