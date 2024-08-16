import mongoose from "mongoose";
import { Role } from "../services/message.js";


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: false,
    default: ''
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  address:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address',
    require: true,
  },
  profile: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: Role.User,
  },
  device_token: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  login_verssion: {
    type: Number,
    default: 1
  },
  birthday: {
    type: Date,
    require: false
  },
  gender: {
    type: String,
    require: true,
  },
  bio: {
    type: String,
    default: '',
    required: false
  }
},
{
  timestamps: true
}
)

const User = mongoose.model('user', userSchema);

export default User;