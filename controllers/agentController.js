const router = require('express').Router()
const SupportConversation = require('../models/supportConversation')
const authMiddleware = require('./../middlewares/authMiddleware')
const roleMiddleware = require('./../middlewares/roleMiddleware')

const agentOnly = roleMiddleware(['agent', 'admin'])
module.exports = (io) =>{
    router.get('/waiting', authMiddleware, agentOnly, async (req, res)=>{
        try{
            const conversations = await SupportConversation.find({status:"waiting"}).populate("user")
            res.send({
                message:"in waiting chats",
                success:true,
                data:conversations
            })
        }
        catch(error){
            res.send({
                message:error.message,
                success:false
            })
        }
    })

    router.post('/assign', authMiddleware, agentOnly, async (req, res)=>{
        try{
            const {conversationId} = req.body
            const agentId = req.userId

            const conversation = await SupportConversation.findById(conversationId)

            if(!conversation){
                return res.send({
                    message:"Conversation not found",
                    success:false
                })
            }

            if (conversation.status !== 'waiting'){
                return res.send({
                    message:"Conversation is not available for assignment",
                    success:false
                })
            }

            conversation.assignedTo = agentId
            conversation.status = "active"
            conversation.handledBy = "agent"
            await conversation.save()

            io.to(conversation.user.toString()).emit('support-assigned', {userId: conversation.user.toString()})

            io.emit("new-waiting")

            res.send({
                message:"conversation assigned to you",
                success:true
            })

        }catch(error){
            res.send({
                message:error.message,
                success:false
            })
        }
    })

    router.get('/my-tickets', authMiddleware, agentOnly, async(req, res)=>{
        try{
            const agentId = req.userId

            const conversations = await SupportConversation.find({
                assignedTo:agentId,
                status:{$in:["active", "waiting"]}
            }).populate("user")

            res.send({
                message:"Assinged conversations found",
                success:true,
                data:conversations
            })
        }catch(error){
            res.send({
                message:error.message,
                success:false
            })
        }
    })

    return router
}