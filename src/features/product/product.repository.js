import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

import mongoose from "mongoose";

// product schema and review schema
import { productSchema } from "./product.schema.js";
import { reviewSchema } from "./review.schema.js";
import { categorySchema } from "./category.schema.js";

// creating models for schemas imported above productSchema | reviewSchema
const ProductModel = new mongoose.model("Product", productSchema);
const ReviewModel = new mongoose.model("Review", reviewSchema);
const CategoryModel = new mongoose.model("Category", categorySchema);

class ProductRepository {
  constructor() {
    this.collection = "products";
  }

  async add(productData) {
    try {
      console.log(productData);
      productData.categories = productData.category.split(',').map(e=> e.trim());
      
      // step 1. adding productData in collection
      const newProduct = new ProductModel(productData);
      const savedProduct = await newProduct.save();

      // 2. update the categories
      await CategoryModel.updateMany(
        { _id: { $in: productData.categories } }, // Finds all categories whose _id is in productData.categories.
        {
          $push: { products: new ObjectId(savedProduct._id) }, //Adds the new product’s ID to the products array of each matched category.
        }
      );
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async getAll() {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      const products = await collection.find().toArray();
      console.log(products);
      return products;
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async get(id) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  // our prduct should have minimum price and category specified
  async filter(minPrice, maxPrice, categories) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      let filterExpression = {};
      if (minPrice) {
        filterExpression.price = { $gte: parseFloat(minPrice) };
      }
      // ['Cat1', 'Cat2']
      categories = JSON.parse(categories.replace(/'/g, '"')); // third method only

      console.log(categories);
      if (categories) {
        //1.  before we were only passing category and check if category was not filter we were skipping but now by using and operator we are making sure that both should be there

        // filterExpression = {$and:[{category}, filterExpression]}; // for this use this request url :localhost:3200/api/products/filter?category=Cat2&minPrice=8000

        //2.  trying or operator which will check on both if any of both has matches expression then it will find accordingly

        // filterExpression = {$or:[{category}, filterExpression]}; // for this use this request url :localhost:3200/api/products/filter?category=Cat2&minPrice=8000

        //3.  trying "IN" operator : this operator will help you access multiple categories with you expressed minimum price
        filterExpression = {
          $or: [{ category: { $in: categories } }, filterExpression],
        }; // for this use this request url :localhost:3200/api/products/filter?category=['Cat1', 'Cat2']&minPrice=60000

        // filterExpression.category=category // without operator
      }
      // return await collection.find(filterExpression).toArray(); without project operator
      return await collection
        .find(filterExpression)
        .project({ name: 1, price: 1, _id: 0, ratings: { $slice: 1 } })
        .toArray(); // with project operator you can send custome result to the client
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  // async rate(userID, productID, rating) {
  //   try {
  //     const db = getDB();
  //     const collection = db.collection(this.collection);

  //     // step1. first we will find whether rating has been added or not so hence we will find product with productid to check product user's matches whith current user
  //     const product = await collection.findOne({
  //       _id: new ObjectId(productID),
  //     });

  //     /*
  //           product?.ratings means:
  //           👉 "If product exists, then try to get ratings. Otherwise, return undefined."

  //           ratings?.find(...) means:
  //           👉 "If ratings exists, then call .find(...). Otherwise, return undefined."
  //           */

  //     // step2. finding whether that product has rating or not
  //     const userRating = product?.ratings?.find(r => r.userID == userID);

  //     if (userRating) {
  //       // step3. updating rating if user exist
  //       // "ratings.userID": new ObjectId(userID) is used to find if a rating from this specific user already exists for this product.
  //       await collection.updateOne({_id:new ObjectId(productID), "ratings.userID": new ObjectId(userID)},{
  //           $set:{
  //               "ratings.$.rating" : rating
  //           }
  //       })

  //     } else {
  //       // step4. adding a new rating if first time user is rating
  //       await collection.updateOne(
  //         {
  //           _id: new ObjectId(productID),
  //         },
  //         {
  //           // pushing rating
  //           $push: { ratings: { userID: new ObjectId(userID), rating } },
  //         }
  //       );
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     throw new ApplicationError("Something went wrong with database", 500);
  //   }
  // }

  async rate(userID, productID, rating) {
    try {
      // 1. check if product exist or not
      const productToUpdate = await ProductModel.findById(productID);
      if (!productToUpdate) {
        throw new Error("product not found");
      }
      // 2. get the existing review
      const userReview = await ReviewModel.findOne({
        product: new ObjectId(productID),
        user: new ObjectId(userID),
      });
      if (userReview) {
        userReview.rating = rating;
        await userReview.save();
      } else {
        const newReview = new ReviewModel({
          product: new ObjectId(productID),
          user: new ObjectId(userID),
          rating: rating,
        });
        newReview.save();
      }
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async averageProductPricePerCategory() {
    try {
      const db = getDB();
      return await db
        .collection(this.collection)
        .aggregate([
          {
            // getting average price category
            $group: {
              _id: "$category",
              averagePrice: { $avg: "$price" },
            },
          },
        ])
        .toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }
  async averageProductRatings() {
    try {
      const db = getDB();
      return await db
        .collection(this.collection)
        .aggregate([
          // stage 1. creating documents for rating
          {
            $unwind: "$ratings",
          },
          // stage 2. grouping all documents and getting their average ratings
          {
            $group: {
              _id: "$name",
              averageRating: { $avg: "$ratings.rating" },
            },
          },
        ])
        .toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async countProductsRating() {
    try {
      const db = getDB();
      return await db.collection(this.collection).aggregate([
        {
          // stage 1.project name of product, countOfRating
          $project: {
            name: 1,
            countOfRating: {
              $cond: {
                if: { $isArray: "$ratings" },
                then: { $size: "ratings" },
                else: 0,
              },
            },
          },
        },

        {
          // stage 2. sorting the resulted countOfRating
          $sort: { countOfRating: -1 }, // sorting in decending order
        },

        {
          // stage 3. limgiting to get only one item in result
          $limit: 1, // sorting in decending order
        },
      ]);
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }
}

export default ProductRepository;
