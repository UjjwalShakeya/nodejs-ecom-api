import CartItemModel from "./cartItems.model.js";
import CartItemsRepository from "./cart.repository.js";

export class CartItemsController {
  constructor() {
    this.cartItemsRepository = new CartItemsRepository();
  }

  async add(req, res) {
    try {
      const { productID, quantity } = req.body;
      const userID = req.userID;
      await this.cartItemsRepository.add(productID, userID, quantity);
      return res.status(201).send("Cart is updated");
    } catch (err) {
      return res.status(400).status("something went wrong");
    }
  }

  //   get(req, res) {
  //     const userID = req.userID;
  //     const items = CartItemModel.get(userID);
  //     return res.status(200).send(items);
  //   }

  async get(req, res) {
    try {
      const userID = req.userID;
      const items = await this.cartItemsRepository.get(userID);
      return res.status(200).send(items);
    } catch (err) {
      console.log(err);
      return res.status(400).send("something went wrong");
    }
  }

  async delete(req, res) {
    try {
      const userID = req.userID;
      const cartItemID = req.params.id;
      await this.cartItemsRepository.delete(cartItemID,userID);

      return res.status(200).send("Cart item is removed");
    } catch (err) {}
    if (err) {
        console.log(err) 
      return res.status(404).send("product not found went wrong");
    };
  };
};
