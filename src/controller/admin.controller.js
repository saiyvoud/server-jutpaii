import Models from "../model/index.model.js";
import { SMessage, EMessage } from "../services/message.js";
import { SendE500, SendE400, SendS200 } from "../services/response.js";
import { ComparePassword, SignToken, SignRefreshToken, PasswordHash } from "../services/services.js";
import { ValidateData } from "../services/validate.js";

class AdminController {
	static async signAdmin(req, res) {
		try {
			let { username, phoneNumber, password } = req.body;
			let data = { username, phoneNumber, password }

			const validate = ValidateData(data);
			if (validate.length > 0) {
				return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","));
			}

			const _pasword = await PasswordHash(password);
			const admin = await Models.AdminModel.create({ username, phoneNumber, password: _pasword });
			if (!admin)
				return SendE400(res, EMessage.FAILE, '')

			let playload = {
				id: admin.id,
				role: admin.role,
				login_version: admin.login_verssion,
			}

			const token = await SignToken(playload);
			const refreshToken = await SignRefreshToken(playload)

			const adminData = {
				_id: admin._id,
				username: admin.username,
				phoneNumber: admin.phoneNumber,
				profile: admin.profile,
				role: admin.role,
				createdAt: admin.createdAt,
				updatedAt: admin.updatedAt,
				token,
				refreshToken,

			}
			return SendS200(res, SMessage.SUCCESS, adminData)
		} catch (error) {
			console.log(`err: `, error);
			return SendE500(res, EMessage.SERVER_ERROR, error)
		}
	}
	static async login(req, res) {
		try {
			let { username, password } = req.body;
			let data = { username, password }

			const validate = ValidateData(data);
			if (validate.length > 0) {
				return SendE400(res, EMessage.PLEASE_INPUT + validate.join(","));
			}

			const admin = await Models.AdminModel.findOne({ username });
			if (!admin)
				return SendE400(res, 'invalid username', '')

			const isMatch = await ComparePassword(admin, password)
			if(!isMatch)
				return SendE400(res, 'invalid password', '')

			let playload = {
				id: admin.id,
				role: admin.role,
				login_version: admin.login_verssion,
			}

			const token = await SignToken(playload);
			const refreshToken = await SignRefreshToken(playload)

			const adminData = {
				_id: admin._id,
				username: admin.username,
				phoneNumber: admin.phoneNumber,
				profile: admin.profile,
				role: admin.role,
				createdAt: admin.createdAt,
				updatedAt: admin.updatedAt,
				token,
				refreshToken,

			}
			return SendS200(res, SMessage.SUCCESS, adminData)
		} catch (error) {
			console.log(`err: `, error);
			return SendE500(res, EMessage.SERVER_ERROR, error)
		}
	}

}

export default AdminController;