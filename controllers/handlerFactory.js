const catchAsync = require("./../utils/catchAsync");
const AppError= require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
exports.deleteOne =Model=> catchAsync(async(req,res,next)=>{
    console.log("entered");
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError('NO document found with that ID',404));
    }
    res.status(204).json({
      status:'success',
      data:null
  });  
});

exports.updateOne= Model=>catchAsync(async (req,res)=>{
    
    const doc= await Model.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    })
    if(!doc){
        return next(new AppError('NO document found with that ID',404));
    }
    res.status(200).json({
        status:'success',
        data:{
            data: doc
        }
    });
});
exports.createOne= Model=>catchAsync(async (req,res,next)=>{
    const doc = await Model.create(req.body);
        res.status(201).json({
            status:'sucess',
            data:{
                data:doc
            }
        }); 
    // console.log(req.body);
    // const newId=tours[tours.length-1].id+1;
    // const newTour=Object.assign({id:newId},req.body);//creating a object by merging with ID
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
    //     res.status(201).json({
    //         status:'sucess',
    //         data:{
    //             tour:newTour
    //         }
    //     });
    // });
});

exports.getOne= (Model,popOptions)=>catchAsync(async (req,res,next)=>{
    let query= Model.findById(req.params.id);
    if(popOptions) query= query.populate(popOptions);
    const doc= await query;
    // Tour.findOne(_id: req.params.id})
     
    res.status(200).json({
    status:'sucess',
    data:{
        doc
    }
  });
    // const id=req.params.id*1;
    // const tour=tours.find(el => el.id===id);     
    });

    exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
      // To allow for nested GET reviews on tour (hack)
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };
  
      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
      // const doc = await features.query.explain();
      const doc = await features.query;
  
      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
          data: doc
        }
      });
    });
  