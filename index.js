const express = require('express');
const cors = require('cors');


require('dotenv').config();
const PORT = process.env.PORT || 5000;

const videoRoutes = require('./Controllers/Videos')
const loginRoute = require('./Controllers/Login');
const signupRoute = require('./Controllers/Signup');
const verificationRoute = require('./Controllers/Verification')
const adminRoute = require('./Controllers/Admin')
const userRoute = require('./Controllers/User')

const app = express();
app.use(cors())
app.use(express.json({ limit: '1500mb' }));
app.use(express.urlencoded({extended:true,limit: '1500mb' }));
app.use('/api/v1/videos',videoRoutes)
app.use('/api/v1/login',loginRoute)
app.use('/api/v1/signup',signupRoute)
app.use('/api/v1/verify',verificationRoute)
app.use('/api/v1/user',userRoute)
app.use('/api/v1/admin',adminRoute)
app.get('/',async(req,res)=>{
   try{
    return res.status(200).send("online")
   }catch(error){
    return res.status(500).send(error.message)
   }
})

// Start server
app.listen(PORT, () => {
  // console.log(`Server is running on port http://localhost:${PORT}`);
});
