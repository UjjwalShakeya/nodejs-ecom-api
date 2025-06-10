// importing the modules
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import { categorySchema } from "../features/product/category.schema.js";

// It loads environment variables from a file named .env into your app's process.env object.
dotenv.config();
const url = process.env.DB_URL;

// connecting to the database using Mongoose

export const connectUsingMongoose = async () => {
  try {
    // in older versions
    //   await mongoose.connect(url, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //   });

    await mongoose.connect(url);
    console.log("Mongodb is conected using mongoose");
    addCategories();
  } catch (err) {
    console.log(err);
  }
};

// you can also use then and catch method

// export const connectUsingMongoose = () => {
//     try {
//         mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
//             .then(() => {
//                 console.log("Mongodb using mongoose is connected");
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     } catch (err) {
//         console.log(err);
//     }
// };

// creating collection of categories and adding categories in the same
async function addCategories() {
  try {
    const CategoryModel = new mongoose.model("Category", categorySchema);
    const existCategories = await CategoryModel.find();
    if (!existCategories || existCategories.length == 0) {
      await CategoryModel.insertMany([
        { name: "Books" },
        { name: "Sports" },
        { name: "Electronics" },
        { name: "Clothing" },
        { name: "Decor" },
        { name: "Footwear" },
      ]);
    }
    console.log("Categories are added");
  } catch (error) {
    console.log("something went wrong while adding Categories");
  }
}
