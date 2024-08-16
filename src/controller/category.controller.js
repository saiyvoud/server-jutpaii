
import { EMessage, SMessage } from "../services/message.js";
import { SendE400, SendE404, SendE500, SendS201, SendS200 } from "../services/response.js";
import { ValidateCategory, ValidateData } from "../services/validate.js";
import Models from "../model/index.model.js";
import mongoose from "mongoose";


class CategoryController {

    static async insertCategory(req, res) {
        try {
            const { title, entitle } = req.body;
            const validate = ValidateCategory(req.body);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const cat = await Models.Category.create({ title, entitle });
            return SendS201(res, SMessage.SUCCESS, cat);
        } catch (error) {
            // console.log(error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllCategory(req, res) {
        try {

            const allCateg = await Models.Category.find({ isActive: true });
            if (!allCateg)
                return SendE400(res, EMessage.NOT_FOUND, '');
            return SendS200(res, SMessage.SUCCESS, allCateg);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updateCategory(req, res) {
        try {
            const id = req.params.id;
            const { title, entitle } = req.body;
            if (!title && !entitle)
                return SendE400(res, EMessage.PLEASE_INPUT, EMessage.INVALID_PARAMS);
            const updateSet = {};
            if (title) updateSet.title = title;
            if (entitle) updateSet.entitle = entitle;

            const cat = await Models.Category.updateOne({ _id: id }, updateSet, { new: true });
            return SendS200(res, SMessage.SUCCESS, cat);

        } catch (error) {
            // console.log(error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async deleteCategory(req, res) {
        try {
            const _id = req.params.id;
            if (!_id)
                return SendE400(res, EMessage.PLEASE_INPUT + "id: ", EMessage.INVALID_PARAMS);

            const validate = await Models.Category.findOne({ _id: _id });
            if (!validate)
                return SendE404(res, EMessage.NOT_FOUND);

            await Models.Category.findOneAndUpdate(
                { _id }, { isActive: false }, { new: true }
            );

            return SendS200(res, SMessage.DELETE)

        } catch (error) {
            // console.log(error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async unPublish(req, res) {
        try {
            const category_id = req.params.id;
            const validate = ValidateData({ category_id });
            if (validate > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(""), EMessage.INVALID_PARAMS);
            if (!mongoose.Types.ObjectId.isValid(category_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            const unPub = await Models.Category.findOneAndUpdate(
                { _id: category_id },
                { isPublish: false },
                { new: true }
            )
            return SendS200(res, SMessage.SUCCESS, unPub)
        } catch (error) {
            SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async publish(req, res) {
        try {
            const category_id = req.params.id;
            const validate = ValidateData({ category_id });
            if (validate > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(""), EMessage.INVALID_PARAMS);
            if (!mongoose.Types.ObjectId.isValid(category_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            const unPub = await Models.Category.findOneAndUpdate(
                { _id: category_id },
                { isPublish: true },
                { new: true }
            )
            return SendS200(res, SMessage.SUCCESS, unPub)
        } catch (error) {
            SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    // static async 
}

export default CategoryController;