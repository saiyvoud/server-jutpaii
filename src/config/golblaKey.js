/* eslint-disable no-undef */
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT
const DATABASE_URL_DEV = process.env.DATABASE_URL_DEV

const SALT = process.env.SALT
const SECRET_KEY = process.env.SECRET_KEY
const SECRET_KEY_PASS = process.env.SECRET_KEY_PASS
const SECRET_KEY_TOKEN = process.env.SECRET_KEY_TOKEN
const SECRET_KEY_REFRESHTOKEN = process.env.SECRET_KEY_REFRESHTOKEN
const EXPIRES_TOKEN = process.env.EXPIRES_TOKEN
const EXPIRES_REFRESHTOKEN = process.env.EXPIRES_REFRESHTOKEN

//------Cloudinay

const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET


const INTERATIONS = process.env.INTERATIONS
const KEYLEN = process.env.KEYLEN

const SACCOUNT_TYPE = process.env.SACCOUNT_TYPE
const SACCOUNT_PROJECT_ID = process.env.SACCOUNT_PROJECT_ID
const SACCOUNT_PRIVATE_KEY_ID = process.env.SACCOUNT_PRIVATE_KEY_ID
const SACCOUNT_PRIVATE_KEY = process.env.SACCOUNT_PRIVATE_KEY
const SACCOUNT_CLIENT_EMAIL = process.env.SACCOUNT_CLIENT_EMAIL
const SACCOUNT_CLIENT_ID = process.env.SACCOUNT_CLIENT_ID
const SACCOUNT_AUTH_URI = process.env.SACCOUNT_AUTH_URI
const SACCOUNT_TOKEN_URI = process.env.SACCOUNT_TOKEN_URI
const SACCOUNT_AUTH_PROVIDE = process.env.SACCOUNT_AUTH_PROVIDE
const SACCOUNT_CLIENT_X509 = process.env.SACCOUNT_CLIENT_X509
const SACCOUNT_USERNIVERSE_DOMAIN = process.env.SACCOUNT_USERNIVERSE_DOMAIN
const SECRET_KEY_MESSAGE = process.env.SECRET_KEY_MESSAGE

export {
    PORT,
    DATABASE_URL_DEV,
    SECRET_KEY,
    SALT,
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    INTERATIONS,
    KEYLEN,
    SECRET_KEY_PASS,
    SECRET_KEY_TOKEN,
    SECRET_KEY_REFRESHTOKEN,
    EXPIRES_TOKEN,
    EXPIRES_REFRESHTOKEN,

    SACCOUNT_TYPE,
    SACCOUNT_PRIVATE_KEY_ID,
    SACCOUNT_PRIVATE_KEY,
    SACCOUNT_CLIENT_EMAIL,
    SACCOUNT_CLIENT_ID,
    SACCOUNT_AUTH_URI,
    SACCOUNT_TOKEN_URI,
    SACCOUNT_AUTH_PROVIDE,
    SACCOUNT_CLIENT_X509,
    SACCOUNT_USERNIVERSE_DOMAIN,
    SACCOUNT_PROJECT_ID,

    SECRET_KEY_MESSAGE,
}