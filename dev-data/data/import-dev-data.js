const fs= require('fs');
const abc= require('./../../models/tourModel');
const User= require('./../../models/userModel');
const Review= require('./../../models/reviewModel');
const mongoose=require('mongoose');
const dotenv=require('dotenv');

dotenv.config({path:'./config.env'});

const DB=process.env.DATABASE;
console.log(DB);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
}).then(con =>{
    console.log(con.connections);
    console.log('Db connection successful');
}); 

// READ JSON FILE
const tours= JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users= JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews= JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));
// IMPORT DATA INTO DB

const importData=async () => {
    try{
      await abc.create(tours);
      await User.create(users,{validateBeforeSave: false});
      await Review.create(reviews);
      console.log('Data successfully loaded');
      process.exit();
    }catch(err){
       console.log(err);
    }
};

//DELETE ALL DATA FROM DB

const deleteData= async()=>{
    try{
        await abc.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
         console.log('Data successfully deleted');
         process.exit();
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2] === '--import'){
    importData();
}
else if(process.argv[2] === '--delete'){
    deleteData();
}
