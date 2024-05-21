const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const videoRoutes = require('./Controllers/REST/Videos');
const loginRoute = require('./Controllers/REST/Login');
const signupRoute = require('./Controllers/REST/Signup');
const verificationRoute = require('./Controllers/REST/Verification');
const adminRoute = require('./Controllers/REST/Admin');
const userRoute = require('./Controllers/REST/User');
const messageRoute = require('./Controllers/REST/Message');

const app = express();
const server = http.createServer(app);
const setupSocket = require('./Controllers/REALTIME/sockets');

app.use(cors());
app.use(express.json({ limit: '1500mb' }));
app.use(express.urlencoded({ extended: true, limit: '1500mb' }));

app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/login', loginRoute);
app.use('/api/v1/signup', signupRoute);
app.use('/api/v1/verify', verificationRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/message', messageRoute);

app.get('/', async (req, res) => {
  try {
    return res.status(200).send("online");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// Setup Socket.IO
setupSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
