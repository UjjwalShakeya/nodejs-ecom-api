import { LikeRepositoy } from "./like.repository.js";

export class LikeController {
  constructor() {
    this.likeRespository = new LikeRepositoy();
  }

  async likeItem(req, res, next) {
    try {
      const { id, type } = req.body;
      const userId = req.userID;
      if (type != "Product" && type != "Category") {
        return res.status(400).send("Invalid Type");
      }

      if (type == "Product") {
        await this.likeRespository.likeProduct(userId, id);
      } else {
        await this.likeRespository.likeCategory(userId, id);
      }
      return res.status(201).send("liked");
    } catch (err) {
      console.log(err);
      return res.status(400).send("Something went wrong");
    }
  }
  async getLikes(req, res, next) {
    try {
      const { id, type } = req.query;
      const likes = await this.likeRespository.getLikes(id, type);
      return res.status(200).send(likes);
    } catch (error) {
      console.log(err);
      return res.status(400).send("Something went wrong");
    }
  }
}
