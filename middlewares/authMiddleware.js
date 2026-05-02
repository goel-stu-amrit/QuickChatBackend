const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = async (req, res, next)=>{
    try{
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).send({
                message:'Authorization header missing or invalid',
                success:false
            })
        }
        const token = authHeader.split(' ')[1]
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
        req.userId = decodedToken.userId
        const user = await User.findById(req.userId)
        req.user = user
        next()
    }catch(err){
        res.send({
            message:err.message,
            success:false
        })
    }
}