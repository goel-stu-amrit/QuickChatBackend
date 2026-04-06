const mongoose = require('mongoose')

const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("DB connected Successfully")
    }catch(err){
        console.error("DB connection failed", err.message)
    }
}
module.exports = connectDB