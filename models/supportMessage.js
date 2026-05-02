const mongoose = require('mongoose')

const supportMessage = new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"supportConversations",
        required:true
    },
    sender:{
        type:String,
        enum:['user', 'ai', 'agent'],
        required:true
    },
    message:{
        type:String,
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model('supportMessages', supportMessage) 