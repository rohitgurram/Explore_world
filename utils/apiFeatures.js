const mongoose= require('mongoose');
class APIFeatures{
    constructor(query, queryString){
        this.query=query;
        this.queryString=queryString;
    }

    filter(){
        const queryObj = {};
        // console.log("i have entered here!!");
        for (const key in this.queryString) {
          if (this.queryString.hasOwnProperty(key)) {
            queryObj[key] = this.queryString[key];
         }
        }
        // console.log(queryObj);
        const excludedFields= ['page','sort','limit','fields'];
         excludedFields.forEach(el =>delete queryObj[el]);
        
         //1B)Advanced Filtering
         // if operators included in query string
         // {difficulty:'easy', duration: { $gte: '5'}}
         //gte,gt,lte,lt
         let queryStr=JSON.stringify(queryObj);
         queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);
         // console.log(JSON.parse(queryStr));
        
        this.query=this.query.find(JSON.parse(queryStr));
        return this;
        //  let query= abc.find(JSON.parse(queryStr));
    }

    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query=this.query.sort(sortBy);
        }else{
            this.query=this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields){
            const fields =this.queryString.fields.split(',').join(' ');
            this.query=this.query.select(fields);
        }
        else{
            this.query=this.query.select('-__v');//excluding __v field
        }
        return this;
    }
    pagination(){
        const page=this.queryString.page * 1 || 1;//converting into number
        const limit=this.queryString.limit *1 || 100;
        const skip=(page-1)*limit;
        //page=2&limit=10,1-10 page1,11-20 page2..
        this.query= this.query.skip(skip).limit(limit);
        
        // if(this.queryString.page){
        //     const numtours= await abc.countDocuments();
        //     if(skip>=numtours) throw new Error('This page does not exists');
        // }
        return this;
    }
}
module.exports = APIFeatures;