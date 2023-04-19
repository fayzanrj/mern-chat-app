const express = require('express');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const router = express.Router();
var fetchUser = require('../middleware/FetchUser');


router.post('/', fetchUser, async (req, res) => {
    const { userId } = req.body;
    // checking if the userId is recieved
    if (!userId) {
        return res.send("No id");
    }
    // finding if the chat already exists
    let isChat = Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }) // popluting the information of the users who have chats
        .populate('users', "-password")
        .populate('latestMessage');
    // populating the chat
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });
    // sending the chat if it already exists else creating a new one
    if (isChat.length > 0) {
        res.send(isChat[0])
    } else { //creating new chat's data
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };
        try {
            const createdChat = await Chat.create(chatData);                 // creating new chat is the database
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(        // popluating the chat and sending it to the user
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
})

router.get('/', fetchUser, async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updateAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
                res.status(200).send(results)
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

})

router.post('/creategroup', fetchUser, async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.send("Enter full details")
    }

    let users = JSON.parse(req.body.users)
    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }
    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

router.put('/renamegroup' , fetchUser , async (req,res)=>{
    const {chatId , chatName } = req.body
    // checking if the required items are sent
    if(!chatId || !chatName){
        return res.send("Enter all values")
    }
    // finding and updating the name of the group
    let updatedChat = await Chat.findByIdAndUpdate(chatId , {
        chatName : chatName
    },{
        new:true,
    }) //populating all the users in the chat 
    .populate('users' , '-password')
    .populate('groupAdmin', '-password')
    // sending the updated name 
    if(!updatedChat){
        res.status(400)
        throw new Error('Not found')
    } else {
        res.json(updatedChat)
    }
})

router.put('/adduser' , fetchUser , async (req,res)=>{
    const {userId , chatId} = req.body;
    // checking if the user who requested is admin or not
    let group = await Chat.findById(chatId);
    if(group.groupAdmin._id.toString() != req.user._id){
        return res.send('Not permissible')
    } 
    let updatedGroup = await Chat.findByIdAndUpdate( chatId, {
        $pull : {users : userId}
    },{
        new : true
    })
    // finding the group and adding the new user
    updatedGroup = await Chat.findByIdAndUpdate( chatId, {
        $push : {users : userId}
    },{
        new : true
    })//populating all the users in the chat
    .populate('users' , "-password")
    .populate("groupAdmin" , "-password")
    //sending the updated group's all detais
    if(!updatedGroup){
        res.status(400)
        throw new Error('Not found')
    } else {
        res.json({
            updatedGroup  : updatedGroup,
            'status' : 'success',
            'msg' : 'has been added'
        })
    }
})

router.put('/removeuser' , fetchUser , async (req,res)=>{
    const {userId , chatId} = req.body;
    // checking if the user who requested is admin or not
    let group = await Chat.findById(chatId);
    if(group.groupAdmin._id.toString() != req.user._id){
        return res.send('Not permissible')
    } 
    // finding the group and removing the requested user
    let updatedGroup = await Chat.findByIdAndUpdate( chatId, {
        $pull : {users : userId}
    },{
        new : true
    })//populating all the users in the chat
    .populate('users' , "-password")
    .populate("groupAdmin" , "-password")
    //sending the updated group's all detais
    if(!updatedGroup){
        res.status(400)
        throw new Error('Not found')
    } else {
        res.json({
            updatedGroup  : updatedGroup,
            'status' : 'success',
            'msg' : 'has been removed'
        })
    }
})
router.put('/leavegroup' , fetchUser , async (req,res)=>{
    const {userId , chatId} = req.body;
    // checking if the user who requested is admin or not
    let group = await Chat.findById(chatId);
    // finding the group and removing the requested user
    let updatedGroup = await Chat.findByIdAndUpdate( chatId, {
        $pull : {users : userId}
    },{
        new : true
    })//populating all the users in the chat
    .populate('users' , "-password")
    .populate("groupAdmin" , "-password")
    //sending the updated group's all detais
    if(!updatedGroup){
        res.status(400)
        throw new Error('Not found')
    } else {
        res.json(updatedGroup)
    }
})

module.exports = router