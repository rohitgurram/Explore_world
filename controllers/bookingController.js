const stripe= require('stripe')(process.env.STRIPE_SECRET_KEY);
const abc = require('./../models/tourModel');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const factory= require('./handlerFactory');
const Booking=require('./../models/bookingModel');

exports.getCheckoutSession=catchAsync(async(req,res,next)=>{
 //1) Get the currently booked tour
  const tour= await abc.findById(req.params.tourID);
 //2)create checkout Session
 const session= await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items:[
        {
            price_data: {
                currency: 'usd',
                product_data: {
                  name: `${tour.name} Tour`,
                },
                unit_amount: tour.price * 100,
            },
            quantity: 1
        }
    ],
    mode: 'payment'
 });
 //3)create session as response
 res.status(200).json({
    status: 'sucess',
    session
 });
});

exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
    console.log("entered booking checkout");
    const {tour,user,price}= req.query;
    if(!tour || !user || !price) return next();
    await Booking.create({tour,user,price});
    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking= factory.createOne(Booking);
exports.getBooking= factory.getOne(Booking);
exports.getAllBookings=factory.getAll(Booking);
exports.updateBooking=factory.updateOne(Booking);
exports.deleteBooking=factory.deleteOne(Booking);