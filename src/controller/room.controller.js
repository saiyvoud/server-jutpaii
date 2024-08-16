
import mongoose from "mongoose";
import Models from "../model/index.model.js";
import { SMessage, EMessage } from "../services/message.js";
import { SendE404, SendE500, SendE400, SendS201, SendS200 } from "../services/response.js";
import { ValidateData } from "../services/validate.js";
import { io } from "../server.js";
// import { enCryptMessage } from "../services/services.js";
// import MessageController from "./message.controller.js";
// import NotificationController from "./notification.controller.js";


class RoomController {

    static async createRoom(req, res) {
        try {
            // console.log('create room');
            const user_id = req.user._id;
            const { user2_id } = req.body;
            const validate = ValidateData({ user2_id });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS)
            const user2 = await Models.User.findOne({ _id: user2_id })
            if (!user2)
                return SendE404(res, EMessage.NOT_FOUND + ' user2 id')
            const obid1 = new mongoose.Types.ObjectId(user_id);
            const obid2 = new mongoose.Types.ObjectId(user2_id);
            // const _post_id = new mongoose.Types.ObjectId(post_id);
            // const post = await Models.Post.findById(_post_id);
            // if (!post)
            //     return SendE404(res, EMessage.NOT_FOUND, EMessage.NOT_FOUND + 'post')
            const chkex = await Models.Room.findOne(
                {
                    users: {
                        $all: [
                            obid1, obid2
                        ]
                    },
                    isActive: true
                }
            ).populate({
                path: 'users sender receiver',
                select: '_id username profile'
            })
            if (chkex) {
                // let sendPost = await new MessageController().sendPost(chkex._id, _post_id, obid1)
                // // console.log(sendPost);
                // if (sendPost.message != SMessage.SUCCESS) {
                //     return SendE400(res, sendPost.message)
                // }
                // console.log(`send: `, sendPost);
                return SendS200(res, SMessage.SUCCESS, chkex)
            }
            let data = {
                users: [obid1, obid2],
                sender: user_id,
                receiver: user2_id,
                last_message: null
            }
            const room = await (await Models.Room.create(data))
                .populate(
                    {
                        path: 'users sender receiver',
                        select: '_id username profile'
                    }
                );
            // const messageData = {
            //     room_id: room._id,
            //     message: enCryptMessage("ສະບາຍດີ"),
            //     sender: user2_id
            // }
            // let firstMessage = 
            // await Models.Message.create(messageData)
            // let sendPost = await new MessageController().sendPost(room._id, post_id, obid1);
            // if (sendPost.message != SMessage.SUCCESS) {
            //     return SendE400(res, sendPost.message)
            // }
            // const Notification = new NotificationController();
            // const sendNoti = await Notification.sendNotification('ມີແຊັດໃຫມ່', '', { room_id: room.toJSON(), message: "ສະບາບດີ" }, TypeNoti.newRoom, user2._id)
            // if (sendNoti.message != SMessage.SUCCESS)
            // console.log('send notification failed');
            // console.log(`send: `, sendPost);
            // socket create room
            io.to(user2_id).emit("create_room", { data: { room_id: room.toJSON() } })
            return SendS201(res, SMessage.SUCCESS, { room });
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getOneRoom(req, res) {
        try {
            const user_id = req.user._id;
            const room_id = req.params.room_id;
            // console.log(`room id: `, room_id)
            if (!room_id || !mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const room = await Models.Room.findOne({
                _id: room_id
            }).populate({
                path: 'users sender receiver',
                select: '_id username profile'
            });

            const newMessagew = await Models.Message.countDocuments({
                room_id: room_id,
                sender: { $ne: user_id },
                isReaded: false
            })

            if (!room) return SendE404(res, EMessage.NOT_FOUND);

            const returnData = {
                ...room.toObject(),
                newMessage: newMessagew
            }
            return SendS200(res, SMessage.SUCCESS, returnData)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllMyRoom(req, res) {
        try {
            const user_id = req.user._id;
            const myroom = await Models.Room.find({
                users: { $elemMatch: { $eq: user_id } }
            }).populate({
                path: 'users sender receiver',
                select: '_id username profile'
            });
            if (myroom == '') return SendE404(res, SMessage.DONTHAVE, '');

            const rooms = [];
            for (const room of myroom) {
                const newMessage = await Models.Message.countDocuments({
                    room_id: room._id,
                    sender: { $ne: user_id },
                    isReaded: false
                });
                const returnRoom = {
                    ...room.toObject(),
                    newMessage
                }
                rooms.push(returnRoom)
            }

            return SendS200(res, SMessage.SUCCESS, rooms)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async deleteRoom(req, res) {
        try {
            const user_id = req.user._id;
            const room_id = req.params.roomId;
            console.log(`room id: `, room_id)
            if (!room_id || !mongoose.Types.ObjectId.isValid(room_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const del = await Models.Room.updateOne(
                { sender: user_id },
                { isActive: false },
                { new: true }
            )

            return SendS200(res, SMessage.SUCCESS, del)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllRoom(req, res) {
        try {

            const rooms = await Models.Room.find({ isActive: true }
            ).populate({
                path: 'users sender receiver',
                select: '_id username profile createdAt'
            })
            if (rooms == '') return SendE404(res, SMessage.DONTHAVE, '');
            return SendS200(res, EMessage.SUCCESS, rooms)
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
}

export default RoomController;