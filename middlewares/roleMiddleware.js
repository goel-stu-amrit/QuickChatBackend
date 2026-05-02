module.exports = (roles) => (req, res, next) =>{
    if(!req.user || !roles.includes(req.user.role)){
        return res.send({
            message:"You are not authorized to access this",
            success:false
        })
    }
    next()
}