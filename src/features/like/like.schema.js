import  mongoose from "mongoose";

export const likeSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    likeable:{
        type:mongoose.Schema.Types.ObjectId,
        refPath: "types"
    },
    types:{
        type:String,
        enum:["Product", "Category"]
    }
}).pre('save', (next) => {
    console.log('New like coming in');
    next();
}).post('save', (doc)=>{
    console.log('New like is added');
    console.log(doc);
}).pre('find',(next)=>{
    console.log('retreiving data');
    next();
}).post('find',(doc)=>{
    console.log('find is complete');
    console.log(doc);
});