import Models from "../model/index.model.js";
import { SMessage, EMessage, TypeSearch } from "../services/message.js";
import { SendE400, SendE500, SendS200 } from "../services/response.js";
import { shuffleArray } from "../services/services.js";

class SearchController {

	static async search(req, res) {
		try {
			// console.log(req.query);
			const { type, query } = req.query;
			// console.log(type);
			let searchResult = [];
			if (!type || !query) {
				const postArr = await Models.Post.find({ isActive: true, isSale: false })
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
					]).sort({ createdAt: 'desc' }).limit(6);
				searchResult = shuffleArray(postArr);
			}
			// return SendE400(res, EMessage.INVALID_PARAMS + 'type, query')
			if (type == TypeSearch.post) {
				const product = await Models.Product.find({ content: { $regex: new RegExp(query, 'i') }, isActive: true });
				const _productid = product.map((value) => {
					return value._id
				})
				// console.log(_productid);
				const postArr = await Models.Post.find({ product_id: { $in: _productid }, isActive: true })
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
					]).sort({ createdAt: 'desc' });
				searchResult = shuffleArray(postArr)
			}

			if (type == TypeSearch.category) {
				// searchResult
				const cateArr = await Models.Category.find({ title: { $regex: new RegExp(query, 'i') } });
				const categ_idArr = cateArr.map(cate => cate._id);
				const productArr = await Models.Product.find({ category_id: { $in: categ_idArr } });
				const product_idArr = productArr.map(product => product._id);
				const postArr = await Models.Post.find({ product_id: { $in: product_idArr }, isActive: true }).populate([
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
				]).sort({ createdAt: 'desc' });
				searchResult = shuffleArray(postArr);
			}

			if (type == TypeSearch.user) {
				const userArr = await Models.User.find({ username: { $regex: new RegExp(query, 'i') } }).select('_id username profile');
				const useridArr = userArr.map(user => user._id);
				const postArr = await Models.Post.find({ user_id: { $in: useridArr }, isActive: true }).populate([
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
				]).sort({ createdAt: 'desc' });
				// if()
				searchResult = shuffleArray(postArr);
			}

			if (searchResult.length == 0) {
				// const postArr = await Models.Post.find({ isSale: false, isActive: true })
				// 	.populate([
				// 		{
				// 			path: 'product_id',
				// 			select: 'name content price image description',
				// 			populate: {
				// 				path: 'category_id'
				// 			}
				// 		},
				// 		{
				// 			path: 'user_id',
				// 			select: '_id username profile',
				// 			populate: {
				// 				path: 'address'
				// 			}
				// 		}
				// 	]).sort({ createdAt: 'desc' })
				// searchResult = shuffleArray(postArr)
				return SendS200(res, SMessage.SUCCESS, searchResult)
			}

			return SendS200(res, SMessage.SUCCESS, searchResult)
		} catch (error) {
			return SendE500(res, EMessage.SERVER_ERROR, error)
		}
	}


	static async searchChatRoom(req, res) {
		try {
			const user_id = req.user._id;
			const { query } = req.query;
			let searchResult;
			if (!query)
				return SendE400(res, EMessage.INVALID_PARAMS + ' query', '')
			const myroomArr = await Models.Room.find({
				users: { $elemMatch: { $eq: user_id } }
			}).populate({
				path: 'users sender receiver',
				select: '_id username profile'
			});


			const searchUsername = (roomArr, regex) => {
				const searchResult = [];
				for (let room of roomArr) {
					room.users.map(user => {
						if (user._id.toString() != user_id.toString()) {
							if (user.username && regex.test(user.username)) {
								searchResult.push(room)
							}
							return
						}
					})
				}
				return searchResult
			}
			const regex = new RegExp(query, 'i');
			searchResult = searchUsername(myroomArr, regex);
			if (searchResult.length == 0) {
				return SendS200(res, SMessage.SUCCESS, null)
			}
			// console.log(searchResult);
			return SendS200(res, SMessage.SUCCESS, searchResult)
		} catch (error) {
			// console.log('err: ', error);
			return SendE500(res, EMessage.SERVER_ERROR, error)
		}
	}
}

export default SearchController;