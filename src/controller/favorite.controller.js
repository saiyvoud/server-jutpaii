import Models from "../model/index.model.js";
import { SendE400, SendE500, SendS200, SendS201 } from "../services/response.js";
import { EMessage, SMessage } from "../services/message.js";
import mongoose from "mongoose";
import NotificationController from "./notification.controller.js";
import { io } from "../server.js";

/*
    14-12-2023
    favPost
    getAllmyFavoritesPost
    getAllFavoritesPostByUser
*/

class FavoriteController {

    static async bookMark(req, res) {
        try {
            const user_id = req.user._id;
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const chkFav = await Models.Favorite.findOneAndUpdate(
                { user_id, post_id, isActive: false },
                { $set: { isActive: true } },
                { new: true }
            ).populate(
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id',
                            select: 'name content price image description province district village',
                            populate: {
                                path: 'category_id'
                            }
                        },
                        {
                            path: 'user_id',
                            select: '_id username profile bio',
                            populate: {
                                path: 'address'
                            }
                        }
                    ]
                }
            );
            if (chkFav) {
                return SendS200(res, SMessage.SUCCESS, chkFav);
            }

            let data = {
                user_id,
                post_id,
                statusfavorite: true
            }
            const favorit = await (await Models.Favorite.create(data))
                .populate(
                    {
                        path: 'post_id',
                        populate: [
                            {
                                path: 'product_id',
                                select: 'name content price image description province district village',
                                populate: {
                                    path: 'category_id'
                                }
                            },
                            {
                                path: 'user_id',
                                select: '_id username profile bio',
                                populate: {
                                    path: 'address'
                                }
                            }
                        ]
                    }
                );

            return SendS201(res, SMessage.SUCCESS, favorit);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async unBookmark(req, res) {
        try {
            const user_id = req.user._id;
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const favorit = await Models.Favorite.findOneAndUpdate(
                {
                    user_id,
                    post_id,
                    isActive: true
                },
                {
                    $set: { isActive: false }
                },
                { new: true }
            );

            return SendS200(res, SMessage.SUCCESS, favorit);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async myBookmark(req, res) {
        try {
            const user_id = req.user._id;
            // if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
            //     return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const bookMark = await Models.Favorite.find(
                {
                    user_id,
                    isActive: true
                }
            ).populate(
                {
                    path: 'post_id',
                    populate: [
                        {
                            path: 'product_id',
                            select: 'name content price image description province district village',
                            populate: {
                                path: 'category_id'
                            }
                        },
                        {
                            path: 'user_id',
                            select: '_id username profile bio',
                            populate: {
                                path: 'address'
                            }
                        }
                    ]
                }
            );

            return SendS200(res, SMessage.SUCCESS, bookMark);
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    // static async unFavorite(req, res) {
    //     try {
    //         const user_id = req.user._id;
    //         const post_id = req.params.id;
    //         if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
    //             return SendE400(res, EMessage.INVALID_PARAMS + 'id');

    //         const unfavorit = await Models.Favorite.findOneAndUpdate(
    //             { user_id, post_id },
    //             { statusfavorite: false },
    //             { new: true }
    //         );

    //         return SendS200(res, SMessage.SUCCESS, unfavorit);
    //     } catch (error) {
    //         // console.log('error: ', error);
    //         return SendE500(res, EMessage.SERVER_ERROR, error);
    //     }
    // }

    static async getAllmyFavoritesPost(req, res) {
        try {
            const user_id = req.user._id;
            const myfav = await Models.Post.find({ favorites: { $elemMatch: { $eq: user_id } }, isActive: true })
                .populate([
                    {
                        path: 'product_id',
                        select: 'name content price image description province district village',
                        populate: {
                            path: 'category_id'
                        }
                    },
                    {
                        path: 'user_id',
                        select: '_id username profile bio',
                        populate: {
                            path: 'address'
                        }
                    }
                ]);
            return SendS200(res, SMessage.SUCCESS, myfav)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllFavoritesPostByUser(req, res) {
        try {
            const user_id = req.params.id;
            if (!user_id || !mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const myfav = await Models.Post.find({ favorites: { $elemMatch: { $eq: user_id } }, isActive: true })
                .populate([
                    {
                        path: 'product_id',
                        select: 'name content price image description province district village',
                        populate: {
                            path: 'category_id'
                        }
                    },
                    {
                        path: 'user_id',
                        select: '_id username profile bio',
                        populate: {
                            path: 'address'
                        }
                    }
                ]);
            return SendS200(res, SMessage.SUCCESS, myfav)
        } catch (error) {
            console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async favPost(req, res) {
        try {
            const user_id = req.user._id;
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const user = await Models.User.findById(user_id).select('_id username profile')
            // console.log('user id: ', user);

            const post = await Models.Post.findById(post_id).populate([
                {
                    path: 'product_id',
                    select: 'name content price image description',
                    populate: {
                        path: 'category_id'
                    }
                },
                {
                    path: 'user_id',
                    select: '_id username profile bio',
                    populate: {
                        path: 'address'
                    }
                },
                {
                    path: 'favorites',
                    select: '_id username profile bio',
                }
            ]);
            // console.log('post.user_id._id: ', post.user_id._id);

            const chckFav = await Models.Post.findOneAndUpdate(
                { _id: post_id, favorites: { $elemMatch: { $eq: user_id } }, isActive: true },
                { $pull: { favorites: user._id } },
                { new: true })
                .populate([
                    {
                        path: 'product_id',
                        select: 'name content price image description',
                        populate: {
                            path: 'category_id'
                        }
                    },
                    {
                        path: 'user_id',
                        select: '_id username profile bio',
                        populate: {
                            path: 'address'
                        }
                    },
                    {
                        path: 'favorites',
                        select: '_id username profile',
                    }
                ]);

            // console.log('=> ', chckFav);
            if (chckFav) {
                // const sendNoti = await new NotificationController().sendNotification('ບໍ່ຖືກໃຈໂພສ', '', { favorites: chckFav.toJSON(), user }, 'unlike', post.user_id._id);
                // // emit
                // io.to(post.user_id._id.toString()).emit('new_noti', { data: { favorites: chckFav, user } })
                // console.log("sendNoti: ", sendNoti);
                // await chckFav.updateOne({ $set: { isActive: false } })
                const notification = await Models.Notification.findOneAndUpdate(
                    {
                        user_id: post.user_id._id,
                        type: 'like',
                        "data.favorites._id": post._id
                    },
                    {
                        $set: {
                            isNewNoti: false,
                            isActive: chckFav.favorites.length <= 0 ? false : true,
                            data: {
                                favorites: chckFav.toJSON(),
                                user: chckFav.toJSON().favorites
                            }
                        }
                    },
                    { new: true }
                );

                // console.log('notification: ', notification);
                return SendS200(res, SMessage.SUCCESS, notification);
            }

            // console.log(chckFav);
            if (!chckFav) {
                const favoritPost = await Models.Post.findOneAndUpdate(
                    { _id: post_id },
                    { $push: { favorites: user_id } },
                    { new: true }
                ).populate([
                    {
                        path: 'product_id',
                        select: 'name content price image description province district village',
                        populate: {
                            path: 'category_id'
                        }
                    },
                    {
                        path: 'user_id',
                        select: '_id username profile bio',
                        populate: {
                            path: 'address'
                        }
                    },
                    {
                        path: 'favorites',
                        select: '_id username profile bio',
                    }
                ]);
                console.log(favoritPost);
                if (!favoritPost)
                    return SendE400(res, EMessage.FAILE + 'try again', '')

                const notification = await Models.Notification.findOneAndUpdate(
                    {
                        user_id: post.user_id._id,
                        type: 'like',
                        "data.favorites._id": post._id
                    },
                    {
                        $set: {
                            isNewNoti: true,
                            isActive: favoritPost.favorites.length <= 0 ? false : true,
                            data: {
                                favorites: favoritPost.toJSON(),
                                user: favoritPost.toJSON().favorites
                            }
                        }
                    },
                    { new: true }
                );
                let sendNoti = !notification ? null : notification.toJSON()
                if (!notification) {
                    sendNoti = await new NotificationController().sendNotification('ຖືກໃຈໂພສ', '', { favorites: favoritPost.toJSON(), user: favoritPost.favorites }, 'like', post.user_id._id);

                }
                // emit
                io.to(post.user_id._id.toString()).emit('new_noti', { data: { favorites: favoritPost, user: favoritPost.favorites } })
                console.log("sendNoti: ", sendNoti);

                return SendS201(res, SMessage.SUCCESS, { ...sendNoti });
                // return SendS201(res, SMessage.SUCCESS, post);

            }

            return SendS200(res, SMessage.SUCCESS, { Post: chckFav });
        } catch (error) {
            console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

}

export default FavoriteController;