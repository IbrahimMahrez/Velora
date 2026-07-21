

const mongoose = require('mongoose');



const connectDB=function(){
  mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB...'))
            .catch(err => console.error('Could not connect to MongoDB...', err));
}


module.exports=connectDB