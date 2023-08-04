const router = require('express').Router();
const Message = require('../models/Message');


router.post('/addmsg',async (req,res,next)=>{
    try {
        const {from,to,msg} = req.body;
        const data = await Message.create({
            message: {text: msg},
            users:[from,to],
            sender:from,
        })
        if(data){
            return res.json({msg: "Message Added Successfully"})
        }
        return res.json({msg: "Failed"}) 
    } catch (error) {
        next(error);        
    }
})


router.post('/getmsg',async (req,res)=>{
    try {
        const {from,to} = req.body;
        const messages  = await Message.find({
            users:{
                $all: [from,to]
            }
        }).sort({updatedAt: 1})
        const projectMsg = messages.map((msg)=>{
            return {
                fromSelf:msg.sender.toString()===from,
                message: msg.message.text
            }
        })
        res.json(projectMsg)
    } catch (error) {
        next(error)
    }  
})

module.exports = router
