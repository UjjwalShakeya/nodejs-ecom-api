import { getClient, getDB } from "../../config/mongodb.js";
import { ObjectId } from "mongodb";
import { ApplicationError } from "../../error-handler/applicationError.js";
import orderModel from "./order.model.js";

export default class OrderRepository {
  constructor() {
    this.collection = "orders";
  }

  async placeOrder(userId) {
    const client = getClient();
    const session = client.startSession(); // The startSession command starts a new logical session for a sequence of operations.
    try {
      const db = getDB(); // accessing database
      session.startTransaction(); // start using Transaction 

      // 1. Get cartitems and calculate total amount.
      const items = await this.getTotalAmount(userId, session);
      const finalTotalAmount = items.reduce(
        (acc, item) => acc + item.totalAmount,
        0
      );
      console.log(finalTotalAmount);

      // 2. Create an order record.
      const newOrder = new orderModel(
        new ObjectId(userId),
        finalTotalAmount,
        new Date()
      );
      await db.collection(this.collection).insertOne(newOrder, { session });

      // 3. Reduce the stock.
      for (let item of items) {
        await db
          .collection("products")
          .updateOne(
            { _id: item.prodcutID },
            { $inc: { stock: -item.quantity } }, { session }
          );
      };

      // throw new Error('something Went Wrong In placeholder'); // after applying transaction if you test whether after any error any of these operations are working or not by uncommenting this you will see none of 4 operations are working if error thrown

      // 4. Clear the cart items.
      await db.collection('cartItems').deleteMany({
        userID: new ObjectId(userId)
      }, { session });
      session.commitTransaction(); // it will update database that all operations of transaction have been made
      return;
    } catch (err) {
      console.log(err);
      await session.abortTransaction(); // clean up
      throw new ApplicationError("Something went wrong with database", 500);
    } finally {
      session.endSession(); // always close the session
    }
  }
  async getTotalAmount(userId, session) {
    const db = getDB();

    const items = await db
      .collection("cartItems")
      .aggregate([
        {
          $match: { userID: new ObjectId(userId) },
        },
        {
          $lookup: {
            from: "products",
            localField: "productID", // check your schema
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $unwind: "$productInfo",
        },
        {
          $addFields: {
            totalAmount: {
              $multiply: ["$productInfo.price", "$quantity"],
            },
          },
        },
      ], { session }).toArray();
    return items;
  }
}
