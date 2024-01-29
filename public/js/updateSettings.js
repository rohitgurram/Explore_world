import axios from 'axios';
import { showAlert } from './alerts';
export const updateSettings= async(data,type)=>{
   try{
    console.log("entered update settings");
    const url=type==='password'? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword': 'http://127.0.0.1:3000/api/v1/users/updateMe';
    console.log(data);
    console.log(type);
    const res= await axios({
        method :'PATCH',
        url,
        data
    });
    console.log(res);
    if(res.data.status ==='success'){
        showAlert('success',`${type} updated successfully`);
    }
   }catch(err){
     showAlert('error',err.response.data.message);
   }
};