import {showAlert} from "./alerts";

export const login =async(email,password)=>{
    try{
        // const res= await axios({
        //     method: 'POST',
        //     url: 'http://127.0.0.1:3000/api/v1/users/login',
        //     data:{
        //         email,
        //         password
        //     }
        // });
        console.log(email);
        console.log(password);
        const data= {
            email,
            password
        };
        const res = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
      
          const result = await res.json();
          console.log(result);
          if(result.status=='success'){
            console.log("calling laert");
            showAlert('success','Logged in successfully');
            window.setTimeout(()=>{
                 location.assign('/');
            },1500);
          }
          else{
            console.log('calling error alert');
            showAlert('error',result.message);
          }
    }catch(err){
        showAlert('error',err.response.data.message);
    }
};

export const logout =async()=>{
    try{
      const res=await fetch('http://127.0.0.1:3000/api/v1/users/logout', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(data),
      });
      const result = await res.json();
      if(result.status=== 'success'){
         location.assign('/');
      }
    }catch(err){
     showAlert('error','Error in logging out try again');
    }
}
