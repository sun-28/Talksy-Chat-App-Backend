const router = require('express').Router();
const User = require('../models/User');
const {body , validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')


// SignUp Endpoint 
try {
    router.post('/signup',[
    body('name','Enter a valid name').isLength({min: 3}),
    body('email','Enter a valid email').isEmail(),
    body('password','Enter a valid password').isLength({min: 6})
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success,error: errors.array()[0].msg});
    }
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.json({success,error :"User With Same Email Already Exists!"});
    }
    user = await User.findOne({name: req.body.name});
    if(user){
        return res.json({success,error :"Username Already Exists!"});
    }

    const salt= await bcrypt.genSalt(10);
    secpass = await bcrypt.hash(req.body.password,salt)
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secpass,
    })
    success=true;
    res.json({success,user})
})
} catch (error) {
    console.log(error); 
    return res.send({success,error:"Error occured"}) 
}


// Login Endpoint
try {    
    router.post('/signin',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot can be blank').isLength({min:1}),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({success,error: errors.array()[0].msg});
    }
    const {email,password}=req.body
   let user = await User.findOne({email});
   if(!user){
    return res.json({success,error: "Invalid Credentials"})
}

const passwordCompare = await bcrypt.compare(password,user.password);

if(!passwordCompare){
       return res.json({success,error: "Invalid Credentials"})    
   }
    success = true;
    res.json({success,user})
})
} catch (error) {
    console.log(error); 
   return res.send({success,error:"Error occured"}) 
}

router.post('/setavatar/:id',async (req,res) =>{
    try {
        const userId = req.params.id;
        const avatarIMG = req.body.image;
        await User.findByIdAndUpdate(userId,{
            isAvatarSet: true,
            Avatar: avatarIMG
        })
        res.json({isSet:true,image:avatarIMG})
    } catch (error) {
        next(error);
    }
})

router.get('/getcontacts/:id',async (req,res,next)=>{
    try {
        const users = await User.find({_id:{$ne: req.params.id}}).select([
            'email',
            'name',
            'Avatar',
            '_id'
        ])
        res.json(users);
    } catch (err) {
        next(err);
    }
})

router.get('/logout/:id',async (req,res,next)=>{
    try {
        onlineUsers.delete(req.param.id);
        return res.send();
    } catch (err) {
        next(err);
    }
})

module.exports = router