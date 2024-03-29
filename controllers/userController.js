const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const multer= require('multer');
const sharp= require('sharp');
const factory= require('./handlerFactory');
// const multerStorage= multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,public/img/users);
//     },
//     filename:(req,file,cb)=>{
//         //user-7676abc76dba-3323376674.jpeg
//         const ext=file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });
const multerStorage= multer.memoryStorage();
const multerFilter =(req,file,cb)=>{
   if(file.mimetype.startsWith('image')){
    cb(null,true);
   }else{
    cb(new AppError('Not an image ! please upload only images',400),false);
   }
};
const upload =multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadUserPhoto=upload.single('photo');
exports.resizeUserPhoto=async (req,res,next)=>{
  console.log("entered resize");
  if(!req.file) return next();
  console.log(req.file);
  req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`; 
  console.log(req.file.filename);
  await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
  next();
};
const filterObj= (obj, ...allowedFeild)=>{
    const newObj={};
  Object.keys(obj).forEach(el=>{
    if(allowedFeild.includes(el)) newObj[el]= obj[el];
  });
  return newObj;
};
exports.getAllUsers=catchAsync(async (req,res)=>{
    const users= await User.find();
  //query.sort().select().skip().limit()--> format of query  
  // SEND RESPONSE
   res.status(200).json({
       status:'sucess',
       results: users.length,
       data:{
           users
       }
   });
});

exports.updateMe = catchAsync(async (req,res,next)=>{
    //1) create error if user posts password data
    console.log("entered updateMe");
    console.log(req.file.filename);
        if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update .please use /updateMypassword',400));
    }
    //2) update user document
    const filteredBody= filterObj(req.body,'name','email');
    if(req.file) filteredBody.photo= req.file.filename;
    //3) update user document
    const updateduser= await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators: true
    });
    // user.name='jonas';
    // await user.save(); cantbe used because pass 
    res.status(200).json({
        status:'success'
    });
}) ;

exports.getUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'this route is not yet defined'
    });
};

exports.deleteMe=catchAsync(async(req,res,next)=>{
 await User.findByIdAndUpdate(req.user.id,{active:false});
 res.status(204).json({
    status: 'success',
    data:null
 });
});

exports.getMe= (req,res,next)=>{
    req.params.id= req.user.id;
    next();
};
//Do not update passwords with this
exports. updateUser=factory.updateOne(User);

exports. createUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'this route is not yet defined'
    });
};

exports. deleteUser=factory.deleteOne(User);