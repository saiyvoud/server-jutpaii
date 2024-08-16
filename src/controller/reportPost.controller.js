import Models from "../model/index.model.js";
import { SendE400, SendE500, SendS200, SendS201 } from "../services/response.js";
import { EMessage, SMessage } from "../services/message.js";
import { ValidateData } from "../services/validate.js";
import mongoose from "mongoose";



/*
    14-12-2023
    edit{
        report,
        getReportByPost,
        getAllPostReport,
        deleteReport
    }
*/

class ReportPostController {

    static async report(req, res) {
        try {
            const user_id = req.user._id;
            const { post_id, description } = req.body;
            const post = await Models.Post.findById(post_id);
            if (!post)
                return SendE400(res, EMessage.NOT_FOUND + 'post', null)
            const validate = ValidateData({ post_id, description });
            if (validate.length > 0)
                return SendE400(res, EMessage.INVALID_PARAMS + validate.join(','));
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS);

            // const chckReport = await Models.ReportPost.findOne(
            //     {post_id, isActive: true, report: { $elemMatch: { $eq: user_id }}
            // )

            const reportData = {
                post_id,
                report: {
                    user_id: user_id,
                    description: description
                }
            }
            const reported = await Models.ReportPost.findOneAndUpdate(
                { post_id },
                { $push: { report: reportData.report } },
                { new: true }
            ).populate([
                {
                    path: 'post_id',
                    poplate: [
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
                        }
                    ]

                },

            ]);

            if (!reported) {
                const createdReport = (await Models.ReportPost.create(reportData))
                    .populate([
                        {
                            path: 'post_id',
                            poplate: [
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
                                }
                            ]

                        },

                    ]);
                return SendS201(res, SMessage.SUCCESS, createdReport);
            }

            return SendS200(res, SMessage.SUCCESS, reported);
        } catch (error) {
            console.log(`err: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getReportByPost(req, res) {
        try {
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');

            const reportByPost = await Models.ReportPost.findOne({
                post_id, isActive: true
            }).populate([
                {
                    path: 'post_id',
                    populate: [
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
                        }
                    ]

                },
                {
                    path: 'report.user_id',
                    select: '_id username profile'
                }

            ]);

            return SendS200(res, SMessage.SUCCESS, reportByPost);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllPostReport(req, res) {
        try {
            const postHaveReport = await Models.ReportPost.find(
                { isActive: true }
            ).populate([
                {
                    path: 'post_id',
                    populate: [
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
                        }
                    ]

                },
                {
                    path: 'report.user_id',
                    select: '_id username profile bio'
                }

            ]);
            if (postHaveReport == '') return SendE400(res, SMessage.DONTHAVE, '');

            return SendS200(res, SMessage.SUCCESS, postHaveReport);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
    static async getAllPostReportByUser(req, res) {
        try {
            const user_id = req.params.id;
            if (!user_id || !mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'user id', '')
            const postHaveReport = await Models.ReportPost.find(
                { isActive: true }
            ).populate([
                {
                    path: 'post_id',
                    poplate:
                    {
                        path: 'product_id',
                        select: 'name content price image description',
                        populate: {
                            path: 'category_id'
                        }
                    }
                    // {
                    //     path: 'user_id',
                    //     select: '_id username profile',
                    //     populate: {
                    //         path: 'address'
                    //     }
                    // }

                },
                {
                    path: 'report.user_id',
                    select: '_id username profile bio'
                }
            ]);
            if (postHaveReport == '') return SendE400(res, SMessage.DONTHAVE, '');
            return SendS200(res, SMessage.SUCCESS, postHaveReport);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async deleteReport(req, res) {
        try {
            const report_id = req.params.id;
            if (!report_id || !mongoose.Types.ObjectId.isValid(report_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const delReport = await Models.ReportPost.findOneAndUpdate(
                { _id: report_id },
                { isActive: false },
                { new: true }
            )
            return SendS200(res, SMessage.SUCCESS, delReport);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
}

export default ReportPostController;