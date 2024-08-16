import Models from "../model/index.model.js";
import { EMessage, SMessage } from "../services/message.js";
import { SendE400, SendE401, SendS200 } from "../services/response.js";
import { VerifyRefreshToken, SignToken, SignRefreshToken } from "../services/services.js";


const RefresToken = (req, res) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise (async (resolve, reject) => {
        try {
        const refreshToken = req.body.refreshToken;
        // console.log(`token: `, token)
        if(!refreshToken)
            return SendE400(res, EMessage.PLEASE_INPUT + 'token', EMessage.INVALID_PARAMS);
        
        const verified = await VerifyRefreshToken(refreshToken);
        // console.log(decode)
        if( verified.message !== SMessage.SUCCESS)
            return SendE401(res, EMessage.FAILE, verified.data);

        const _id = verified.data.id;
        // console.log(`_id: `, _id)
        const user = await Models.User.findOne({_id: _id})
        
        if(!user)
            return SendE400(res,  EMessage.TOKEN_EX);
        // req.token = token;
        let playload  = {
            id: user.id,
            role: user.role,
            login_version: user.login_verssion,
        }
        const token = await SignToken(playload);
        const refresh = await SignRefreshToken(user);
        // console.log(req.user)
        return SendS200(res, SMessage.SUCCESS, {token, refresh});
        } catch (error) {
            reject(error)
        }
    })
}

export default RefresToken;