import mongoose from "mongoose";
import Models from "../model/index.model.js";
import { SMessage, EMessage, TypeMessage, TypeLastMessage } from "../services/message.js";
import { SendE404, SendE500, SendE400, SendS201, SendS200 } from "../services/response.js";
import { ValidateData } from "../services/validate.js";
import { io } from "../server.js";
import { deCryptMessage, enCryptMessage } from "../services/services.js";
import Cloudinary from "../services/util/uploadImage.js";

// import NotificationController from "./notification.controller.js";


class MessageController {

    static async getAllMessageInRoom(req, res) {
        try {
            const room_id = req.params.roomid;
            let page = req.query.page || 0;
            if (!room_id || !mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            let messages = await Models.Message.find({
                room_id: room_id,
                isActive: true
            }).populate([
                {
                    path: 'room_id',
                    populate: {
                        path: 'users sender receiver',
                        select: 'username profile bio'
                    }
                },
                {
                    path: 'sender',
                    select: '_id username profile bio'
                },
                {
                    path: 'post_id',
                    populate: {
                        path: 'product_id'
                    }
                },
                {
                    path: 'order_id',
                    populate: {
                        path: 'post_id',
                        populate: {
                            path: 'product_id'
                        }
                    }
                }
            ]).sort({ createdAt: 'desc' }).skip(page * 20).limit(20)
            if (messages == '') return SendS200(res, SMessage.DONTHAVE, [])
            messages = messages.map((value) => {
                if (!value.message)
                    return value
                value.message = deCryptMessage(value.message)
                return value
            })
            return SendS200(res, SMessage.SUCCESS, messages)
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async sendMessage(req, res) {
        try {
            const sender = req.user._id;
            let receiver = '';
            const { room_id, message } = req.body;
            const validate = ValidateData({ room_id, message, sender });
            if (validate.length > 0)
                return SendE400(res, EMessage.INVALID_PARAMS + validate.join(","));
            if (!mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            let room = await Models.Room.findOne({ _id: room_id });
            room.users.map((value) => {
                if (sender.toString() != value.toString()) {
                    return receiver = value
                }
            })
            const data = {
                room_id,
                message: enCryptMessage(message),
                sender,
            }
            await Models.Room.findOneAndUpdate(
                { _id: room_id },
                {
                    lastMessage: message,
                    sender,
                    receiver,
                    type: TypeLastMessage.message
                },
                { new: true }
            )
            let send = await (await Models.Message.create(data))
                .populate([
                    {
                        path: 'room_id',
                        populate: {
                            path: 'users sender receiver',
                            select: 'username profile bio'
                        }
                    },
                    {
                        path: 'sender',
                        select: 'username profile bio'
                    }
                ]);
            if (!send)
                return SendE400(res, EMessage.FAILE);
            send.message = message
            // console.log('send: ', send.toJSON());
            // const Notification = new NotificationController();
            // const sendNoti = await Notification.sendNotification('ຂໍ້ຄວາມໃໝ່', '', send.toJSON(), TypeNoti.message, receiver)
            // if (sendNoti.message != SMessage.SUCCESS)
            //     console.log('send notification failed');
            // tempery 24-12-2023
            // -------------------------------------------------------------------
            let getSendMessage = await Models.Message.find({
                room_id: room_id,
                isActive: true
            }).populate([
                {
                    path: 'room_id',
                    populate: {
                        path: 'users sender receiver',
                        select: 'username profile bio'
                    }
                },
                {
                    path: 'sender',
                    select: '_id username profile bio'
                },
                {
                    path: 'post_id',
                    populate: {
                        path: 'product_id'
                    }
                },
                {
                    path: 'order_id',
                    populate: {
                        path: 'post_id',
                        populate: {
                            path: 'product_id'
                        }
                    }
                }
            ]).sort({ createdAt: 'desc' }).limit(20)
            if (getSendMessage == '') return SendE404(res, EMessage.NOT_FOUND)
            getSendMessage = getSendMessage.map((value) => {
                if (!value.message)
                    return value
                value.message = deCryptMessage(value.message)
                return value
            });
            // -------------------------------------------------------------------------------
            // emit chat message
            io.to(data.room_id).emit('chat_message', { data: send });
            // console.log('send message success!');
            return SendS201(res, SMessage.SUCCESS, send);
        } catch (error) {
            console.log(`err: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async delete(req, res) {
        try {
            const user_id = req.user._id;
            const message_id = req.params.msg_id;
            if (!mongoose.Types.ObjectId.isValid(message_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const delmsg = await Models.Message.findOneAndUpdate(
                { sender: user_id, _id: message_id },
                { isActive: false },
                { new: true }
            )
            if (!delmsg) return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS, delmsg);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async readedMessage(req, res) {
        try {
            const user_id = req.user._id;
            let room_id = req.params.roomid;
            if (!mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const messages = await Models.Message.find({
                room_id: room_id,
                sender: { $ne: user_id },
                isReaded: false
            });
            if (messages == '') {
                return SendS200(res, SMessage.SUCCESS);
            }
            const msgIDs = messages.map(msg => {
                return msg._id
            })
            // await Models.Notification.updateMany(
            //     {
            //         isNewNoti: true,
            //         type: 'message',
            //         'data._id': { $in: msgIDs }
            //     },
            //     {
            //         isNewNoti: false
            //     }
            // )
            // const readedNoti = 
            await Models.Notification.updateMany(
                {
                    isNewNoti: true,
                    type: 'message',
                    'data._id': { $in: msgIDs }
                },
                {
                    $set: { isNewNoti: false }
                }
            )
            const updateResult = await Models.Message.updateMany(
                { room_id: room_id, sender: { $ne: user_id }, isReaded: false },
                { $set: { isReaded: true } },
                { new: true }
            );
            // console.log('updateResult: ', updateResult.modifiedCount);
            if (updateResult.modifiedCount > 0)
                io.to(room_id).emit('readed_message', { data: { message: 'message is readed', room_id: room_id } });
            // if(readedMsg.length > 0)
            return SendS200(res, SMessage.SUCCESS, '');
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async sendImage(req, res) {
        try {
            const sender = req.user._id;
            let receiver = '';
            const { room_id, message } = req.body;
            const validate = ValidateData({ room_id, sender });
            if (validate.length > 0)
                return SendE400(res, EMessage.INVALID_PARAMS + validate.join(","));
            if (!mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            let room = await Models.Room.findOne({ _id: room_id });
            // console.log(`room user: `, room.users);
            room.users.map((value) => {
                if (sender.toString() != value.toString()) {
                    return receiver = value
                }
            })

            const files = req.files
            if (!files)
                return SendE400(res, EMessage.PLEASE_INPUT + 'image')
            let image = '';
            // console.log(files);
            if (files) {
                let img = files.image.data.toString('base64')
                let imgName = files.image.name.split(".")[0]
                let Cloud = new Cloudinary();
                let url = await Cloud.uploadImage(img, imgName);
                image = url
                // console.log(url)
            }

            const data = {
                room_id,
                message: '',
                sender,
                image,
                type: TypeMessage.image
            }

            await Models.Room.findOneAndUpdate(
                { _id: room_id },
                {
                    lastMessage: image,
                    sender,
                    receiver,
                    type: TypeLastMessage.image
                },
                { new: true }
            )

            let send = await (await Models.Message.create(data))
                .populate([
                    {
                        path: 'room_id',
                        populate: {
                            path: 'users sender receiver',
                            select: 'username profile bio'
                        }
                    },
                    {
                        path: 'sender',
                        select: 'username profile bio'
                    }
                ])
            if (!send)
                return SendE400(res, EMessage.FAILE);
            send.message = message
            // const Notification = new NotificationController();
            // const sendNoti = await Notification.sendNotification('ຂໍ້ຄວາມໃໝ່', '', send.toJSON(), TypeNoti.image, receiver)
            // if (sendNoti.message != SMessage.SUCCESS)
            //     console.log('send notification failed');

            // emit send message
            io.to(data.room_id).emit('chat_message', { data: send });
            return SendS201(res, SMessage.SUCCESS, send);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async sendPost(req, res) {
        try {
            const sender = req.user._id;
            let receiver = '';
            let { room_id, post_id, message } = req.body;
            const validate = ValidateData({ room_id, post_id, sender });
            if (validate.length > 0)
                return SendE400(res, EMessage.INVALID_PARAMS + validate.join(","));
            if (!mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            let room = await Models.Room.findOne({ _id: room_id });
            // console.log(`room user: `, room.users);
            room.users.map((value) => {
                if (sender.toString() != value.toString()) {
                    return receiver = value
                }
            })
            let _message = message
            if (!message)
                message = enCryptMessage(message)
            const data = {
                room_id,
                message,
                sender,
                type: TypeMessage.post,
                post_id
            }

            await Models.Room.findOneAndUpdate(
                { _id: room_id },
                {
                    lastMessage: _message,
                    sender,
                    receiver,
                    type: TypeLastMessage.post
                },
                { new: true }
            )

            let send = await (await Models.Message.create(data))
                .populate([
                    {
                        path: 'room_id',
                        populate: {
                            path: 'users sender receiver',
                            select: 'username profile bio'
                        }
                    },
                    {
                        path: 'sender',
                        select: 'username profile bio'
                    },
                    {
                        path: 'post_id',
                        populate: {
                            path: 'product_id'
                        }
                    }
                ])
            let post = await Models.Post.findOne({ _id: post_id })
            if (!send)
                return SendE400(res, EMessage.FAILE);
            send.message = message
            send.post = post
            // const Notification = new NotificationController();
            // const sendNoti = await Notification.sendNotification('ຂໍ້ຄວາມໃໝ່', '', send.toJSON(), TypeNoti.post, receiver)
            // if (sendNoti.message != SMessage.SUCCESS)
            //     console.log('send notification failed');
            // emit send message
            io.to(data.room_id).emit('chat_message', { data: send });
            return SendS201(res, SMessage.SUCCESS, send);
        } catch (error) {
            // console.log(`err: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async sendFormOrder(req, res) {
        try {
            let user_id = req.user._id;
            const sender = req.user._id;
            let receiver = '';
            let { room_id, post_id, message, name, phoneNumber, address, express, detail } = req.body;
            const validate = ValidateData({ room_id, post_id, sender, name, phoneNumber });
            if (validate.length > 0)
                return SendE400(res, EMessage.INVALID_PARAMS + validate.join(","));
            if (!mongoose.Types.ObjectId.isValid(room_id) || !mongoose.Types.ObjectId.isValid(post_id) || !mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            // create order
            const checkSale = await Models.Order.findOne({ post_id });
            if (checkSale) {
                return SendE400(res, EMessage.POSTARESSOLD)
            }

            let room = await Models.Room.findOne({ _id: room_id });
            // console.log(`room user: `, room.users);
            room.users.map((value) => {
                if (sender.toString() != value.toString()) {
                    return receiver = value
                }
            })
            const order_data = {
                room_id,
                user_id,
                post_id,
                name,
                phoneNumber,
                address,
                express,
                detai: detail || ''
            }
            let _order = await Models.Order.create(order_data);
            if (!_order)
                return SendE400(res, EMessage.FAILE);

            await Models.Post.updateOne(
                { _id: post_id },
                { isSale: true },
                { new: true }
            )

            // message
            let _message = message
            if (!message)
                message = enCryptMessage(message)
            const data = {
                room_id,
                message,
                sender,
                type: TypeMessage.form,
                order_id: _order.id
            }

            await Models.Room.findOneAndUpdate(
                { _id: room_id },
                { lastMessage: _message, sender, receiver },
                { new: true }
            )
            let send = await (await Models.Message.create(data))
                .populate([
                    {
                        path: 'room_id'
                    },
                    {
                        path: 'order_id',
                        populate: {
                            path: 'post_id',
                            populate: [
                                {
                                    path: 'product_id'
                                },
                                {
                                    path: 'user_id',
                                    select: 'name profile'
                                }
                            ]
                        }
                    }
                ]
                );
            let order = await Models.Order.findOne({ _id: _order.id })
            if (!send)
                return SendE400(res, EMessage.FAILE);
            send.message = message
            send.order = order

            // send create order by user to room chat
            io.to(room_id).emit("create_order", { order })
            // const Notification = new NotificationController();
            // const sendNoti = await Notification.sendNotification('ອໍເດີ້ໃໝ່', '', send.toJSON(), TypeNoti.order, receiver)
            // if (sendNoti.message != SMessage.SUCCESS)
            //     console.log('send notification failed');

            return SendS201(res, SMessage.SUCCESS, send);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    async readedMessage(room_id) {
        try {
            let rd = await Models.Message.updateMany(
                { room_id },
                { isReaded: true },
                { new: true }
            )
            if (!rd)
                return rd
            return
        } catch (error) {
            return error
        }
    }

    async sendPost(room_id, post_id, sender) {
        try {
            // console.log('send post');
            let receiver = ''
            const validate = ValidateData({ room_id, post_id, sender });
            if (validate.length > 0)
                return { message: `${EMessage.INVALID_PARAMS + validate.join(",")}`, data: null }
            if (!mongoose.Types.ObjectId.isValid(room_id))
                return { message: `${EMessage.INVALID_PARAMS + 'id'}`, data: null }

            let room = await Models.Room.findOne({ _id: room_id });
            // console.log(`room user: `, room.users);
            room.users.map((value) => {
                if (sender.toString() != value.toString()) {
                    return receiver = value
                }
            })
            const data = {
                room_id,
                message: '',
                sender,
                type: TypeMessage.post,
                post_id
            }

            await Models.Room.findOneAndUpdate(
                { _id: room_id },
                {
                    lastMessage: '',
                    sender,
                    receiver,
                    type: TypeLastMessage.post
                },
                { new: true }
            )

            let send = await (await Models.Message.create(data))
                .populate([
                    {
                        path: 'room_id',
                        populate: {
                            path: 'users sender receiver',
                            select: 'username profile bio'
                        }
                    },
                    {
                        path: 'sender',
                        select: 'username profile bio'
                    },
                    {
                        path: 'post_id',
                        populate: [
                            {
                                path: 'product_id'
                            },
                            {
                                path: 'user_id',
                                select: 'username profile bio'
                            }
                        ]
                    }
                ])
            let post = await Models.Post.findOne({ _id: post_id })
            if (!send)
                return { message: EMessage.FAILE, data: null }
            send.post = post
            // console.log(`send: `, send);
            // emit send message
            // io.to(data.room_id).emit('chat_message', { sender: data.sender, data: send });
            return { message: SMessage.SUCCESS, data: send }
        } catch (error) {
            // console.log(`err: `, error);
            return { message: EMessage.FAILE, data: null }
        }
    }

    async getMessage(roomid) {
        try {
            const room_id = roomid;
            // let page = req.query.page || 1;
            // console.log(`room id: `, room_id);
            if (!room_id || !mongoose.Types.ObjectId.isValid(room_id))
                return { message: EMessage.FAILE, data: null }

            let messages = await Models.Message.find({
                room_id: room_id,
                isActive: true
            }).populate([
                {
                    path: 'room_id',
                    populate: {
                        path: 'users sender receiver',
                        select: 'username profile bio'
                    }
                },
                {
                    path: 'sender',
                    select: '_id username profile bio'
                },
                {
                    path: 'post_id',
                    populate: {
                        path: 'product_id'
                    }
                },
                {
                    path: 'order_id',
                    populate: {
                        path: 'post_id',
                        populate: {
                            path: 'product_id'
                        }
                    }
                }
            ]).sort({ createdAt: 'desc' }).limit(20)
            if (messages == '') return { message: EMessage.FAILE, data: null }
            messages = messages.map((value) => {
                if (!value.message)
                    return value
                value.message = deCryptMessage(value.message)
                return value
            })
            // io.to(room_id).emit('chat_message', { data: messages });
            return { message: SMessage.SUCCESS, data: messages }
        } catch (error) {
            return { message: EMessage.FAILE, data: null }
        }
    }
}

export default MessageController;