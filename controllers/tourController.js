const express=require('express');
const app=express();
const fs=require('fs');
const multer=require('multer');
const sharp=require('sharp');
const mongoose=require('mongoose');
const APIFeatures = require('./../utils/apiFeatures');
const abc = require('./../models/tourModel');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const factory= require('./handlerFactory');

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

exports.uploadTourImages= upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
]);

//upload.single('image) req.file
//upload.array('images',5) req.files
exports.resizeTourImages=async(req,res,next)=>{
//  console.log(req.files);
 if(!req.files.imagesCover || !req.files.images) return next();
 //1) Cover image
 req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`;
 await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${req.body.imageCover}`);
 //Images
 req.body.images=[];
 await Promise.all(
 req.files.images.map(async(file,i)=>{
  const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
  await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${filename}`);
  req.body.images.push(filename);
 })
 );
 next();
};
// const tourSchema=new mongoose.Schema({
//     name: {
//         type:String,
//         required: [true,'A tour must have a name'],
//         unique: true
//     },
//     rating: {
//         type: Number,
//         default: 4.5
//     } ,
//     price:{
//       type: Number,
//       required: [true,'A tour must have a price']
//     }
//     });
// const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);


// module.exports=mongoose.model('Tour',tourSchema);
// const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID=(req,res,next,val)=>{
//     //to convert string to number
//     console.log(`tour id is: ${val}`);
//     if(req.params.id*1>tours.length){
//        return res.status(404).json({
//            status:'fail',
//            message:'invalid ID'
//        });
//     }
//     next();
// };
//middleWare 
 exports.aliasTopTours=(req,res,next) =>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
 };
 

 exports.getAllTours= async (req,res)=>{
    console.log("entered getalltours");
   // BUILD QUERY
    //1)filtering
    

    //2)sorting
    
    
    //3)Field limiting
    
    
    //4)Pagination
    
    // console.log(req.query);
    //    const query= await abc.find().where('durtion')
   //    .equals(5) 
   //    .where('difficutly')
   //    .equals('easy');
   const features= new APIFeatures(abc.find(),req.query).filter().sort().limitFields().pagination();
//    const tours= await features.query.explain();
const tours= await features.query;
  //query.sort().select().skip().limit()--> format of query  
  // SEND RESPONSE
   res.status(200).json({
       status:'sucess',
       results: tours.length,
       data:{
           tours
       }
   });
   };
    

exports.getTour=catchAsync(async (req,res)=>{
    const tour= await abc.findById(req.params.id).populate('reviews');
    // Tour.findOne(_id: req.params.id})
    
    res.status(200).json({
    status:'sucess',
    data:{
        tour
    }
  });
    // const id=req.params.id*1;
    // const tour=tours.find(el => el.id===id);

    
    });

exports.createTour=factory.createOne(abc);

exports.updateTour= factory.updateOne(abc);

exports.deleteTour= factory.deleteOne(abc);
// exports.deleteTour= async (req,res)=>{
//     try{
//       await abc.findByIdAndDelete(req.params.id);
//       res.status(204).json({
//         status:'success',
//         data:null
//     });  
//     }catch(err){
//         res.status(404).json({
//             status:404,
//             message:err
//            });
//     }
// };
exports.getTourStats= async(req,res)=>{
    try{
        const stats= await abc.aggregate([
          {
            $match: {ratingsAverage: {$gte: 4.5}}
          },
          {
           $group: {
            _id: '$difficulty',

            // _id: '$difficulty',
            num: {$sum : 1},
            numRatings: {$sum: '$ratingsQuantity'},
            avgRating: {$avg: '$ratingsAverage'},
            avgPrice: {$avg: '$price'},
            minPrice: {$min: '$price'},
            maxPrice:{$max : '$price'}
           }  
          },
          {
            $sort: {avgPrice:1}
          },
        //   {
        //     $match:{ _id:{ $ne: 'easy'} }
        //    }

        ]);
        res.status(200).json({
            status:'success',
            data: {
                stats
            }
        });  
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
           });
    }
};

exports.getMonthlyPlan= async(req,res)=>{
    try{
         const year = req.param.year*1;
         console.log(year);
         const plan = await abc.aggregate([
            {
            $unwind: '$startDates'
            },
        {
            $match:{
              startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`),
              }
            }
        },
        {
            $group:{
                _id: {$month: '$startDates'},
                numTourStarts: {$sum:1},
                tours: {$push: '$name'}
            }
        },
        {
          $addFields: {month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {numTourStarts: 1}
        },{
            $limit:6
        }
    ]);
    res.status(200).json({
        status:'success',
        data: {
            plan
        }
    }); 
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
           });
    }
}
