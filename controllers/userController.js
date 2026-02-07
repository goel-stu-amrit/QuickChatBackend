const router = require('express').Router()
const User = require('./../models/user')
const authMiddleware = require('./../middlewares/authMiddleware')
const cloudinary = require('./../cloudinary')


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


router.post('/upload-profile-pic', authMiddleware, async (req,res) =>{
    try{
        const image= req.body.image
        //upload image to cloudinary
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder:'quick-chat'
        })

        //update user model & set profile pic property
        const user = await User.findByIdAndUpdate(
            {_id: req.userId},
            {profilePic : uploadedImage.secure_url},
            {new:true}
        )

        res.send({
            message:"profile pic updated successfully",
            success:true,
            data:user
        })

    }catch(err){
        res.send({
            message:err.message,
            success:false
        })
    }
})


module.exports  = router