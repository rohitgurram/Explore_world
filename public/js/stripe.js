const stripe= Stripe('pk_test_51ObkPRSBaqpxP92YMEMbdIIHUyNkRP6VNPu5N3qC7yfHzPhUh4jr0McmH5cxeVcxEMOjErPXGCYSzaOynMki9ODd00wGvoycr3');
import axios from 'axios'
import { showAlert } from './alerts';
export const bookTour=async tourId=>{
 try{
    //1) get The checkout session from server or API
 const session =await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
 console.log(session);
 //2)CREATE CHECKOUT form+chanrge credit card
 await stripe.redirectToCheckout({
    sessionId: session.data.session.id
 });
}catch(err){
    console.log(err);
    showAlert('error',err);
}
};