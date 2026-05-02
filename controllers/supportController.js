const router = require('express').Router()
const SupportConversation = require('../models/supportConversation')
const supportMessage = require('../models/supportMessage')
const authMiddleware = require('./../middlewares/authMiddleware')

module.exports = (io) =>{
    router.post('/start' ,authMiddleware , async (req, res) =>{
        try{
            const userId = req.userId

            const existing = await SupportConversation.findOne({
                user:userId,
                status:{$in :['active', 'waiting']}
            })
            if(existing){
                return res.send({
                    message:"Existing conversation found",
                    success: true,
                    conversationId:existing._id,
                    status: existing.status,
                    handledBy: existing.handledBy
                })
            }
            const newConversation = new SupportConversation({
                user:userId
            })
            await newConversation.save()
            res.send({
                message:"Support Conversation created",
                conversationId:newConversation._id,
                status: newConversation.status,
                handledBy: newConversation.handledBy,
                success:true
            })
        }
        catch(error){
            return res.send({
                message: error.message,
                success: false
            })
        }
    })

    router.post('/message', authMiddleware, async (req, res)=>{
        try{
            const {conversationId, message} = req.body

            const userId = req.userId

            if (!conversationId || !message){
                return res.send({
                    message:"Conversation Id and message are required",
                    success:false
                })
            }

            const conversation = await SupportConversation.findById(conversationId)

            if(!conversation){
                return res.send({
                    message:"Invalid conversation Id",
                    success:false
                })
            }

            let sender = "user"
            if (conversation.handledBy === "agent"){
                if(conversation.assignedTo){
                    if(conversation.assignedTo.toString() === userId){
                        sender = "agent"
                    }
                    else if(conversation.user.toString() === userId){
                        sender = "user"
                    }
                    else{
                        return res.send({
                            message:"You are not authorized for this conversation",
                            success:false,
                        })
                    }
                }
            }

            const newMessage = new supportMessage({
                conversationId,
                sender,
                message
            })

            await newMessage.save()

            if(sender === "agent"){
                io.to(conversation.user.toString()).emit('support-receive-message', {
                    conversationId, 
                    sender:'agent',
                    message,
                    createdAt: new Date()
                })
            }

            if (sender === 'user' && conversation.handledBy === 'agent' && conversation.assignedTo) {
                io.to(conversation.assignedTo.toString()).emit('support-receive-message', {
                    conversationId,
                    sender: 'user',
                    message,
                    createdAt: new Date()
                })
            }

            let aiReply = null
            if(conversation.handledBy ==='ai'){
                const msg = message.toLowerCase()
                if(msg.includes("human") || msg.includes("agent") || msg.includes("not helpful")){
                    conversation.handledBy = "agent"
                    conversation.status = "waiting"

                    await conversation.save()
                    io.emit('new-waiting')

                    return res.send({
                        message: "Your request has been forwarded to a human agent",
                        success: true,
                        escalated: true
                    })
                }

                if (msg.includes("payment")){
                    aiReply = "Please check your payment status in billing section"
                }
                else if(msg.includes("login")){
                    aiReply = "Try resetting your password 'Forgot Password'."
                }
                else if(msg.includes("refund")){
                    aiReply = "Refunds are processed within 5-7 business days"
                }
                else{
                    aiReply = "Can you please describe your issue in more details"
                }

                const aiMessage = new supportMessage({
                    conversationId,
                    sender:'ai',
                    message:aiReply
                })

                await aiMessage.save()
            }
            res.send({
                message:"Message sent successfully",
                success:true,
                sender,
                aiReply

            })
        }catch(error){
            return res.send({
                message:error.message,
                success:false
            })
        }
    })

    router.get('/get-all-messages/:conversationId', authMiddleware, async (req, res) =>{
        try{
            const {conversationId} = req.params
            const userId = req.userId
            const conversation = await SupportConversation.findById(conversationId)

            if (!conversation){
                return res.send({
                    message:"conversation not found",
                    success:false
                })
            }

            if(
                conversation.user.toString() !== userId &&
                conversation.assignedTo?.toString() !== userId
            ){
                return res.send({
                    message:"You are not authorized to view these messages",
                    success:false
                })
            }
            const allMessages = await supportMessage.find({conversationId}).sort({createdAt: 1})

            res.send({
                message:"Messages successfully retrieved",
                success:true,
                data: allMessages
            })


        }catch(error){
            return res.send({
                message:error.message,
                success:false
            })
        }
    })

    router.post('/resolve', authMiddleware, async (req, res) =>{
        try{
            const {conversationId} = req.body
            const userId = req.userId

            const conversation = await SupportConversation.findById(conversationId)

            if (!conversation){
                return res.send({
                    message:"Conversation not found",
                    success:false
                })
            }

            if(!(conversation.user.toString() === userId || conversation.assignedTo?.toString()=== userId)){
                return res.send({
                    message:"You are not authorized to resolve this conversation",
                    success:false
                })
            }

            if(conversation.status === "resolved"){
                return res.send({
                    message:"Conversation is already resolved",
                    success:false
                })
            }

            conversation.status = "resolved"
            await conversation.save()

            io.to(conversation.user.toString()).emit('support-resolved',{userId : conversation.user.toString()})

            if(conversation.assignedTo){
                io.to(conversation.assignedTo.toString()).emit('support-resolved', {userId: conversation.user.toString()})
            }

            io.emit('new-waiting')

            res.send({
                message:"Conversation resolved successfully",
                success:true
            })

        }catch(error){
            return res.send({
                message:error.message,
                success:false
            })

        }
    })

    router.get('/active-conversations', authMiddleware, async (req, res) =>{
        try{
            const userId = req.userId

            const conversation = await SupportConversation.findOne({
                user:userId,
                status:{$in :['active', 'waiting']}
            })

            res.send({
                message: conversation ?
                "Active Conversation fetched successfully" : "No active converation found",
                success:true,
                data: conversation
            })
        }
        catch(error){
            return res.send({
                message: error.message,
                success:false
            })
        }
    })

    router.get('/history', authMiddleware, async (req, res) =>{
        try{
            const userId = req.userId

            const conversation = await SupportConversation.find({
                user:userId,
                status:'resolved'
            }).sort({createdAt:-1})

            res.send({
                message: "History fetched successfully",
                success:true,
                data: conversation
            })
        }
        catch(error){
            return res.send({
                message: error.message,
                success:false
            })
        }
    })

    return router
}