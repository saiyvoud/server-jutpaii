import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { SECRET_KEY, SECRET_KEY_PASS, SECRET_KEY_TOKEN, SECRET_KEY_REFRESHTOKEN, EXPIRES_TOKEN, EXPIRES_REFRESHTOKEN, SECRET_KEY_MESSAGE } from "../config/golblaKey.js";
import { EMessage, SMessage } from "./message.js";

export const Endcrypt = (data) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const hash = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
            resolve(hash)
        } catch (error) {
            reject(error)
        }
    })
}

export const Decrypt = (hash) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = CryptoJS.AES.decrypt(hash, SECRET_KEY).toString(CryptoJS.enc.Utf8);
            resolve(decoded)
        } catch (error) {
            reject(error)
        }
    })
}

export const PasswordHash = (password) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const hash = CryptoJS.AES.encrypt(password, SECRET_KEY_PASS).toString();
            // console.log(hash)
            resolve(hash)
        } catch (error) {
            reject(error)
        }
    })
}



export const ComparePassword = (user, password) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const hash = CryptoJS.AES.decrypt(user.password, SECRET_KEY_PASS).toString(CryptoJS.enc.Utf8);
            let isMatch = false
            if (password === hash)
                isMatch = true
            // console.log(hash);
            return resolve(isMatch)
        } catch (error) {
            reject(error)
        }
    })
}

//-------------------------------------------------
export const SignToken = (playload) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            let dataToken = {
                id: null,
                role: null,
                login_version: playload.login_version
            }
            dataToken.id = await Endcrypt(playload.id);
            dataToken.role = await Endcrypt(playload.role);
            // console.log(dataToken.id)
            const token = jwt.sign(dataToken, `${SECRET_KEY_TOKEN}`,
                {
                    expiresIn: `${EXPIRES_TOKEN}`
                }
            );
            resolve(token)
        } catch (error) {
            reject(error)
        }
    })
}

export const SignRefreshToken = (data) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            const playload = await Endcrypt(data.id);
            const refreshToken = jwt.sign({ playload }, `${SECRET_KEY_REFRESHTOKEN}`,
                {
                    expiresIn: `${EXPIRES_REFRESHTOKEN}`
                }
            );
            resolve(refreshToken)
        } catch (error) {
            reject(error)
        }
    })
}

export const VerifyToken = (token) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                data: null,
                message: EMessage.FAILE
            };
            let playload = null;
            jwt.verify(token, SECRET_KEY_TOKEN, async (error, verifird) => {
                // console.log(`ref: `, refreshToken)
                if (error) {
                    response.data = error.message
                    return resolve(response)
                }
                playload = verifird;
            });

            response.data = {
                id: await Decrypt(playload.id),
                role: await Decrypt(playload.role),
                login_version: playload.login_version
            }
            response.message = SMessage.SUCCESS;

            return resolve(response)
        } catch (error) {
            reject(error)
        }
    })
}

export const VerifyRefreshToken = (refreshToken) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(`here verify refresh token`)
            let playload = ''
            let response = {
                data: null,
                message: EMessage.FAILE
            }
            jwt.verify(refreshToken, `${SECRET_KEY_REFRESHTOKEN}`, (error, verified) => {
                // console.log(`playload: `, verified)
                if (error) {
                    response.data = error.message
                    return resolve(response);
                }
                playload = verified
            });

            response.data = {
                id: await Decrypt(playload.playload)
            }
            response.message = SMessage.SUCCESS
            // console.log(response)

            return resolve(response)
        } catch (error) {
            reject(error)
        }
    })
}

export const enCryptMessage = (message) => {
    try {
        let enMessage = CryptoJS.AES.encrypt(message, `${SECRET_KEY_MESSAGE}`).toString();
        return enMessage
    } catch (error) {
        return 'fail message'
    }
}

export const deCryptMessage = (encrypt_message) => {
    try {
        if (enCryptMessage == '')
            return ''
        let deMessage = CryptoJS.AES.decrypt(encrypt_message, `${SECRET_KEY_MESSAGE}`).toString(CryptoJS.enc.Utf8);
        if (!deMessage)
            return 'fail message'
        return deMessage
    } catch (error) {
        return 'fail message'
    }
}

export const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}
