const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://fayzanrj:a4b65595@cluster0.1ln5rc1.mongodb.net/?retryWrites=true&w=majority';

const connectToMongo = ()=>{
    mongoose.connect(mongoURI).then(()=>{
        console.log('connected');
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = connectToMongo;
