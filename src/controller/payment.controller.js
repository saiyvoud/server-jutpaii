import Models from "../model/index.model.js";
import { SendE400, SendE500, SendS200, SendS201 } from "../services/response.js";
import { EMessage, SMessage } from "../services/message.js";
import { ValidateData } from "../services/validate.js";
import mongoose from "mongoose";
import Cloudinary from "../services/util/uploadImage.js";


class PayMentController {
    static async insertPayMent(req, res) {
        try {
            let _priceTotal;
            const user_id = req.user._id;
            const { order_id, priceTotal } = req.body;
            const validate = ValidateData({ order_id, priceTotal });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);
            const files = req.files
            if (!files)
                return SendE400(res, EMessage.PLEASE_INPUT + 'file')
            _priceTotal = parseInt(priceTotal);
            let order = await Models.Order.findOne({_id: order_id})
            .populate({
                path: 'post_id',
                populate: 'product_id'
            });
            if(order.post_id.product_id.price !== _priceTotal)
                return SendE400(res, EMessage.PRICENOTMATCH)    
            let imagurl = '';
            if (files) {
                const img = files.file.data.toString('base64')
                const imgName = files.file.name.split(".")[0]
                const Cloud = new Cloudinary();
                const url = await Cloud.uploadImage(img, imgName);
                imagurl = url
                // console.log(url)
            }

            const data = {
                order_id,
                user_id,
                priceTotal,
                bill: imagurl
            }

            const pay = await (await Models.Payment.create(data))
                .populate('order_id');

            if (!pay) return SendE400(res, EMessage.FAILE);

            return SendS201(res, SMessage.SUCCESS, pay)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllPayMent(req, res) {
        try {
            const user_id = req.user._id;

            const posts = await Models.Post.find(
                { user_id, isActive: true }
            )
            const post_ids = posts.map(post => post._id);
            const orders = await Models.Order.find(
                { post_id: { $in: post_ids }, isActive: true }
            )
            const order_ids = orders.map(order => order._id)

            const payments = await Models.Payment.find(
                { order_id: { $in: order_ids }, isActive: true }
            ).populate('order_id')

            return SendS200(res, SMessage.SUCCESS, payments)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getOnePayMent(req, res) {
        try {
            const pay_id = req.params.payid;
            const pay = await Models.Payment.findOne({ _id: pay_id })
                .populate([
                    { path: 'order_id' },
                    { path: 'user_id', select: '-password' }
                ]);

            return SendS200(res, SMessage.SUCCESS, pay)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllMyPayMent(req, res) {
        try {
            const user_id = req.user._id;
            if (!mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const myPayment = await Models.Payment.find(
                { user_id, isActive: true }
            ).populate('order_id')

            return SendS200(res, SMessage.SUCCESS, myPayment)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async deletePayMent(req, res) {
        try {
            const user_id = req.user._id;
            const payment_id = req.params.payid;
            if (!mongoose.Types.ObjectId.isValid(payment_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            await Models.Payment.findOneAndUpdate(
                { _id: payment_id, user_id },
                { isActive: false },
                { new: true }
            )

            return SendS200(res, SMessage.SUCCESS)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
    
    static async getAllByAdmin(req, res) {
        try {
            const allPayment = await Models.Payment.find(
            { isActive: true }
            ).populate('order_id')
            return SendS200(res, SMessage.SUCCESS, allPayment)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
}

export default PayMentController;