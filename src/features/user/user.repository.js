// importing models right here
import mongoose from "mongoose";
import { userSchema } from "./user.schema.js";
import { ApplicationError } from "../../error-handler/applicationError.js";

// creating model for the user

const UserModel = mongoose.model("User", userSchema);

export default class userRespository {
  async resetPassword(userID, newPasswords) {
    try {
      let user = await UserModel.findById(userID);
      if (user) {
        user.password = newPasswords;
        user.save(); // will save newPassword
      } else {
        throw new Error("User not found");
      }
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }

  async signUp(user) {
    try {
      const newUser = new UserModel(user); // creating an instance of an model
      await newUser.save(); //saving to the database
      return newUser;
    } catch (err) {
      console.log(err);
      if (err instanceof mongoose.Error.ValidationError) {
        // if error is instance of validator error we will throw that error to the client as it is because this is user error not an application error
        throw err;
      } else {
        throw new ApplicationError("Something went wrong with database", 500);
      }
    }
  }

  async signIn(email, password) {
    try {
      return await UserModel.findOne({ email, password });
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }
  async findByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (err) {
      console.log(err);
      throw new ApplicationError("Something went wrong with database", 500);
    }
  }
}
