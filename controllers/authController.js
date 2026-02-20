const router = require('express').Router()
const User = require('./../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendOTPEmail = require('../utils/sendEmail')

router.post('/signup', async (req, res) =>{
    try{
        if (!req.body.password || req.body.password.length < 8) {
            return res.send({
                message: "Password must be at least 8 characters long",
                success: false
            })
        }

        const user = await User.findOne({email: req.body.email})

        if(user){
            return res.send({
                message: "User Already Exist!!!",
                success:false
            })
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const otp = crypto.randomInt(100000, 999999)

        const hashedOTP = crypto.createHash("sha256").update(otp.toString()).digest("hex")

        const newUser = new User({
            ...req.body,
            password: hashedPassword,
            emailVerified: false,
            emailOTP: hashedOTP,
            otpExpiresAt: Date.now() + 10*60*1000
        })

        await newUser.save()

        await sendOTPEmail(newUser.email, otp)

        res.status(201).send({
            message:"OTP sent to your email. Please verify.",
            success: true
        })

    }catch(error){
        res.send({
            message:error.message,
            success:false
        })
    }
})

router.post('/verify-email', async(req, res)=>{
    try{
        const {email, otp} = req.body

        const user= await User.findOne({email}).select('+emailOTP')

        if(!user){
            return res.send({
                success: false,
                message:"User not found"
            })
        }

        const hashedInputOTP = crypto.createHash('sha256').update(otp.toString()).digest("hex")

        if(user.emailOTP !== hashedInputOTP || user.otpExpiresAt < Date.now()){
            return res.send({
                message:"Invalid or Expired OTP",
                success:false
            })
        }

        user.emailVerified = true
        user.emailOTP = null
        user.otpExpiresAt = null

        await user.save()

        res.send({
            message: "Email Verified Successfully",
            sucess:true
        })
    }
    catch(error){
        res.send({
            message: error.message,
            success:false
        })
    }
})

router.post('/login', async (req, res) =>{
    try{

        if (!req.body.email || !req.body.password) {
            return res.send({
                message: "Email and password are required",
                success: false
            })
        }

        let user = await User.findOne({email: req.body.email}).select('+password')

        if(!user){
            return res.send({
                message:"User does not exist",
                success: false
            })
        }
        const isValid = await bcrypt.compare(req.body.password, user.password)
        if(!isValid){
            return res.send({
                message:"Invalid password",
                success: false
            })
        }

        if(!user.emailVerified){
            return res.send({
                message:"Please verify email before login",
                success :false
            })
        }

        const token = jwt.sign({userId : user._id}, process.env.SECRET_KEY, {expiresIn: "1d"})
        res.send({
            message: "User logged-in successfully",
            success: true,
            token : token
        })
    }catch(error){
        res.send({
            message: error.message,
            success:false
        })
    }
})

module.exports = router
