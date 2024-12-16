const mongoose=require('mongoose');
const schema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    company:{
        type:String,
        required:true
    },
    location:String,
    description:String,
    salary:{
        type:Number,
        required:true
    }
});
const Userdb=mongoose.model('userdb',schema);
module.exports=Userdb;