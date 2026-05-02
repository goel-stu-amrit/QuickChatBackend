const router = require('express').Router()
const User = require('../models/user')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')
const adminOnly = roleMiddleware(['admin'])

module.exports =(io) =>{
    router.post('/promote', authMiddleware, adminOnly, async(req, res)=>{
        try{
            const {userId} = req.body
            if (!userId) {
                return res.send({
                    message: "userId is required",
                    success: false
                })
            }
            const user = await User.findByIdAndUpdate(userId,
                {role:'agent'},
                {new:true}
            )
            
            if (!user) {
                return res.send({
                    message: "User not found",
                    success: false
                })
            }
            io.to(userId).emit('role-updated', { role: 'agent' })

            res.send({
                message:`${user.firstName} is now an agent`, 
                success:true,
                data:user
            })
        }catch(error){
            return res.send({
                message:error.message,
                success:false
            })
        }
    })

    return router
}