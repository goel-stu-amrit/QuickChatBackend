const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')
const Chat = require('./../models/chat')
const Message = require('../models/message')

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
                                .populate('members')
                                .populate('lastMessage')
                                .sort({updatesAt :-1})

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

router.post('/clear-unread-message', authMiddleware, async (req, res)=>{
    try{
        const chatId = req.body.chatId

        //We want to update he unread message count in chat collection
        const chat = await Chat.findById(chatId)
        if(!chat){
            res.send({
                message:"No Chat Found",
                success: false,
            })
        }
        const updatedChat = await Chat.findByIdAndUpdate(chatId,
            { unreadMessageCount:0},
            { new:true}
        ).populate('members').populate('lastMessage')

        //we want to update the read property to true in message collection
        await Message.updateMany(
            { chatId: chatId, read: false},
            { read: true}
        )
        res.send({
            message: "Unread message cleared successfully",
            success: true,
            data: updatedChat
        })
    }catch(error){
        res.send({
            message:error,
            success: false,

        })
    }
})

module.exports = router