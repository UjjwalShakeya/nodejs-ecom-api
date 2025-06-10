import OrderRepository from "./order.repository.js";


export default class OrderController {
    constructor() {
        this.orderRespository = new OrderRepository();
    }

    async placeOrder(req, res, next) {
        try {
            const userId = req.userID;
            await this.orderRespository.placeOrder(userId);
            return res.status(201).send('order is created');

        } catch (err) {
            console.log(err);
            return res.status(404).send('something went wrong');
        }
    }
} 