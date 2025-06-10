// importing database from the config;
import { getDB } from "../../config/mongodb.js";
// importing the application error;
import { ApplicationError } from "../../error-handler/applicationError.js";
// importinf ObjectId function of mongodb
import { ObjectId } from "mongodb";

export default class CartItemsRepository {
  constructor() {
    this.collection = "cartItems";
  }

  async add(productID, userID, quantity) {
    try {
      //step 1. getting the bd as usual
      const db = getDB();

      //step 2. getting collection
      const collection = db.collection(this.collection);

      const id = await this.getNextCounter(db);
      console.log(id);

      //step 3. inserting the document
      await collection.updateOne(
        {
          productID: new ObjectId(productID),
          userID: new ObjectId(userID),
        },
        {
          $setOnInsert: { _id: id }, // this will ensure that id will be added when only new cartItem is added not on update it will add new id
          $inc: { quantity: quantity },
        }, // here we are using inc operation which will help update current existing quantity
        { upsert: true }
      );
    } catch (err) {
      console.log(err);
      throw new ApplicationError("something is wrong with database", 500);
    }
  }
  async get(userID) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.find({ userID: new ObjectId(userID) }).toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError("something is wrong with database", 500);
    }
  }
  async delete(cartItemID, userID) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      const result = collection.deleteOne({
        _id: new ObjectId(cartItemID),
        userID: new ObjectId(userID),
      });
      return result.deletedCount > 0;
    } catch (err) {
      console.log(err);
      throw new ApplicationError("something is wrong with database", 500);
    }
  }
  async getNextCounter(db) {
    const counter = await db.collection("counters").findOneAndUpdate(
      {
        _id: "cartItemId",
      },
      {
        $inc: { value: 1 },
      },
      { returnDocument: "after" } // this will return updated document
    );
    return counter.value; //
  }
}
