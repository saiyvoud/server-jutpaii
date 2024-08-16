import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
	username: {
		type: String,
		required: false
	},
	phoneNumber:{
		type: String,
		required: false
	},
	profile: {
		type: String,
		default: ''
	},
	password: {
		type: String,
		required: true
	},
	role:{
		type: String,
		required: 'admin'
	},
	isActive: {
		type: Boolean,
		default: true
	},
	login_verssion: {
		type: Number,
		default: 1
	}
},
{
	timestamps: true
});

const AdminModel = mongoose.model('admin', adminSchema);
export default AdminModel;