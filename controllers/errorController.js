const AppError = require("../utils/appError");

const handleCastErrorDB = err=>{
    const message= `invalid ${err.path}: ${err.value}.`;
    return new AppError(message,400);
};

const handleDuplicateFieldsDB = err=>{
    const value=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message= `Duplicate field value : ${value} .please use another value`;
    return new AppError(message,400);
};

const handleValidationErrorDB =err=>{
    const errors=Object.values(err.errors).map(el => el.message);
    const message=`inavlid input data. ${errors.join('. ')}`;
    return new AppError(message,400);
};

module.exports=(err,req,res,next)=>{
    console.log("entered error controller");
    console.log(process.env.NODE_ENV);
    // const NODE_ENV=process.env.NODE_ENV;
    // console.log(err.stack);
    err.statusCode= err.statusCode || 500;
    err.status= err.status || 'error';
    if(process.env.NODE_ENV==='development'){
        if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status: err.status,
            error:err,
            message: err.message,
            stack: err.stack
        });
       }
       else{
        res.status(err.statusCode).render('error',{
            title:'SomeThing went wrong',
            msg: err.message
        });
       }
    }
    else{
        console.log('entered production error controller');
        //api
        if(req.originalUrl.startsWith('/api')){
        //OPERATIONAL ERROR 
        if(err.isOperational){
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        //PROGRAMMING ERROR
        else{
            let error ={...err};
            if(error.name=='CastError') error=handleCastErrorDB(error);
            if(error.code === 11000) error= handleDuplicateFieldsDB(error);
            if(error.name==='validationError') error=handleValidationErrorDB(error)
            //1)LOG ERROR
            console.error('Error 👁️',err);
            //2)SEND A GENERIC MSG
            res.status(500).json({
                status:'error',
                message:'Something went very wrong!'
            });
        }
      }
       else{
        if(err.isOperational){
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        //PROGRAMMING ERROR
        else{
            //1)LOG ERROR
            let error ={...err};
            if(error.name=='CastError') error=handleCastErrorDB(error);
            if(error.code === 11000) error= handleDuplicateFieldsDB(error);
            if(error.name==='validationError') error=handleValidationErrorDB(error)
            console.error('Error 👁️',err);
            //2)SEND A GENERIC MSG
            res.status(err.statusCode).render('error',{
                title:'Something went wrong',
                msg:'please try again later'
            });
        }
    }
    }
};