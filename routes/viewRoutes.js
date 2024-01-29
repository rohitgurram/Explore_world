const express= require('express');
const viewController= require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const router = express.Router();

router.get('/',bookingController.createBookingCheckout,authController.isLoggedIn,viewController.getOverview);

router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour);

router.get('/login',authController.isLoggedIn,viewController.getLoginForm);
router.get('/me',authController.funk,viewController.getAccount);
router.post('/submit-user-data',authController.funk,viewController.updateUserData);
router.get('/my-tours',authController.funk,viewController.getMyTours);
module.exports =router;