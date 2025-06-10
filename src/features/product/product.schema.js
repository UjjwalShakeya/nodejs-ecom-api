// importing the modules
import mongoose from "mongoose";

export const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  inSctock: Number,
  // one to many relationships
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  categories:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Category",
    }
  ]
});
