const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
var fetchUser = require('../middleware/FetchUser');

router.get('/' , fetchUser , async (req, res)=>{
    const keyword = req.query.search ? {
        $or : [
            {name : {$regex : req.query.search , $options : "i"}},
            {email : {$regex : req.query.search , $options : "i"}},
        ]
    } : {};
    const users = await User.find(keyword).find({_id : {$ne : req.user._id}})
    res.send(users);
})

module.exports = router