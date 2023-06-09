const express = require('express');
const fetchUser = require('../middleware/FetchUser');
const Message = require('../models/msgModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const router = express.Router();


router.post('/sendmessage' , fetchUser , async(req,res)=>{
    const {content , chatId} = req.body;

    if(!content || !chatId){
        console.log('inavlid data')
        return res.sendStatus(400)
    }

    var newMessage = {
        sender : req.user.id,
        content : content,
        chat : chatId
    }

    try {
        var message = await Message.create(newMessage)

        message = await message.populate('sender' , 'name pic')
        message = await message.populate('chat')
        message = await User.populate(message , {
            path : 'chat.users',
            select : "name pic email",
        })

        await Chat.findByIdAndUpdate(req.body.chatId , {
            latestMessage : message,
        })

        res.json(message)
    } catch (error) {
        console.log(error)
    }
})

router.get('/fetchallmessages/:chatId' , fetchUser , async(req, res)=>{
    try {
        const messages = await Message.find({chat:req.params.chatId}).populate('sender',"name pic email").populate("chat")
        res.json(messages)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router