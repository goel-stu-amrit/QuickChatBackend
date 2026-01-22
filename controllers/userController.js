const router = require('express').Router()
const User = require('./../models/user')
const authMiddleware = require('./../middlewares/authMiddleware')


router.get('/get-logged-user', authMiddleware , async (req, res)=>{
    try{
        const user = await User.findOne({_id: req.userId})
    
        res.send({
            message:"user Fetched successfully",
            success:true,
            data: user
        })
    }catch(err){
        res.status(400).send({
            message: err.message,
            success:false
        })
    }
})


router.get('/get-all-users', authMiddleware , async (req, res)=>{
    try{
        let uId = req.userId
        const allUser = await User.find({ _id : {$ne : uId}})

        res.send({
            message:"All users Fetched successfully",
            success:true,
            data: allUser
        })
    }catch(err){
        res.status(400).send({
            message: err.message,
            success:false
        })
    }
})

module.exports  = router