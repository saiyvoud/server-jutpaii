import Models from "../model/index.model.js";
import { SendE400, SendE500, SendS200, SendS201 } from "../services/response.js";
import { EMessage, SMessage } from "../services/message.js";
import mongoose from "mongoose";


class ShareController {

    static async sharePost(req, res) {
        try {
            const user_id = req.user._id;
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const checkShare = await Models.Share.findOne(
                { user_id, post_id }
            )

            if (checkShare) {
                const share = await Models.Share.findOneAndUpdate(
                    { user_id, post_id },
                    { statusShare: false },
                    { new: true }
                );
                return SendS201(res, SMessage.SUCCESS, share)
            }

            const data = {
                user_id,
                post_id,
                statusShare: true
            }
            const share = await Models.Share.create(data);

            return SendS200(res, SMessage.SUCCESS, share)
        } catch (error) {
            // console.log('error: ', error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async unSharePost(req, res) {
        try {
            const user_id = req.user._id;
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const unshare = await Models.Share.findOneAndUpdate(
                { user_id, post_id },
                { statusShare: false },
                { new: true }
            );

            return SendS200(res, SMessage.SUCCESS, unshare)
        } catch (error) {
            // console.log('error: ', error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getMySharePost(req, res) {
        try {
            const user_id = req.user._id;
            const mySharePost = await Models.Share.find(
                { user_id, isActive: true }
            ).populate(
                'post_id'
            )

            return SendS200(res, SMessage.SUCCESS, mySharePost);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

}

export default ShareController;