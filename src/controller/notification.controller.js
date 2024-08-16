/* eslint-disable no-unreachable */
import mongoose, { Types } from "mongoose";
import Models from "../model/index.model.js";
import { SMessage, EMessage } from "../services/message.js";
import { SendE500, SendE400, SendS200 } from "../services/response.js";
import { ValidateData } from "../services/validate.js";
import admin from "../config/firebase.js";

/*
    saveRegisterToken
    getAllNoti
    getAllNewNoti
    getAllOldNoti
    sendNotification
    readNoti
*/

class NotificationController {

    static async saveRegisterToken(req, res) {
        try {
            const user_id = req.user._id;
            const { registerToken } = req.body;
            const validate = ValidateData({ registerToken, user_id });
            if (validate.length > 0) return SendE400(res, EMessage.PLEASE_INPUT + validate.join(','), EMessage.INVALID_PARAMS);

            await Models.User.updateOne(
                { _id: user_id },
                { device_token: registerToken },
                { new: true }
            )
            return SendS200(res, SMessage.SUCCESS)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllNoti(req, res) {
        try {
            let user_id = req.user._id;
            let noti = await Models.Notification.find({ user_id }).sort({ createdAt: 'desc' }).limit(40)
            if (noti == '')
                return SendE400(res, SMessage.DONTHAVE, '')

            return SendS200(res, SMessage.SUCCESS, noti)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllNewNoti(req, res) {
        try {
            let user_id = req.user._id;
            let noti = await Models.Notification.find({ user_id, isNewNoti: true }).sort({ createdAt: 'desc' }).limit(40)
            if (noti == '')
                return SendE400(res, SMessage.DONTHAVE, '')

            return SendS200(res, SMessage.SUCCESS, noti)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllOldNoti(req, res) {
        try {
            let user_id = req.user._id;
            let noti = await Models.Notification.find({ user_id, isNewNoti: false }).sort({ createdAt: 'desc' }).limit(40)
            if (noti == '')
                return SendE400(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, noti)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    async sendNotification(title, text, data, typeNoti, sendToUser_id) {
        let user = await Models.User.findOne({ _id: sendToUser_id });
        // console.log(user);
        // await Models.Notification()
        // const device_token = "eJrLZ_AeTjajWKcCVuQpu5:APA91bH5KOUHazsfFkw-mRif0Y5v7Ovw5I_5ptrBM6VMXs2dKOZZvEYrPg433gk4-2tYFjfS6UQ_BS8VM2GOfDEaUuu3tp8758e8THx4XXZKp7ntJ13kUnkF2MeNx_amiPfNcQHoJ2B8"

        // const message = {
        //     notification: {
        //         title: title,
        //         body: 'some message'//JSON.stringify(data)
        //     },
        //     token: user.device_token
        // }

        console.log('data: ', data);

        const createdNoti = await Models.Notification.create(
            {
                user_id: user._id,
                title: title,
                text: text,
                data: data || '',
                type: typeNoti
            }
        )
        if (!createdNoti)
            return { message: EMessage.FAILE, data: '' }
        // send notification
        // await admin.messaging().send(message)
        //     .then((response) => {
        //         console.log(`send message success: `, response)
        //     }).catch(err => {
        //         console.log(`error: => `, err)
        //     })
        return { message: SMessage.SUCCESS, data: createdNoti.toJSON() }
    }

    static async readNoti(req, res) {
        try {
            // const noti_id = req.params.id;
            const user_id = req.user._id;
            if (!Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id', '')

            const readedNoti = await Models.Notification.updateMany(
                { user_id: user_id, isNewNoti: true },
                { $set: { isNewNoti: false } },
                { new: true }
            )
            if (readedNoti.modifiedCount <= 0)
                return SendS200(res, SMessage.SUCCESS, 0)
            // let _msg = null;
            // const resData = {
            //     ...readedNoti.toObject()
            // }
            // if (readedNoti.type == 'message') {
            //     const msg = readedNoti.data;
            //     console.log('message: ', msg);
            //     await Models.Message.findOneAndUpdate(
            //         { _id: msg._id },
            //         { $set: { isReaded: true } },
            //         { new: false }
            //     )
            //     resData.data.isReaded = true
            // }
            // console.log('resData: ', resData);
            console.log("modifiedCount: ", readedNoti.modifiedCount);
            const readed_count = readedNoti.modifiedCount
            return SendS200(res, SMessage.SUCCESS, { readed_count })
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async deleteNoti(req, res) {
        try {
            const noti_id = req.params.id;
            if (!Types.ObjectId.isValid(noti_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id', '')

            const deletedNoti = await Models.Notification.findOneAndUpdate(
                { _id: noti_id },
                { $set: { isActive: false } },
                { new: true }
            )
            if (!deletedNoti)
                return SendE400(res, EMessage.NOT_FOUND + 'noti', '')

            // const deletedNoti = await Models.Notification.deleteMany({isNewNoti: false})
            return SendS200(res, SMessage.SUCCESS, deletedNoti)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    // ---------------------------------------
    static async newNoti(req, res) {
        try {
            const { user_id } = req.body;
            if (!Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id', '')

            const newNoti = await Models.Notification.find({ user_id, isActive: true, isNewNoti: true });
            // .populate([
            //     {
            //         path: 'order_id',
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
            // ])
            if (newNoti == '')
                return SendS200(res, SMessage.DONTHAVE, '')
            return SendS200(res, SMessage.SUCCESS, newNoti)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async sendNoti(req, res) {
        try {
            const { user_id, title, text } = req.body;
            const validate = ValidateData({ user_id, title, text });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(','), EMessage.INVALID_PARAMS);
            if (!mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')
            const user = await Models.User.findOne({ _id: user_id });
            if (user) {
                if (!user.device_token)
                    return SendE400(res, EMessage.NOTREGITERTOKEN)
            }
            const message = {
                notification: {
                    title,
                    text
                },
                token: user.device_token
            }
            const sendedNoti = await Models.Notification.create(
                {
                    user_id: user._id,
                    title: title,
                    text: text,
                    // detail:
                    type: 'noti'
                }
            )

            await admin.messaging().send(message)
                .then((response) => {
                    console.log(`send message success: `, response)
                }).catch(err => {
                    console.log(`error: => `, err)
                })
            return SendS200(res, SMessage.SUCCESS, sendedNoti)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    async notiNewOrder(orderData, title, detail, user_id) {
        try {
            let user = await Models.User.findOne({ _id: user_id });
            const message = {
                notification: {
                    title,
                    detail
                },
                token: user.device_token,
                data: orderData
            }
            await Models.Notification.create(
                {
                    user_id: user._id,
                    title: title,
                    // text: ,
                    detail: detail,
                    order_id: orderData._id,
                    type: 'order'
                }
            )
            await admin.messaging().send(message)
                .then((response) => {
                    console.log(`send message success: `, response)
                }).catch(err => {
                    console.log(`error: => `, err)
                })
            return SMessage.SUCCESS
        } catch (error) {
            return error
        }
    }

    async notiNewMessage(messageData, title, detail, user_id) {
        try {
            let user = await Models.User.findOne({ _id: user_id });
            // await Models.Notification()
            const message = {
                notification: {
                    title,
                    detail
                },
                token: user.device_token,
                data: messageData
            }
            await Models.Notification.create(
                {
                    user_id: user_id,
                    title: title,
                    detail: detail,
                    type: 'message'
                }
            )
            await admin.messaging().send(message)
                .then((response) => {
                    console.log(`send message success: `, response)
                }).catch(err => {
                    console.log(`error: => `, err)
                })
            return SMessage.SUCCESS
        } catch (error) {
            return error
        }
    }

    static async testSendNoti(req, res) {
        try {
            // const { device_token } = req.body;
            const device_token = "eJrLZ_AeTjajWKcCVuQpu5:APA91bH5KOUHazsfFkw-mRif0Y5v7Ovw5I_5ptrBM6VMXs2dKOZZvEYrPg433gk4-2tYFjfS6UQ_BS8VM2GOfDEaUuu3tp8758e8THx4XXZKp7ntJ13kUnkF2MeNx_amiPfNcQHoJ2B8"
            const message = {
                notification: {
                    title: 'test title',
                    body: 'test body'
                },
                token: device_token
            }
            await admin.messaging().send(message)
                .then((response) => {
                    console.log(`send message success: `, response)
                }).catch(err => {
                    console.log(`error: => `, err)
                })
            return SendS200(res, SMessage.SUCCESS,)
        } catch (error) {
            // console.log(`err: => `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

}


export default NotificationController;