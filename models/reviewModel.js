const mongoose= require('mongoose');
const abc = require('./tourModel')
//review /rating/ createdAt /ref to the tour /ref to user 
const reviewSchema = new mongoose.Schema({
 rating:{
    type: Number,
    min:1,
    max:5
 },
 review:{
    type:String,
    required:[true,'Review cant be empty']
 },
 createdAt:{
    type: Date,
    default: Date.now()
 },
 tour:{
        type: mongoose.Schema.ObjectId,
        ref:'abc',
        required:[true,'Review must belog to a tour.']
 },
 user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must belog to a tour.']
 }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
});
reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     select:'name photo'
    // });
    this.populate({
        path:'user',
        select:'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats= await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum :1},
                avgRating: {avg: '$rating'}
            }
        }
    ]);
    console.log(stats);
    await abc.findByIdAndUpdate(tourId,{
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
};
reviewSchema.post('save', function(){
    //this points current review
    this.constructor.calcAverageRatings(this.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports= Review;