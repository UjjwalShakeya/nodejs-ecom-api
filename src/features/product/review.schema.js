// imported modules here

import mongoose, { mongo } from "mongoose";

export const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // we don't have to use Users to refer to Users collection it is automatically done internally by mongoose
  rating: Number
});
