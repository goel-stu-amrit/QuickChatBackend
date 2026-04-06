const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})

const connectDB = require('./config/dbConfig')


const server = require('./app')

const port = process.env.PORT || 3000

connectDB().then(()=>{
    require('./jobs/cleanupUnverifiedUser')
    console.log("cleanup job loaded")
    server.listen(port, () => {
        console.log(`Listening to requests on port ${port}`)
    })  
})

