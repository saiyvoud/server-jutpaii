
import cloudinary from "../../config/cloudinary.js";

class Cloudinary {
    constructor() { }

    uploadImage = (image, imgName) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                // console.log(`file: `, path)
                const cloudinaryUpload = await cloudinary.v2.uploader.upload("data:image/png;base64," + image, {
                    public_id: imgName + `-${Date.now()}`,
                    resource_type: "auto",
                })
                // .uploader.upload(image);
                if (!cloudinaryUpload) {
                    return reject(false)
                }

                // console.log(`upload: `, url)
                return resolve(cloudinaryUpload.url)
            } catch (error) {
                console.log(`error: `, error)
                reject(error)
            }
        })
    }
}


export default Cloudinary;