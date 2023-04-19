const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchUser = require('../middleware/FetchUser');
// require("dotenv").config()

let JWT_Secret = "chat-app";

router.post('/registeruser', async (req, res) => {
    const {name , email , password , pic} = req.body;
    if( !name || !email || !password){
       return res.send("Wrong credentials");
    }
    try {
        //checking if user already exists and acting accordingly
        let userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.json({
                'status': "failed",
                'msg': "Sorry! A user with this email already exists"
            })
        }
        //creating hash of entered password and adding salt to it, then storing it in DATABASE and giving the user an AUTH TOKEN
        var salt = await bcrypt.genSalt(10);
        var secPass = await bcrypt.hash(password, salt);
        let user = await User.create({
            name: name,
            email: email.toLowerCase(),
            password: secPass,
            pic : pic,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        var authToken = jwt.sign(data, JWT_Secret);

        if(user){
            res.json({
                'status': "success",
                'msg': "User created"
            })
        }


    } catch (err) {
        console.error(err.message);
        res.status(500).send("Some Error occured");
    }
})

router.post('/login', async (req, res) => {
    const {email , password} = req.body;
    try {
        //checking if user exists and acting accordingly
        let userExists = await User.findOne({ email: email.toLowerCase() });
        if (!userExists) {
            return res.json({
                'status': "failed",
                'msg': "Credentials does not match."
            })
        }
        //comparing the hash of entered password with the hash of password linked to the email provided and on TRUE giving the user an AUTH TOKEN
        const passwordCompare = await bcrypt.compareSync(password, userExists.password);
        if (!passwordCompare) {
            return res.json({
                'status': "failed",
                'msg': "Credentials does not match."
            })
        }
        const data = {
            user: {
                id: userExists.id
            }
        }
        var authToken = await jwt.sign(data, JWT_Secret);

        res.json({
            'status': "success",
            'msg': "Logged in",
            "name" : userExists.name,
            "email" : userExists.email,
            'authToken': authToken,
            'pic' : userExists.pic,
            '_id' : userExists._id
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router