
import cloudinary from 'cloudinary';
import {CLOUDINARY_NAME,
        CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET} from "./golblaKey.js"

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary