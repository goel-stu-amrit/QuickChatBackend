const router = require('express').Router()
const authMiddleware = require('./../middlewares/authMiddleware')
const Chat = require('./../models/chat')
const Message = require('./../models/message')

router.post('/new-message',authMiddleware, async(req,res)=>{
    try{
        //store message in message collection
        const newMessage = new Message(req.body)
        const savedMessage = await newMessage.save()

        const currentChat  = await Chat.findById(req.body.chatId)

        const reciverId = currentChat.members.find((member)=> member.toString() !== req.userId)
    
        await Chat.findByIdAndUpdate(req.body.chatId, {
            lastMessage : savedMessage._id,
            ...(reciverId && {$inc : {unreadMessageCount : 1}})
        })

        res.status(201).send({
            message:"Message sent successfully",
            success:true,
            data: savedMessage
        })

        
    }catch(err){
        res.status(400).send({
            message:err.message,
            success:false
        })
    }
})

router.get('/get-all-messages/:chatId', authMiddleware, async (req, res) =>{
    try{
        const allMessages = await Message.find({chatId: req.params.chatId}).sort({createdAt :1})

        res.send({
            message:'Messages fetched successfully',
            success:true,
            data: allMessages
        })

    }catch(err){
        res.status(400).send({
            message:err.message,
            success:false
        })
    }
})

module.exports = router