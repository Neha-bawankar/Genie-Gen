const mongoose = require('mongoose');
//Pass :Msm9E6JqmIBPLhuq
const connectDB = async () =>{
    try{
      const conn = await mongoose.connect('mongodb+srv://nehabawankar88:Msm9E6JqmIBPLhuq@cluster0.llz7f.mongodb.net/blog-content-Ai?retryWrites=true&w=majority&appName=Cluster0')
      console.log(`Mongodb connected ${conn.connection.host}`);
    } catch(error){
          console.error(`Error connecting to MangoDB ${error.message}`)
          process.exit(1);
    }
};

module.exports = connectDB;