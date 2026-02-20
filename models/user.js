const { type } = require('express/lib/response')
const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required:true
    },
    lastName : {
        type: String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        select:false,
        minlength: 8
    },
    profilePic:{
        type:String,
        required:false
    },
    emailVerified:{
        type:Boolean,
        default: false
    },
    emailOTP : {
        type: String,
        select:false
    },
    otpExpiresAt:{
        type: Date
    }
}, {timestamps:true}) 

module.exports = mongoose.model("users", userSchema)