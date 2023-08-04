const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socket=require('socket.io');

const app = express();

require('dotenv').config();

app.use(cors({
    origin:process.env.SOCKET_URL,
    methods:["GET","POST","PUT","DELETE"]
}));
app.use(express.json());
app.use('/api/auth',require('./routes/Auth'))
app.use('/api/msg',require('./routes/Msg'))


mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log("DB Connected");
}).catch((err)=>{console.log(err)})

const server = app.listen(process.env.PORT,()=>{
    console.log(`Connected to server on port ${process.env.PORT}`);
})

const io=socket(server,{
    cors:{
        origin:process.env.SOCKET_URL,
        Credential:true,
    }
})
global.onlineUsers=new Map();

io.on("connection",(socket)=>{
    global.chatSocket=socket;
    socket.on('add-user',(userId)=>{
        onlineUsers.set(userId,socket.id);
    })
    socket.on('send-msg',(data)=>{
        const sendUserSocket= onlineUsers.get(data.to)
        if(sendUserSocket){
            socket.to(sendUserSocket).emit('msg-recieve',data.message);
        }
    })
})
