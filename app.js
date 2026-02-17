const express = require('express')
const cors = require('cors')
const app = express()
const authRouter = require('./controllers/authController')
const userRouter = require('./controllers/userController')
const chatRouter = require('./controllers/chatController')
const messageRouter = require('./controllers/messageController')

app.use(cors())
app.use(express.json({
    limit:'50mb'
}))
const server = require('http').createServer(app)

const io = require('socket.io')(server,{cors:{
    origin:['http://localhost:3000',
        process.env.FRONTEND_URL
    ],
    methods: ['GET', 'POST']
}})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)

const onlineUsers = []

//Testing socket connection with client
io.on('connection', socket =>{
    socket.on('join-room', userId =>{
        socket.join(userId)
    })

    socket.on('start-new-chat', chat=>{
        io
        .to(chat.members[0]._id)
        .to(chat.members[1]._id)
        .emit('new-chat-started', chat)
    })

    socket.on('send-message', (message)=>{
        io
        .to(message.members[0])
        .to(message.members[1])
        .emit('receive-message', message)

        io
        .to(message.members[0])
        .to(message.members[1])
        .emit('set-message-count', message)
    })

    socket.on('clear-unread-message', data=>{
        io
        .to(data.members[0])
        .to(data.members[1])
        .emit('cleared-message-count', data)
    })

    socket.on('user-typing', (data)=>{
        io
        .to(data.members[0])
        .to(data.members[1])
        .emit('started-typing', data)
    })

    socket.on('user-login', userId=>{
        if(!onlineUsers.includes(userId)){
            onlineUsers.push(userId)
        }
        io.emit('online-users', onlineUsers)
    })
    socket.on('user-offline', userId=>{
        onlineUsers.splice(onlineUsers.indexOf(userId), 1)
        io.emit('online-users-updated', onlineUsers)
    })
})

module.exports = server 