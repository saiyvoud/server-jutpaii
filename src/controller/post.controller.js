import Models from "../model/index.model.js";
import { SendE400, SendE404, SendE500, SendS200, SendS200Post, SendS201 } from "../services/response.js";
import { EMessage, OrderStatus, SMessage } from "../services/message.js";
import { ValidateData } from "../services/validate.js";
import Cloudinary from "../services/util/uploadImage.js";
import mongoose from "mongoose";
import { shuffleArray } from "../services/services.js";
// import Product from "../model/product.model.js";


class PostController {
    static async createPost(req, res) {
        try {
            const user_id = req.user._id;
            let { category_id, content, price, currency, province, district, village } = req.body;
            const data = { category_id, content, price, currency, province, district, village };
            const validate = ValidateData(data);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const imgFiles = req.files || {}
            if (!imgFiles.file)
                return SendE400(res, EMessage.PLEASE_INPUT + 'file', EMessage.INVALID_PARAMS);

            const files = Array.isArray(req.files.file) ? [...imgFiles.file] : [req.files.file];
            console.log(files);


            const imagurl = []
            // console.log(files.file.length);
            const Cloud = new Cloudinary();
            for (const file of files) {
                const img = file.data.toString('base64')
                const imgName = file.name.split(".")[0]
                const url = await Cloud.uploadImage(img, imgName);
                imagurl.push(url)
            }
            // return SendS201(res, SMessage.SUCCESS,  imagurl);

            // if (files.file.length > 0) {

            //     for (let file of files.file) {

            //     }
            // } else if (files) {
            //     const Cloud = new Cloudinary();
            //     const img = files.file.data.toString('base64')
            //     const imgName = files.file.name.split(".")[0]
            //     const url = await Cloud.uploadImage(img, imgName);
            //     imagurl.push(url)
            // }

            // console.log(imagurl || null);
            const Dataproduct = {
                user_id,
                category_id,
                content,
                price,
                image: imagurl
            }
            const product = await Models.Product.create(Dataproduct);
            const post = await (await Models.Post.create({
                product_id: product._id,
                user_id,
                currency,
                province,
                district,
                village
            })).populate('product_id');
            if (!post)
                return SendE400(res, EMessage.FAILE, '')
            const posts = await Models.Post.find({ isSale: false, isActive: true })
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
                ]).sort({ createdAt: 'desc' }).limit(20);
            // console.log(post)
            return SendS201(res, SMessage.SUCCESS, posts);
        } catch (error) {
            console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async postProduct(req, res) {
        try {
            const user_id = req.user._id;
            let product_id = req.params.id;
            const validate = ValidateData({ product_id, user_id });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);
            if (!(mongoose.Types.ObjectId.isValid(product_id) || mongoose.Types.ObjectId.isValid(user_id)))
                return SendE400(res, EMessage.INVALID_PARAMS);

            const datapost = {
                product_id,
                user_id
            }
            const post = await (await Models.Post.create(datapost)).populate('product_id')
            return SendS201(res, SMessage.SUCCESS, post)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async deletePost(req, res) {
        try {
            const user_id = req.user._id;
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS);
            const delpost = await Models.Post.findOneAndUpdate(
                { _id: post_id, user_id: user_id },
                { isActive: false },
                { new: true }
            )
            // console.log(delpost)
            if (!delpost)
                return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllPostLimit(req, res) {
        try {
            const page = parseInt(req.query.page) || 0
            const posts = await Models.Post.find({ isSale: false, isActive: true })
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
                    }
                ]).sort({ createdAt: 'desc' }).skip(page * 20).limit(20);
            // console.log(posts);
            const count = await Models.Post.count();
            if (posts == '')
                return SendE400(res, SMessage.DONTHAVE, '');

            const sufflePost = shuffleArray(posts)
            // console.log(sufflePost);
            return SendS200Post(res, SMessage.SUCCESS, page, count, sufflePost)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllPost(req, res) {
        try {
            const { page = 0, limit = 20 } = req.query;
            const _page = parseInt(page) >= 0 ? parseInt(page) : 1;
            const _limit = parseInt(limit) > 0 ? parseInt(limit) : 20;
            const posts = await Models.Post.find({ isSale: false, isActive: true })
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
                ]).sort({ createdAt: 'desc' }).skip(_page * _limit).limit(_limit);
            const count = await Models.Post.count();
            if (posts == '')
                return SendE400(res, SMessage.DONTHAVE, '');

            const sufflePost = shuffleArray(posts)
            return SendS200Post(res, SMessage.SUCCESS, null, count, sufflePost)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllMyPost(req, res) {
        try {
            const user_id = req.user._id;
            const page = parseInt(req.query.page) || 0
            const posts = await Models.Post.find(
                { user_id, isActive: true }
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
                }
            ]).sort({ createdAt: 'desc' }).skip(page * 20).limit(20)

            if (posts == '')
                return SendE400(res, SMessage.DONTHAVE, '');

            return SendS200(res, SMessage.SUCCESS, posts)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllPostByUser(req, res) {
        try {
            const user_id = req.params.id;
            const page = parseInt(req.query.page) || 0
            const posts = await Models.Post.find(
                { user_id, isActive: true, isSale: false }
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
                }
            ]).sort({ createdAt: 'desc' }).skip(page * 20).limit(20)
            const count = await Models.Post.find(
                { user_id, isActive: true }).count()
            if (posts == '') {
                const user = Models.User.findById({ _id: user_id }).select('_id username profile bio').populate('address')
                return SendS200(res, 'user don\'t have post', { user: user, posts });
            }

            return SendS200Post(res, SMessage.SUCCESS, page, count, posts)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getOnePost(req, res) {
        try {
            const post_id = req.params.id;
            if (!post_id || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS);

            const post = await Models.Post.findOne({ _id: post_id })
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
            if (!post)
                return SendE400(res, EMessage.NOT_FOUND);

            return SendS200(res, SMessage.SUCCESS, post)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async getAllPostByCategory(req, res) {
        try {
            const categ_name = req.params.name
            const page = parseInt(req.query.page) || 0
            if (!categ_name)
                return SendE400(res, EMessage.INVALID_PARAMS + 'category_name')

            // let categ = await Models.Category.findOne({ title: categ_name })
            let categ = await Models.Category.findOne({ title: { $regex: new RegExp(categ_name, 'i') }, isActive: true })
            // console.log(categ);

            if (!categ)
                return SendE404(res, EMessage.NOT_FOUND + 'categorty name')
            let categ_id = categ._id
            const products = await Models.Product.find({ category_id: categ_id, isActive: true }).select('_id');
            const prod_ids = products.map(product => product._id)
            const posts = await Models.Post.find({ product_id: { $in: prod_ids }, isSale: false, isActive: true })
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
                ]).sort({ createdAt: 'desc' }).skip(page * 20).limit(20);
            const count = await Models.Post.find({ product_id: { $in: prod_ids }, isActive: true }).count()
            if (posts == '')
                return SendE404(res, SMessage.DONTHAVE, 'out of page');
            const sufflePost = shuffleArray(posts)

            return SendS200Post(res, SMessage.SUCCESS, page, count, sufflePost)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updateExchangeRate(req, res) {
        try {
            let post_id = req.params.id;
            let { exchangeRate } = req.body;
            if (!exchangeRate || !mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.PLEASE_INPUT + 'id');
            exchangeRate = parseInt(exchangeRate)
            console.log(exchangeRate);
            let updateEc = await Models.Post.updateOne(
                { _id: post_id },
                { exchangeRate: exchangeRate },
                { new: true }
            )
            if (!updateEc)
                return SendE400(res, EMessage.FAILE, updateEc)
            // console.log(updateEc);
            return SendS200(res, SMessage.SUCCESS)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updatePost(req, res) {
        try {
            let post_id = req.params.id;
            let { category_id, content, price, image, province, district, village } = req.body;
            let validate = ValidateData({ category_id, content, price, province, district, village })
            if (validate.length > 1)
                return SendE400(res, EMessage.INVALID_PARAMS + validate.join(","))
            if (!mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')

            const files = req.files || null
            const imagurl = []

            if (files.file.length > 0) {
                const Cloud = new Cloudinary();
                for (let file of files.file) {
                    const img = file.data.toString('base64')
                    const imgName = file.name.split(".")[0]
                    const url = await Cloud.uploadImage(img, imgName);
                    imagurl.push(url)
                }
            } else if (files) {
                const Cloud = new Cloudinary();
                const img = files.file.data.toString('base64')
                const imgName = files.file.name.split(".")[0]
                const url = await Cloud.uploadImage(img, imgName);
                imagurl.push(url)
            }

            let post = await Models.Post.findOne({ _id: post_id });
            if (!post) return SendE404(res, EMessage.NOT_FOUND)
            let updateProduct = await Models.Product.updateOne(
                { _id: post.product_id },
                {
                    category_id,
                    content,
                    price,
                    image: imagurl.concat(image),
                    province,
                    district,
                    village
                },
                { new: true }
            )
            if (!updateProduct) return SendE400(res, EMessage.FAILE)

            let postUpdate = await Models.Post.findOne({ _id: post_id })
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
            return SendS200(res, SMessage.SUCCESS, postUpdate)
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updateImagePost(req, res) {
        try {

            return SendS200(res, SMessage.SUCCESS, '')
        } catch (error) {
            // console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async updatePostStatusSale(req, res) {
        try {
            // const user_id = req.user._id;
            // const user_id = req.user._id;
            const post_id = req.params.id;
            const status = req.query.isSale;

            if (!status || (status < 0 || status > 1))
                return SendE400(res, EMessage.INVALID_PARAMS + ' isSale', '')
            // console.log(post_id);
            if (!mongoose.Types.ObjectId.isValid(post_id))
                return SendE400(res, EMessage.INVALID_PARAMS + ' id', '')
            const isSale = parseInt(status);
            if (isNaN(isSale))
                return SendE400(res, EMessage.INVALID_PARAMS + ' isSale', '')

            let upPostStatus = '';
            let resData = '';
            if (isSale == 1) {
                const { name, phoneNumber, province, distict, village, express, type_payment } = req.body;
                // console.log(`orderdetail: `, post_id);

                const validate = ValidateData({ post_id, name, phoneNumber, type_payment });
                if (validate.length > 0)
                    return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

                const post = await Models.Post.findOne({ _id: post_id, isActive: true, isSale: false })
                if (!post)
                    return SendE404(res, EMessage.NOT_FOUND + ' or ' + EMessage.POSTARESSOLD, null);

                let address = {
                    province,
                    distict,
                    village
                }

                const data = {
                    // buyer: user_id,
                    post_id,
                    name,
                    phoneNumber,
                    address,
                    express,
                    type_payment,
                    seller: post.user_id
                }

                let newOrder = await Models.Order.create(data);
                newOrder = await newOrder.populate([
                    {
                        path: 'post_id',
                        poplate: [
                            {
                                path: 'product_id'
                            },
                            {
                                path: 'user_id',
                                select: 'username profile bio'
                            }
                        ]
                    },
                    {
                        path: 'buyer seller',
                        select: 'username profile'
                    }
                ]);

                upPostStatus = await Models.Post.findOneAndUpdate(
                    { _id: post_id },
                    { isSale: true },
                    { new: true }
                ).populate([
                    {
                        path: 'product_id',
                        select: 'name content price image description',
                        populate: {
                            path: 'category_id',
                            // select: '_id title'
                        }
                    },
                    {
                        path: 'user_id',
                        select: '_id username profile bio',
                        populate: {
                            path: 'address',
                            select: '_id village district province'
                        }
                    }
                ]);
                resData = { newOrder, upPostStatus };
            } else if (isSale == 0) {
                const orderCancel = await Models.Order.findOneAndUpdate(
                    { post_id },
                    { isActive: false, status: OrderStatus.Cancel },
                    { new: true }
                );

                upPostStatus = await Models.Post.findOneAndUpdate(
                    { _id: post_id },
                    { isSale: false },
                    { new: true }
                ).populate([
                    {
                        path: 'product_id',
                        select: 'name content price image description',
                        populate: {
                            path: 'category_id',
                            // select: '_id title'
                        }
                    },
                    {
                        path: 'user_id',
                        select: '_id username profile bio',
                        populate: {
                            path: 'address',
                            select: '_id village district province'
                        }
                    }
                ]);

                resData = { orderCancel, upPostStatus };
            } else {
                return SendE400(res, SMessage.FAILE, '')
            }
            if (!upPostStatus)
                return SendE400(res, EMessage.NOT_FOUND, '')
            return SendS200(res, SMessage.SUCCESS, resData)
        } catch (error) {
            console.log('error: ', error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }
}

export default PostController;