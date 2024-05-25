const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URL;

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  }).then(() => {
    console.log('MongoDB is connected');
  }).catch(err => {
    console.error('MongoDB connection unsuccessful, retry after 5 seconds.', err);
    setTimeout(connectWithRetry, 5000);
  });
};

connectWithRetry();

const conn = mongoose.connection;

const initializeGridFS = (options) => {
  return new Promise((resolve, reject) => {
    conn.once('open', () => {
      console.log('Connection to MongoDB is open');
      const gfs = new mongoose.mongo.GridFSBucket(conn.db, options);
      resolve(gfs);
    });
    conn.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      reject(err);
    });
    conn.on('disconnected', () => {
      console.error('MongoDB disconnected. Reconnecting...');
      connectWithRetry();
    });
  });
};

module.exports = initializeGridFS;
