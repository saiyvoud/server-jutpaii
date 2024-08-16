import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	user_id: {
		type: mongoose.Types.ObjectId,
		ref: 'user',
		required: true
	},
	text: {
		type: String,
		default: ''
	},
	isNewNoti: {
		type: Boolean,
		default: true
	},
	isActive: {
		type: Boolean,
		default: true
	},
	data: {
		type: Object,
		default: null
	},
	type: {
		type: String,
		default: ''
	}
},{
	timestamps: true
})

const Notification = mongoose.model('notification', notificationSchema)
export default Notification;