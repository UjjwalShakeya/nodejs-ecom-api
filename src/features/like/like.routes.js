// importing modules
import express from "express";
import { LikeController } from "./like.controller.js";

// creating like router
const likeRouter = express.Router();

const likeControllerInc = new LikeController();
likeRouter.post("/", (req, res, next) => {
  likeControllerInc.likeItem(req, res, next); 
});
likeRouter.get("/", (req, res, next) => {
  likeControllerInc.getLikes(req, res, next); 
});


export default likeRouter;