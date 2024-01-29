const User= require('./../models/userModel');
const jwt= require('jsonwebtoken');
const catchAsync=require('./../utils/catchAsync');
const AppError= require('./../utils/appError');
const sendEmail= require('./../utils/email');
const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const {promisify} = require('util');
const signToken= id=>{
     return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken =(User,statusCode,res)=>{
  const token = signToken(User._id);

  res.cookie('jwt',token,{
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
    httpOnly: true
  });
  // console.log(res.getHeaders());

  User.passsword=undefined;
  if(process.env.NODE_ENV==='production') cookieOptions.secure=true;
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user:User
        } 
    });
};
exports.signup = catchAsync(async(req,res,next)=>{
    const newUser= await User.create({
        name: req.body.name,
        email:req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role:req.body.role
    });
    createSendToken(newUser,201,res);
});

// exports.login=catchAsync(async (req,res,next)=>{
//     const {email}=req.body;
//     const {password}=req.body;
//     console.log("entered logIn controller");
//     console.log(email);
//     // console.log(password);
//     if(!email || !password){
//        return next(new AppError('Please provide email and password!',400));
//     }
//     const user= await User.findOne({email: email});
//     console.log(await bcrypt.hash(this.password,12));
//     console.log(user.password);
//     const same_pass=await bcrypt.compare(password,user.password);
//     console.log(same_pass);
//     if(!user || !same_pass ){
//         return next(new AppError('Incorrect email or password',401));
//     }
//     // 3) If everything ok, send token to client
//   createSendToken(user, 200, res);
// });
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("entered logIn controller");
  console.log('Email:', email);
  console.log('Password:', password);

  if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email: email });

  console.log('Input Password:', password);
  console.log('Hashed Password from Database:', user ? user.password : 'User not found');

  if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout=(req,res,next)=>{
  res.cookie('jwt','logged out',{
    expires: new Date(Date.now() +10*1000),
    httpOnly:true
  });
  res.status(200).json({status: 'success'});
};
exports.funk= catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    console.log("entered funnk");
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt){
      token= req.cookies.jwt;
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
  
    // // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    console.log("successful");
    req.user = currentUser;
    // console.log("next line");
    res.locals.user=currentUser;
    // console.log("next next line");
    next();
  });

  exports.restrictTo = (...roles) =>{
    // console.log("entered restrict");
    return (req,res,next)=>{
        //roles is an array ['admin','lead-guide']
        console.log("entered restrict");
        if(!roles.includes(req.user.role)){
            return next(new AppError('you dont have permission to perform this action',403));
        }
        next();
    };
  };

  exports.forgotPassword =async(req,res,next)=>{
   //1) Get user based on Posted email
   const user= await User.findOne({email: req.body.email});
   if(!user){
    return next(new AppError('there is no user with email address.',404));
   }

   //2) generate random reset token
   const resetToken= user.createPasswordResetToken();
   await user.save({validateBeforeSave:false});

   //3)Send it to users's email
   const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`;
   const message =`forgot your password ?submit a patch request with youor new password nd passwordConfirm to: ${resetURL}.\nIf you didn't forget your password
   please ignore this email!`;
   await sendEmail({
    email: user.email,
    subject:'your password reset token(valif for 10min)',
    message
   });
   console.log('emailsent');
   res.status(200).json({
    status:'success',
    message:'Token sent to email'
   });
  };

  exports.resetPassword =(req,res,next)=>{

  };

  exports.updatePassword= async(req,res,next)=>{
    //1) Get user from collection
    const user = await User.findById(req.user.id);
    console.log(req);
    //2) Check is posted password is correct
    const isPasswordCorrect = await bcrypt.compare(req.body.passwordCurrent, user.password);
        if (!isPasswordCorrect) {
            return next(new AppError('Your current password is wrong', 401));
        }
    //3)if so, update password
   user.password=req.body.password;
   user.passwordConfirm=req.body.passwordConfirm;
   console.log(req.body.passwordConfirm);
   console.log(req.body.password);
   console.log(req.body.passwordCurrent);
   await user.save();
    //4)Log user in ,send JWT
     createSendToken(user,200,res);
  };

  //only for render pages and there will be no error
  exports.isLoggedIn =async(req,res,next)=>{
    try{// 1) Getting token and check of it's there
    console.log("entered isLoggedIn");
    let token;
    if(req.cookies.jwt){
      token= req.cookies.jwt;
    // token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjOGExZDViMDE5MGIyMTQzNjBkYzA1NyIsImlhdCI6MTcwNjE2NjY0OCwiZXhwIjoxNzEzOTQyNjQ4fQ.EBsqot4qWt5F44vWPxVQdmyITK-Lhq8QMlU7k5r0eMs";
      // 2) Verification token
     const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
  
    // // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    // // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    // There is a logged in user
    res.locals.user=currentUser;
    console.log("successful");
    return next();}
    }
    catch(err){
      return next();
    }
    next();
  };