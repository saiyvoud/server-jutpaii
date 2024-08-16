import mongoose from "mongoose";
import Models from "../model/index.model.js";
import { SendE400, SendE404, SendE500, SendS200, SendS201 } from "../services/response.js";
import { EMessage, SMessage } from "../services/message.js";
import { ValidateData } from "../services/validate.js";
import { io } from "../server.js";
import NotificationController from "./notification.controller.js";

class OrderController {

    static async createOrder(req, res) {
        try {
            const user_id = req.user._id;
            const { room_id, post_id, name, phoneNumber, province, distict, village, express, type_payment } = req.body;
            // console.log(`orderdetail: `, post_id);

            const validate = ValidateData({ room_id, post_id, name, phoneNumber, type_payment });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);
            if (!mongoose.Types.ObjectId.isValid(room_id) || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const post = await Models.Post.findOne({ _id: post_id, isActive: true })
            if (!post)
                return SendE404(res, EMessage.NOT_FOUND + ' post');
            const checkSale = await Models.Post.findOne({ _id: post_id });
            if (!checkSale || checkSale.isSale == true) {
                return SendE400(res, EMessage.POSTARESSOLD)
            }
            let address = {
                province,
                distict,
                village
            }

            const data = {
                room_id,
                buyer: user_id,
                post_id,
                name,
                phoneNumber,
                address,
                express,
                type_payment,
                seller: post.user_id
            }
            let order = await Models.Order.create(data);
            if (!order)
                return SendE400(res, EMessage.FAILE);
            order = await order.populate([
                {
                    path: 'post_id',
                    poplate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                },
                {
                    path: 'buyer seller',
                    select: 'username profile'
                }
            ]);

            await Models.Post.updateOne(
                { _id: post_id },
                { isSale: true },
                { new: true }
            )
            // order.seller
            // send create order by user to room chat
            io.to(room_id).emit("create_order", { user_id, order })
            const NotiCon = new NotificationController();
            await NotiCon.notiNewOrder(order, 'ມີອໍເດີໃຫມ່', '', order.seller)
            return SendS201(res, SMessage.SUCCESS, order)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updateSaleOrderStatus(req, res) {
        try {
            const user_id = req.user._id;
            const { status } = req.body;
            const order_id = req.params.id;
            const validate = ValidateData({ order_id, status });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);
            if (!mongoose.Types.ObjectId.isValid(order_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const upStatus = await Models.Order.findOneAndUpdate(
                { _id: order_id },
                { status: status },
                { new: true }
            )
            if (!upStatus)
                return SendE400(res, EMessage.FAILE, '');
            // send update order status
            io.to(upStatus.room_id).emit("order_status", { sender: user_id, upStatus })
            return SendS200(res, SMessage.SUCCESS, upStatus);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getSaleOrderByStatus(req, res) {
        try {
            const user_id = req.user._id;
            const status = req.params.status;
            // console.log(`orderdetail: `, orderDetail);
            const validate = ValidateData({ status });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const orderByStatus = await Models.Order.find(
                { buyer: user_id, status, isActive: true }
            ).populate([
                {
                    path: 'buyer seller',
                    select: 'username profile'
                },
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                }
            ]);

            if (orderByStatus == '')
                return SendE400(res, SMessage.DONTHAVE, '');

            return SendS200(res, SMessage.SUCCESS, orderByStatus);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllSaleOrder(req, res) {
        try {
            const user_id = req.user._id;
            const validate = ValidateData({ user_id });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const orders = await Models.Order.find(
                { seller: user_id, isActive: true }
            ).populate([
                {
                    path: 'buyer seller',
                    select: 'username profile'
                },
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                }
            ]);

            if (orders == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orders);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllMyOrder(req, res) {
        try {
            const user_id = req.user._id;
            const validate = ValidateData({ user_id });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const orders = await Models.Order.find(
                { buyer: user_id, isActive: true }
            ).populate([
                {
                    path: 'buyer seller',
                    select: 'username profile'
                },
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                }
            ]);

            if (orders == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orders);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getMyOrderByStatus(req, res) {
        try {
            const user_id = req.user._id;
            const status = req.params.status;
            const validate = ValidateData({ status });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const orderStatus = await Models.Order.find(
                { buyer: user_id, status: status }
            ).populate([
                {
                    path: 'buyer seller',
                    select: 'username profile'
                },
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                }
            ]);
            if (orderStatus == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orderStatus);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAll(req, res) {
        try {
            const orderArr = await Models.Order.find(
                { isActive: true }
            ).populate([
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                },
                {
                    path: 'buyer seller',
                    select: 'username profile'
                }
            ]);
            if (orderArr == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orderArr);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllOrderByStatus(req, res) {
        try {
            const status = req.params.status;
            // console.log(`orderdetail: `, orderDetail);
            const validate = ValidateData({ status });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            // const posts = await Models.Post.find(
            //     { user_id, isActive: true }
            // )
            // const post_ids = posts.map(post => post._id);
            const orderByStatus = await Models.Order.find(
                { status, isActive: true }
            ).populate([
                {
                    path: 'buyer seller',
                    select: 'username profile'
                },
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                }
            ]);
            // const orderByStatus = await Models.Order.find(
            //     { post_id: { $in: post_ids }, status, isActive: true }
            // ).populate([
            //     {
            //         path: 'buyer seller',
            //         select: 'username profile'
            //     },
            //     {
            //         path: 'post_id',
            //         poplate: [
            //             {
            //                 path: 'product_id'
            //             },
            //             {
            //                 path: 'user_id',
            //                 select: 'username profile'
            //             }
            //         ]
            //     }
            // ]);
            if (orderByStatus == '')
                return SendE400(res, SMessage.DONTHAVE, '');

            return SendS200(res, SMessage.SUCCESS, orderByStatus);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }
    static async getAllSaleWithUser(req, res) {
        try {
            const user_id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid)
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            const orders = await Models.Order.find(
                { seller: user_id, isActive: true }
            ).populate([
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                },
                {
                    path: 'buyer seller',
                    select: 'username profile'
                }
            ]);
            // const orders = await Models.Order.find(
            //     { post_id: { $in: post_ids }, isActive: true }
            // ).populate([
            //     {
            //         path: 'post_id',
            //         poplate: [
            //             {
            //                 path: 'product_id'
            //             },
            //             {
            //                 path: 'user_id',
            //                 select: 'username profile'
            //             }
            //         ]
            //     },
            //     {
            //         path: 'buyer seller',
            //         select: 'username profile'
            //     }
            // ]);
            if (orders == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orders);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }
    static async getAllBuyWithUser(req, res) {
        try {
            const user_id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid)
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            const orders = await Models.Order.find(
                { buyer: user_id, isActive: true }
            ).populate([
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                },
                {
                    path: 'buyer seller',
                    select: 'username profile'
                }
            ]);
            // const orders = await Models.Order.find(
            //     { post_id: { $in: post_ids }, isActive: true }
            // ).populate([
            //     {
            //         path: 'post_id',
            //         poplate: [
            //             {
            //                 path: 'product_id'
            //             },
            //             {
            //                 path: 'user_id',
            //                 select: 'username profile'
            //             }
            //         ]
            //     },
            //     {
            //         path: 'buyer seller',
            //         select: 'username profile'
            //     }
            // ]);
            if (orders == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orders);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }
    static async getAllWithUser(req, res) {
        try {
            const user_id = req.params.id;
            // console.log(user_id);
            // console.log(req.params.id);
            if (!mongoose.Types.ObjectId.isValid)
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            const orders = await Models.Order.find(
                { $or: [{ seller: user_id }, { buyer: user_id }], isActive: true }
            ).populate([
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                },
                {
                    path: 'buyer seller',
                    select: 'username profile'
                }
            ]);

            if (orders == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, orders);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }
    static async getOneOrder(req, res) {
        try {
            const order_id = req.params.id;
            const validate = ValidateData({ order_id });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const order = await Models.Order.find(
                { _id: order_id, isActive: true }
            ).populate([
                {
                    path: 'buyer seller',
                    select: 'username profile'
                },
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id'
                        },
                        {
                            path: 'user_id',
                            select: 'username profile'
                        }
                    ]
                }
            ]);

            return SendS200(res, SMessage.SUCCESS, order);

        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

}

export default OrderController;