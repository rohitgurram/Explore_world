
const mongoose=require('mongoose');
const dotenv=require('dotenv');

dotenv.config({path:'./config.env'});

const app=require('./app');

const DB=process.env.DATABASE;
// console.log(DB);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
}).then(con =>{
    // console.log(con.connections);
    console.log('Db connection successful');
}).catch(err=> console.log("ERROR"));

// console.log(app.get('env'));//env is an environment variable

// console.log(process.env);


// const testTour=new Tour({
//     name: 'The Park Camper',
//     rating: 4.7,
//     price: 997
// });
 
// testTour.save().then(doc =>{
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR :',err)
// });

const port=process.env.PORT || 3000;
const server=app.listen(port,()=>{
    console.log(`app running on port ${port}...`);
});

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    });
});
