const cron = require('node-cron');
const User = require('../models/user')

cron.schedule('0 * * * *', async ()=>{
    try{
        console.log("cron running")
        const cutOff = new Date(Date.now() - 24*60*60*1000)

        const result = await User.deleteMany({
            emailVerified: false,
            createdAt : {$lt : cutOff}
        })

        console.log("Clean-up job ran: ", result.deletedCount, "user removed")
    }
    catch(error){
        console.log("cron error", error.message)
    }

})