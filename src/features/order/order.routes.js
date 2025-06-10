// import the packages here
import express from "express";
import orderController from "./order.controller.js";

// creating router for the order
const orderRouter = express.Router();

const orderControllerInc = new orderController()

orderRouter.post('/', (req, res, next) => {
    orderControllerInc.placeOrder(req, res, next);
})


export default orderRouter;