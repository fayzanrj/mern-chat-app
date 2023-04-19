const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors')
require("dotenv").config()

const app = express();
connectToMongo()
const port = process.env.PORT || 5000
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hi')
})

app.use(express.json())
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/chats', require('./routes/chats'))
app.use('/api/messages', require('./routes/messages'))

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

const io = require('socket.io')(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    console.log('connected to socket.io')
    
    socket.on('setup', (userData) => {
        socket.join(userData._id)
        socket.emit('connected');
    })

    socket.on('join-chat', (room) => {
        socket.join(room);
        console.log("user joined : " + room)
    })

    socket.on("send-message",(newMessageRecieved , chatDetails) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) {
            return console.log("chat not found")
        }
            socket.in(chatDetails._id).emit('message-received', newMessageRecieved)
    })
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
})
