const mongoose = require('mongoose')

//Connection logic
mongoose.connect(process.env.DB_URL)

//connection state
const db = mongoose.connection

db.on('connected', ()=>{
    console.log("DB conected Successful!!")
})

db.on('err', ()=>{
    console.log("DB connection failed!!")
})

module.exports = db