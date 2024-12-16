const mongoose=require('mongoose');
const connectDB=async ()=>{
    try{
        await
        mongoose.connect('mongodb://localhost:27017/jobsearchportal',{

        });
        console.log('database is connected');
    }
    catch(err){
        console.error('Error connecting to the database:',err);
        process.exit(1);
    }
};
module.exports=connectDB;