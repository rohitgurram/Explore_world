const mongoose=require('mongoose');
const slugify=require('slugify');
const User= require('./userModel');
const validator= require('validator');
const tourSchema=new mongoose.Schema({
    name: {
        type:String,
        required: [true,'A tour must have a name'],
        unique: true,
        trim :true,
        maxlength:[40,'A tour name must have less or equal than 40 chars'],
        minlength:[10,'A tour name must have more or equal than 10 chars']
        // validate:[ validator.isAplha,'A tour name must contain only letters']  
    },
    slug:{
        type:String
    },
    duration:
    {
     type: Number,
     required: [true,'A tour must have a duration']
    },
    maxGroupSize:{
     type: Number,
     required: [true,'A tour must have a group size']
    },
    difficulty:{
      type: String,
     required: [true,'A tour must have a difficulty'],
     enum:{
        values: ['easy','medium','difficult'],
        message:'easy or medium or difficult'
     }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min:[1,'rating must be above 1'],
        max:[5,'rating must be below 5']
    } ,
    ratingsQuantity:{
        type:Number,
        default: 0
    } ,
    price:{
      type: Number,
      required: [true,'A tour must have a price']
    },
    priceDiscount :{
        type:Number,
        validate:{
            validator: function(val){
                // this only points to current doc on NEW document creation 
                return val<this.price;
            },
            message:'Discount price ({VALUE}) should be below regular price'
        }
        
    },
    summary: {
        type: String,
        trim: true,
        required: [true,'A tour must have a description']
    },
    description:{
        type: String,
        trim :true
    },
    imageCover: {
        type: String,
        required: [true,'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default : Date.now(),
        select: false// will not be displayed hiding 
    },
    startDates: [Date],
    secretTour:{
        type:Boolean,
        default: false
    },
    startLocation: {
        //GeoJson
        type: {
        type: String,
        default: 'Point',
        enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String     
    },
    locations:[
        {type:{
        type: String,
        default: 'Point',
        enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day:Number}
    ],
    guides: [
        {
        type: mongoose.Schema.ObjectId,
        ref:'User'
    }
    ],
    },{
        toJSON: {virtuals: true},
        toObject: {virtuals: true},
    });

// tourSchema.index({price: 1});
tourSchema.index({price: 1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
});
//virtual populate 
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField: 'tour',
    localField: '_id'
});

//DOCUMENT MIDDLEWARE RUNS BEFORE THE SAVE COMMAND AND ON CREATE ()
//WE CAN CALL SAVE AS A HOOK AND PREHOOK 
tourSchema.pre('save',function(next){
 this.slug=slugify(this.name,{lower:true});
 next();
});

// FOR EMBEDDING
// tourSchema.pre('save',async function(next){
//  const guidesPromises=this.guides.map(async id =>await User.findById(id));
//  this.guides=await Promise.all(guidesPromises);
//  next();
// });
// WE CAN HAVE MORE THAN ONE PREHOOKS MIDDLEWARE 
// //POSTHOOK OF SAVE
// tourSchmea.post('save',function(doc,next){
//  console.log(doc);
//  next();
// });

//QUERY MIDDLEWARE find(),findOne()....
tourSchema.pre(/^find/,function(next){
   this.find({secretTour: {$ne: true}});
   this.start=Date.now();
   next();
});

tourSchema.pre(/^find/,function(next){
    this.populate('guides');
    next();
});
// tourSchema.post(/^find/,function(docs,next){
// console.log(`Query took ${Date.now()-this.start} mill`);
// console.log(docs);
// next();
// });

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate',function(next){
 this.pipeline().unshift({ $match: { secretTour: {$ne: true}}})
 console.log(this.pipeline());
 next();
});
const abc = mongoose.model('abc', tourSchema);

module.exports=abc;