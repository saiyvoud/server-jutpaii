
import Models from "../model/index.model.js";
import { EMessage, SMessage, Role } from "../services/message.js";
import { SendE400, SendE500, SendE401, SendE404 } from "../services/response.js";
import { VerifyToken } from "../services/services.js";

export const auth = async (req, res, next) => {
    try {

        if (!req.headers["authorization"])
            return SendE401(res, 'invalid token')
        const token = req.headers["authorization"].replace("Bearer ", "");
        // console.log(`token: `, token)
        if (!token)
            return SendE400(res, EMessage.PLEASE_INPUT + 'token', EMessage.INVALID_PARAMS);

        const verified = await VerifyToken(token);
        if (verified.message !== SMessage.SUCCESS)
            return SendE401(res, EMessage.FAILE, verified.data);

        // console.log(verified)
        const _id = verified.data.id;
        const user = await Models.User.findOne({ _id: _id })
        if(!user)
            return SendE404(res, EMessage.NOT_FOUND + ' user')

        const credential = {
            _id: user._id,
            role: user.role
        }

        if (!user)
            return SendE400(res, EMessage.TOKEN_EX);
        // req.token = token;
        req.user = credential;
        // console.log(req.user._id)
        next();
    } catch (error) {
        // console.log(error);
        return SendE500(res, EMessage.SERVER_ERROR, error.message);
    }
}



export const admin = async (req, res, next) => {
    try {
        const id = req.user._id;
        const user = await Models.User.findOne({ _id: id });
        if (!user) {
            return SendE401(res, EMessage.NOT_FOUND + "userId");
        }
        // console.log(user)
        if (user.role === Role.Admin) {
            const checkRole = await Models.User.findOne({
                _id: id,
                isActive: true,
                role: user.role,
            });
            // console.log(checkRole)
            if (!checkRole) {
                return SendE400(res, "Error Role");
            }
            next();
        } else {
            return SendE400(res, "Error Role");
        }
    } catch (error) {
        // console.log(error);
        return SendE500(res, EMessage.SERVER_ERROR, error);
    }
};