const mongoose = require('mongoose')

const supportConversationSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    handledBy:{
        type:String,
        enum:["ai", "agent"],
        default:"ai"
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        default:null
    },
    status:{
        type:String,
        enum:['active', 'waiting', 'resolved'],
        default:'active'
    } 
},{timestamps:true});

module.exports = mongoose.model('supportConversations', supportConversationSchema) 
