const express= require('express');
const path =require('path');
const fs= require('fs')
const app= express();
const morgan= require('morgan');
const AppError= require('./utils/appError');
const globalErrorHandler= require('./controllers/errorController');
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const reviewRouter= require('./routes/reviewRoutes');
const bookingRouter=require('./routes/bookingRoutes');
const rateLimit = require('express-rate-limit');
const helmet =require('helmet');
const hpp = require('hpp');
const cookieParser= require('cookie-parser');
const viewRouter= require('./routes/viewRoutes');
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

console.log(process.env.NODE_ENV);
// app.use(express.static(`${__dirname}/public`));//serving static pages using middleware
app.use(express.static(path.join(__dirname,'public')));
app.use( helmet({ contentSecurityPolicy: false }) );

//development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

const limiter= rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message:' Too many requests from this IP ,please try again in an hour!'
});
app.use('/api',limiter);
// app.use((req,res,next)=>{
//     console.log('hello from the middleware');
//     next();
// });
app.use(express.json({limit: '10kb'}));//middle ware usage
app.use(express.urlencoded({extended:true,limit: '10kb'}));
app.use(cookieParser());
//prevent parameter pollution
app.use(hpp({
    whitelist:[
        'duration',
        //etc you can check in tour schema to add
    ]
}));

// app.get('/api/v1/tours',getAllTours);  

// app.get('/api/v1/tours/:id',getTour);

// app.post('/api/v1/tours',createTour);

// app.patch('/api/v1/tours/:id',updateTour);

// app.delete('/api/v1/tours/:id',deleteTour);


app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    // console.log(req.cookies);
    next();
});

app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);

app.use('/api/v1/users',userRouter);

app.use('/api/v1/reviews',reviewRouter);

app.use('/api/v1/bookings',bookingRouter);
// app.all('*',(req,res,next)=>{
//     // res.status(404).json({
//     //     status: 'fail',
//     //     message: `Can't find ${req.originalUrl} on this server!`
//     // });
//     // const err= new Error(`Can't find ${req.originalUrl} on this server!`);
//     // err.status ='fail';
//     // err.statusCode= 404;
//     next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
// });



//error handling middleware
app.use(globalErrorHandler);
module.exports=app;
