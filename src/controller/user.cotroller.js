import Models from "../model/index.model.js";
import { SMessage, EMessage, Role } from "../services/message.js";
import { SendE404, SendE500, SendE400, SendS201, SendS200 } from "../services/response.js";
import { ComparePassword, SignToken, SignRefreshToken, PasswordHash } from "../services/services.js";
import { ValidateData, attributeNameArr, hasAttribute } from "../services/validate.js";
import Cloudinary from "../services/util/uploadImage.js";
import mongoose from "mongoose";


class UserController {

    static async register(req, res) {
        try {
            let { username, gender, email, password,
                province, district, village, birthday } = req.body;
            let data = {
                username, gender, email, password,
                province, district, village, birthday
            }

            const validate = ValidateData(data);
            if (validate.length > 0) {
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","));
            }
            // check username
            const checkUser = await Models.User.findOne({ username });
            if (checkUser)
                return SendE400(res, EMessage.USERNAME_EXIST);
            // upload image
            const files = req.files || null
            // console.log(files);
            let imagurl = '';
            if (files) {
                const img = files.file.data.toString('base64')
                const imgName = files.file.name.split(".")[0]
                const Cloud = new Cloudinary();
                const url = await Cloud.uploadImage(img, imgName);
                imagurl = url
                // console.log(url)
            }

            // insert address
            const addrData = {
                province,
                district,
                village
            }
            const insertAddr = await Models.Address.create(addrData);

            password = await PasswordHash(password);
            const newUser = new Models.User({
                username,
                email,
                password,
                profile: imagurl || "",
                address: insertAddr._id,
                role: Role.User,
                birthday,
                gender
            });

            await newUser.save();
            const user = await newUser.populate('address');

            let playload = {
                id: user.id,
                role: user.role,
                login_version: user.login_verssion,
            }
            // console.log('playload: ', playload);

            const token = await SignToken(playload);
            const refreshToken = await SignRefreshToken(playload)

            const userData = {
                _id: user._id,
                username: user.username,
                gender: user.gender,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                birthday: user.birthday,
                profile: user.profile,
                role: user.role,
                bio: user.bio,
                address: user.address,
                login_version: user.login_verssion,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                token,
                refreshToken,

            }

            return SendS201(res, SMessage.SUCCESS, userData);
        } catch (error) {
            // console.log('error: ', error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async updateUser(req, res) {
        try {
            const user_id = req.user._id;
            const updateData = req.body;
            const hasAttUpdate = hasAttribute(updateData, attributeNameArr.userUpdate);
            if (!hasAttUpdate) {
                const _user = await Models.User.findOne({ _id: user_id }).select('-password').populate('address');
                const _userData = {
                    username: _user.username,
                    // phoneNumber: _user.phoneNumber,
                    email: _user.email,
                    birthday: _user.birthday,
                    address: _user.address,
                    profile: _user.profile,
                    bio: _user.bio,
                }
                return SendS200(res, SMessage.SUCCESS, _userData)
            }
            const validate = ValidateData(updateData);
            if (validate.length > 0) {
                for (const i of validate) {
                    delete updateData[i]
                }
            }

            if (updateData.username) {
                const checkUsernam = await Models.User.findOne({ username: updateData.username || '' })
                if (checkUsernam)
                    return SendE400(res, EMessage.USERNAME_EXIST, '');
            }
            // if (updateData.phoneNumber) {
            //     const checkUsernam = await Models.User.findOne({ phoneNumber: updateData.phoneNumber || '' })
            //     if (checkUsernam)
            //         return SendE400(res, EMessage.PHONE_EXIST, '');
            // }

            // delete updateData.email;
            // delete updateData.phoneNumber;

            const user = await Models.User.findOneAndUpdate(
                { _id: user_id },
                { $set: updateData },
                { new: true }
            ).populate('address')
            // const userData = {
            //     username: user.username,
            //     // phoneNumber: user.phoneNumber,
            //     email: user.email,
            //     birthday: user.birthday,
            //     address: user.address,
            //     profile: user.profile,
            //     bio: user.bio,
            // }
            let playload = {
                id: user.id,
                role: user.role,
                login_version: user.login_verssion,
            }
            // console.log('playload: ', playload);

            const token = await SignToken(playload);
            const refreshToken = await SignRefreshToken(playload)

            const userData = {
                _id: user._id,
                username: user.username,
                gender: user.gender,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                birthday: user.birthday,
                profile: user.profile,
                role: user.role,
                bio: user.bio,
                address: user.address,
                login_version: user.login_verssion,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                token,
                refreshToken,

            }

            return SendS200(res, SMessage.SUCCESS, userData);
        } catch (error) {
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async editBio(req, res) {
        try {
            const user_id = req.user._id;
            const { bio } = req.body;
            const validate = ValidateData({ bio });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const user = await Models.User.findOneAndUpdate(
                { _id: user_id },
                { $set: { bio: bio } },
                { new: true }
            ).populate(
                'address'
            )

            if (!user)
                return SendE404(res, EMessage.NOT_FOUND + ' user', null)
            const data = {
                username: user.username,
                gender: user.gender,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                address: user.address,
                birthday: user.birthday,
                profile: user.profile,
                role: user.role,
                bio: user.bio
            }
            return SendS200(res, SMessage.SUCCESS, data)
        } catch (error) {
            console.log(`err: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async loginWithUsername(req, res) {
        try {

            const { username, password } = req.body;
            const validate = ValidateData({ username, password });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            let user = await Models.User.findOne({ username: username })
                .populate(
                    'address'
                );
            // console.log(`user: `, user)
            if (!user)
                return SendE404(res, EMessage.NOT_FOUND);

            const isMatch = await ComparePassword(user, password);
            // console.log(isMatch)
            if (!isMatch)
                return SendE400(res, EMessage.PASSWORD_IN)

            let playload = {
                id: user.id,
                role: user.role,
                login_version: user.login_verssion,
            }

            const token = await SignToken(playload);
            const refreshToken = await SignRefreshToken(playload)
            const userData = {
                _id: user._id,
                username: user.username,
                gender: user.gender,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                birthday: user.birthday,
                profile: user.profile,
                address: user.address,
                role: user.role,
                login_version: user.login_verssion,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                token,
                refreshToken
            }
            return SendS200(res, SMessage.SUCCESS, userData);

        } catch (error) {
            // console.log(error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async loginWithEmail(req, res) {
        try {
            const { email, password } = req.body;
            const validate = ValidateData({ email, password });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            let user = await Models.User.findOne({ email: email })
                .populate(
                    'address'
                );
            // console.log(`user: `, user)
            if (!user)
                return SendE404(res, EMessage.NOT_FOUND);

            const isMatch = await ComparePassword(user, password);
            // console.log(isMatch)
            if (!isMatch)
                return SendE400(res, EMessage.PASSWORD_IN)

            let playload = {
                id: user.id,
                role: user.role,
                login_version: user.login_verssion,
            }

            const token = await SignToken(playload);
            const refreshToken = await SignRefreshToken(playload)
            const userData = {
                _id: user._id,
                username: user.username,
                gender: user.gender,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                birthday: user.birthday,
                profile: user.profile,
                address: user.address,
                role: user.role,
                login_version: user.login_verssion,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                token,
                refreshToken
            }
            return SendS200(res, SMessage.SUCCESS, userData);
        } catch (error) {
            // console.log(error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async userInfo(req, res) {
        try {
            const _id = req.user._id;
            const user = await Models.User.findOne({ _id: _id })
                .populate(
                    'address'
                )
            const data = {
                username: user.username,
                gender: user.gender,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                address: user.address,
                birthday: user.birthday,
                profile: user.profile,
                role: user.role,
                bio: user.bio
            }
            return SendS200(res, SMessage.SUCCESS, data)
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async editPassword(req, res) {
        try {
            const user_id = req.user._id;
            let { oldPassword, newPassword } = req.body;
            const validate = ValidateData({ oldPassword, newPassword });
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const user = await Models.User.findOne({ _id: user_id });
            if (!user)
                return SendE404(res, EMessage.NOT_FOUND);
            const isMatch = await ComparePassword(user, oldPassword);
            if (!isMatch)
                return SendE400(res, EMessage.PASSWORD_IN, '');

            newPassword = await PasswordHash(newPassword);
            // console.log(newPassword);
            await Models.User.findOneAndUpdate(
                { _id: user_id },
                { $set: { password: newPassword } },
                { new: true }
            );
            return SendS200(res, SMessage.UPDATE, '')

        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async changePassword(req, res) {
        try {
            let { email, newPassword } = req.body;
            const data = { email, newPassword }
            const validate = ValidateData(data);
            if (validate.length > 0)
                return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","), EMessage.INVALID_PARAMS);

            const user = await Models.User.findOne({ email });
            // console.log(user)
            if (!user)
                return SendE404(res, EMessage.NOT_FOUND);

            let login_verssion = user.login_verssion + 1;

            newPassword = await PasswordHash(newPassword);

            await Models.User.findOneAndUpdate(
                { _id: user._id },
                {
                    login_verssion,
                    password: newPassword
                },
                { new: true }
            );
            return SendS200(res, SMessage.UPDATE)
        } catch (error) {
            // console.log(`error: `, error);
            return SendE500(res, EMessage.SERVER_ERROR, error);
        }
    }

    static async editProfile(req, res) {
        try {
            const _id = req.user._id;
            const files = req.files || null
            let imagurl = ''
            if (files) {
                const img = files.file.data.toString('base64')
                const imgName = files.file.name.split(".")[0]
                const Cloud = new Cloudinary();
                const url = await Cloud.uploadImage(img, imgName);
                imagurl = url
            }
            await Models.User.findOneAndUpdate(_id,
                { profile: imagurl },
                { new: true }
            )
            const user = await Models.User.findOne({ _id: _id })
                .populate(
                    'address'
                )
            const data = {
                username: user.username,
                // phoneNumber: user.phoneNumber,
                email: user.email,
                address: user.address,
                profile: user.profile,
                bio: user.bio,
            }

            return SendS200(res, SMessage.SUCCESS, data);
        } catch (error) {
            // console.log('error: ', error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getOneUser(req, res) {
        try {
            const user_id = req.params.userid;
            if (!user_id || !mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id')
            const users = await Models.User.findOne({ _id: user_id, isActive: true })
                .select('-password -role -device_token -login_verssion')
                .populate('address');
            if (!users)
                return SendE404(res, EMessage.FAILE)

            return SendS200(res, SMessage.SUCCESS, users);
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
    static async getAllUser(req, res) {
        try {
            const users = await Models.User.find({ isActive: true }).select('-password')
                .populate({
                    path: 'address'
                });
            if (!users)
                return SendE404(res, EMessage.FAILE)

            return SendS200(res, SMessage.SUCCESS, users);
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async deleteUser(req, res) {
        try {
            const user_id = req.params.userid;
            if (!user_id || !mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const checkAd = await Models.User.findOneAndUpdate(
                { _id: user_id },
                { isActive: false },
                { new: true }
            ).select('-password')
            if (!checkAd)
                return SendE404(res, EMessage.FAILE)

            return SendS200(res, SMessage.SUCCESS, checkAd);
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async insertAdmin(req, res) {
        try {
            const user_id = req.params.userid;
            if (!user_id || !mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const checkAd = await Models.User.findOneAndUpdate(
                { _id: user_id },
                { role: Role.Admin },
                { new: true }
            ).select('-password')
            if (!checkAd)
                return SendE404(res, EMessage.FAILE)

            return SendS200(res, SMessage.SUCCESS, checkAd);
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async getAllAdmin(req, res) {
        try {
            const admin = await Models.User.find(
                { role: Role.Admin, isActive: true }
            ).select('-password').populate('address')
            if (!admin)
                return SendE404(res, EMessage.FAILE)

            return SendS200(res, SMessage.SUCCESS, admin);
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async downGradeAdmin(req, res) {
        try {
            const user_id = req.params.userid;
            if (!user_id || !mongoose.Types.ObjectId.isValid(user_id))
                return SendE400(res, EMessage.INVALID_PARAMS + 'id');
            const checkAd = await Models.User.findOneAndUpdate(
                { _id: user_id },
                { role: Role.User },
                { new: true }
            )
            if (!checkAd)
                return SendE404(res, EMessage.FAILE)

            return SendS200(res, SMessage.SUCCESS, checkAd);
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }

    static async countUser(req, res) {
        try {
            const usercount = await Models.User.count({ role: Role.User })
            return SendS200(res, SMessage.SUCCESS, usercount)
        } catch (error) {
            // console.log(`error: `, error)
            return SendE500(res, EMessage.SERVER_ERROR, error)
        }
    }
}

export default UserController;