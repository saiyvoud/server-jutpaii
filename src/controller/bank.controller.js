import Models from "../model/index.model.js";
import { SMessage, EMessage } from "../services/message.js";
import { SendS200, SendS201, SendE400, SendE500, SendE404 } from "../services/response.js";
import { ValidateData } from "../services/validate.js";
import mongoose from "mongoose";

class BankController {

    static async insertBankAccount(req, res) {
        try {
            const user_id = req.user._id;
            let { bankName, accountName, accountNo } = req.body;
            const bankV = { user_id, bankName, accountName, accountNo };
            const validate = ValidateData(bankV);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);
            if (!mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const checkExit = await Models.Bank.findOne({ accountNo: accountNo });
            if (checkExit)
                return SendE400(res, EMessage.BANK_EXIT);

            const bank = await Models.Bank.create({
                user_id: user_id,
                bankName: bankName,
                accountName: accountName,
                accountNo: accountNo
            });
            return SendS201(res, SMessage.SUCCESS, bank);

        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async deleteBank(req, res) {
        try {

            const bankId = req.params.id;
            if (!bankId)
                return SendE400(res, EMessage.PLEASE_INPUT + 'bank id');
            const update = await Models.Bank.findOneAndUpdate({ _id: bankId }, { isActive: false }, { new: true });
            if (!update)
                return SendE400(res, EMessage.NOT_FOUND);


            return SendS200(res, SMessage.DELETE);

        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getOneBank(req, res) {
        try {

            const bankId = req.params.id;
            if (!bankId)
                return SendE400(res, EMessage.PLEASE_INPUT + 'bank id');
            const account = await Models.Bank.findOne({ _id: bankId });
            if (!account)
                return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS, account);

        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async myBankAccount(req, res) {
        try {
            const user_id = req.user._id;
            const account = await Models.Bank.find(
                { user_id: user_id, isActive: true }
            )
            if (!account)
                return SendE404(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS, account);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

}

export default BankController;