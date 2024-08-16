import mongoose from "mongoose";
import Models from "../model/index.model.js";
import { SMessage, EMessage } from "../services/message.js";
import { SendS200, SendS201, SendE400, SendE500, SendE404 } from "../services/response.js";
import { ValidateData, hasAttribute, attributeNameArr } from "../services/validate.js";



class AddressController {

    static async insertAddress(req, res) {
        try {
            const user_id = req.user._id;
            let { province, district, village } = req.body;
            const data = { user_id, province, district, village };
            const validate = ValidateData(data);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            // const address_id = new mongoose.Types.ObjectId();
            const address = await Models.Address.create({
                province: province,
                district: district,
                village: village,
            })

            await Models.User.findOneAndUpdate(
                { _id: user_id },
                { address: address._id }
            )

            return SendS201(res, SMessage.SUCCESS, address)
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.s500, error);
        }
    }

    static async updateAddress(req, res) {
        try {
            const user_id = req.user._id;
            const updateData = req.body;
            const hasAttUpdate = hasAttribute(updateData, attributeNameArr.address);
            if (!hasAttUpdate) {
                const _user = await Models.User.findOne({ _id: user_id }).select('-password').populate('address');
                // const address = _user.address
                return SendS200(res, SMessage.SUCCESS, _user)
            }
            const validate = ValidateData(updateData);
            if (validate.length > 0) {
                for (const i of validate) {
                    delete updateData[i]
                }
            }

            const user = await Models.User.findOne({ _id: user_id }).select('-password');
            const update = await Models.Address.findOneAndUpdate(
                { _id: user.address },
                { $set: updateData },
                { new: true }
            )
            if (!update)
                return SendE404(res, EMessage.NOT_FOUND, '');
            const _user = await Models.User.findOne({ _id: user_id }).select('-password').populate('address');
            return SendS200(res, SMessage.SUCCESS, _user)
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async deleteAddress(req, res) {
        try {
            const user_id = req.user._id;
            const address_id = req.params.id;
            if (!address_id)
                return SendE400(res, EMessage.PLEASE_INPUT + "address id");
            if (!mongoose.Types.ObjectId.isValid(address_id))
                return SendE400(res, EMessage.INVALID_PARAMS);
            const del = await Models.Address.findOneAndUpdate(
                { _id: address_id },
                { isActive: false },
                { new: true }
            )
            await Models.User.findOneAndUpdate(
                { _id: user_id },
                { address: null },
                { new: true }
            )

            if (!del)
                return SendE404(res, EMessage.NOT_FOUND)
            // console.log(del)
            return SendS200(res, SMessage.DELETE);
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.s500, error);
        }
    }

    static async getOneAddress(req, res) {
        try {
            const address_id = req.params.id;
            if (!address_id)
                return SendE400(res, EMessage.PLEASE_INPUT + "address id");
            if (!mongoose.Types.ObjectId.isValid(address_id))
                return SendE400(res, EMessage.INVALID_PARAMS);
            const address = await Models.Address.findOne(
                { _id: address_id }
            )
            if (!address)
                return SendE404(res, EMessage.NOT_FOUND)

            return SendS200(res, SMessage.SUCCESS, address);
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.s500, error);
        }
    }
}

export default AddressController;