const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')
const Chat = require('./../models/chat')


router.post('/create-new-chat', authMiddleware, async (req,res)=>{
    try{

        const chat = new Chat(req.body)

        const savedChat = await chat.save()

        res.status(201).send({
            message:"chat created successfully",
            success:true,
            data: savedChat
        })
    }catch(err){
        res.status(400).send({
            message:err.message,
            success:false
        })
    }
})

router.get('/get-all-chats', authMiddleware, async (req,res)=>{
    try{
        const allChats = await Chat.find({members:{$in : req.userId}})

        res.send({
            message:"chats fetched successfully",
            success:true,
            data: allChats
        })
    }catch(err){
        res.status(400).send({
            message: err.message,
            success:false
        })
    }
})

module.exports = router