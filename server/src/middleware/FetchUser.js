var jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// require("dotenv").config()

// let JWT_Secret = process.env.JWT_SECRET;
let JWT_Secret = "chat-app";
// console.log(process.env.JWT_SECRET)

const fetchUser = async (req, res, next) => {
    const token = req.header('authToken');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_Secret)
        req.user = data.user;
        req.user = await User.findById(req.user.id).select('-password')
        next()
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
}

module.exports = fetchUser; 