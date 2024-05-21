const jwt = require('jsonwebtoken');
require('dotenv').config();


function verifyToken(req, res, next) {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];
     if (!token) return res.status(401).send({ message: 'Unauthorized Access. First Login' });
     jwt.verify(token,process.env.JWT, (err, decoded) => { if (err) return res.status(403).send({ message: 'Forbidden to modify the Token. Login again' });
          req.user = decoded;
          next();
     });
}

const verifySocketsToken = (socket, next) => {
     const token = socket.handshake.auth.token;
     if (!token) {
         return next(new Error('Authentication error: Token missing'));
     }
     try {
         const decoded = jwt.verify(token, process.env.JWT);
         socket.decoded = decoded; // Attach the decoded token to the socket for later use
         next();
     } catch (error) {
         next(new Error('Authentication error: Invalid token'));
     }
 };
 
function extractUserIdFromToken(req) {
     const authHeader = req.headers.authorization;
     const token = authHeader ? authHeader.split(' ')[1] : null;

     const decodedToken = jwt.decode(token);
     const userId = decodedToken ? decodedToken._id : null;

     return userId;
}


function extractRoledFromToken(req) {
     const authHeader = req.headers.authorization;
     const token = authHeader ? authHeader.split(' ')[1] : null;

     const decodedToken = jwt.decode(token);
     const role = decodedToken ? decodedToken.role : null;

     return role;
}


module.exports = {verifyToken,extractUserIdFromToken,extractRoledFromToken,verifySocketsToken};