import Models from "../model/index.model.js";
import { SendE400, SendE500, SendS200, SendS201 } from "../services/response.js";
import { EMessage, SMessage } from "../services/message.js";
import { ValidateData } from "../services/validate.js";
import Cloudinary from "../services/util/uploadImage.js";
import mongoose from "mongoose";

//------------------------------
class ProductController {
    static async insertProduct(req, res) {
        try {
            const user_id = req.user._id;
            let { category_id, name, detail, price } = req.body;
            const data = { category_id, name, detail, price };
            const validate = ValidateData(data);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const files = req.files || null
            const imagurl = []
            // console.log(files.file.length)
            if (files.file.length > 1) {
                const Cloud = new Cloudinary();
                for (let file of files.file) {
                    const img = file.data.toString('base64')
                    const imgName = file.name.split(".")[0]
                    const url = await Cloud.uploadImage(img, imgName);
                    imagurl.push(url)
                }
            }

            const product = {
                user_id,
                category_id,
                name,
                detail,
                price,
                image: imagurl
            }
            const insertPro = await Models.Product.create(product);
            return SendS201(res, SMessage.SUCCESS, insertPro);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updateProduct(req, res) {
        try {
            const user_id = req.user._id;
            const product_id = req.params.id;
            let { category_id, name, detail, price } = req.body;
            const data = { category_id, name, detail, price };
            const validate = ValidateData(data);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);
            if (!product_id || !mongoose.Types.ObjectId.isValid(product_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'product id')

            const files = req.files || null
            const imagurl = []
            // console.log(files.file.length)
            if (files.file.length > 1) {
                const Cloud = new Cloudinary();
                for (let file of files.file) {
                    const img = file.data.toString('base64')
                    const imgName = file.name.split(".")[0]
                    const url = await Cloud.uploadImage(img, imgName);
                    imagurl.push(url)
                }
            }
            const product = {
                category_id,
                name,
                detail,
                price,
                image: imagurl
            }

            const update = await Models.Product.findOneAndUpdate(
                { _id: product_id, user_id },
                product,
                { new: true }
            )
            if (!update) return SendE400(res, EMessage.NOT_FOUND)

            return SendS200(res, EMessage.SUCCESS, update)
        } catch (error) {
            console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllProduct(req, res) {
        try {
            const user_id = req.user._id;
            const allProduct = await Models.Product.find({ user_id, isActive: true })
                .populate('category_id')
            if (!allProduct)
                return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS, allProduct)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getOneProduct(req, res) {
        try {
            const id = req.params.id;
            if (!id)
                return SendE400(res, EMessage.INVALID_PARAMS, EMessage.PLEASE_INPUT + 'id');
            const product = await Models.Product.findOne({ _id: id, isActive: true })
                .populate('category_id')
            if (!product)
                return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS, product)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async deleteProduct(req, res) {
        try {
            const _id = req.params.id;
            if (!_id || !mongoose.Types.ObjectId.isValid(_id))
                return SendE400(res, EMessage.INVALID_PARAMS, EMessage.PLEASE_INPUT + 'id');
            const del = await Models.Product.findOneAndUpdate(
                { _id: _id },
                { isActive: false },
                { new: true }
            )
            if (!del)
                return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }
}

export default ProductController;