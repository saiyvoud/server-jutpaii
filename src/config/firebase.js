import admin from "firebase-admin";
import {
    SACCOUNT_TYPE,
    SACCOUNT_PROJECT_ID,
    SACCOUNT_PRIVATE_KEY_ID,
    SACCOUNT_PRIVATE_KEY,
    SACCOUNT_CLIENT_EMAIL,
    SACCOUNT_CLIENT_ID,
    SACCOUNT_AUTH_URI,
    SACCOUNT_TOKEN_URI,
    SACCOUNT_AUTH_PROVIDE,
    SACCOUNT_CLIENT_X509,
    SACCOUNT_USERNIVERSE_DOMAIN
} from "./golblaKey.js";

// import accountService from "../../service_account.json";

// const accountService = {
//     "type": "service_account",
//     "project_id": "notification-jutpai-dev",
//     "private_key_id": "2c5eb7524ecf580b9719f0f9164505a0712ab876",
//     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDAbMacURkPeKfi\nFvGbI0NCl7XvQjp+rtDIihbIT6AzbMHlmtbdIFFZPKYhY4SXn1ophBd47oiRaJEC\nXs/X8hQVZ8WHcULny/LE80ar30/UN8esC1PtBQUJ5FXYppKACnXzBEeoFifywFw9\n9NJXcxikvuDAan1wC57GZ+zJ8P/94LhRdLBQGDjrC/Z1BG5IDXvwPTyVab4NfMRq\nbmLMUbhFDUE+8t+Ge7XYa/MkGBnh/n3gGZ3wRPQsJXR+/pmoRUpM+U8Z/+XdoKDl\naUBci6HMgEhBSryaLidqOeIkDuaek6xy4XGqf+5OKHESAHgmfqCAEndB+PtYPns2\nGpeNLGB7AgMBAAECggEAE6/NThbZ+oQ8oNv6EgY0jm6ZFYZwF5/pCmteU1YaLMi2\nubfyvaLdz8RttsLIwP5zqgWypRO6cy4Aj/6FQzGoLlx0kBvdXXu3NcEx/MmXED44\ntnheOMSntFBhHA5GtMTdNmS8tAy4P5TAmzIeBwZmggxpUCZU+Q6nSuM9DZgTiLS0\nnCDrVrgTgJbV564OZbvu79mikmBJjJ4EOTNWvRigjg4pA8jA6drLAGMvOCokhkBU\nGLwKaHjv2kiDJXTJgA9/hP12agrXVnIzBiq7UuVPzRmyA97nvX8IcicECFnSQsgK\nQwTdXo3oBSLKny5UGfKrbILYGv1a2nbbMfADOoUNCQKBgQDf9i20GIGQFWQzRo5J\neQvvXk7tVExsW4aZMM6nFkwfi4DX3HOZ1oqwA8Ipvl3Bz/42PceayoEu10yFHYoq\nkKxenviufcDFdajGR9u5rLH2284T4+hHdPw15F2d6781ydc77ct/KuIjv67fk1Xm\nBi7ws/T89tRMc8tVmz7CuDBRBwKBgQDb86xpscAJ5vAsAV8xwoInSRlSpui1lDKJ\nyjEgc+EcAFiPVpf8jGgc9hBkguJK69OE34S144vwRqsj6w9LqqFf4ePwPEoR4vcS\niSx9pwGdtsuqoFFn4Z/UOzz4dLfmadG+Ga3kAxlvkiW7uTLnB20l2CuBLB+I6OPK\n0dSlqKV77QKBgE+C09kDdkQUBB3cJ7nX+q/BuJ2zduplWBTc6hER7naojVaVkokE\nTPqOawls51ZepG7XYh0HVfOuRiFgSmQwNrHlGH7CcITp78BtVInH0OrGQJR5Lkbo\nNn5flAjz4E+VWA+TrdJ5BA4TCF+hrDZc7Z9RFGIWs2ptFbxPwGlbAPRTAoGAcgkB\n6MKJaBjdiFMlwaywwiF6CYoTuKCfGyVDFyo9GcFsKNSidANvryQ8F4BsRp/ByHAC\nZDMXSHm7HSIvifFrPUTmYpU/acqcgnWwJW1CvzwYl9wKmKs3rFcSI1aQSduvLLov\nl7mrpFbHTW6VX4ZQJoDO/Wec6eSkxXDIqSKouXkCgYA/MGXfwSIZZN0DcWirNQ5n\nKl166sTMLA4pOPsHDb3Z79xBEOqXwWjG7gg/++clIGCpHA3tfLGsswSjdQldGXd6\nMThtJ+iNZShChSNAXWjPS0QVpOPkJoBw5+cbp+urGKta6T1HJhSvQLertbubZ+mW\naxUl5BA2Di9+GpL7bte3iA==\n-----END PRIVATE KEY-----\n",
//     "client_email": "firebase-adminsdk-nqro6@notification-jutpai-dev.iam.gserviceaccount.com",
//     "client_id": "116825046911934290838",
//     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//     "token_uri": "https://oauth2.googleapis.com/token",
//     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nqro6%40notification-jutpai-dev.iam.gserviceaccount.com",
//     "universe_domain": "googleapis.com"
//   }

// const accountService = {
//     "type": `${SACCOUNT_TYPE}`,
//     "project_id": `${SACCOUNT_PROJECT_ID}`,
//     "private_key_id": `${SACCOUNT_PRIVATE_KEY_ID}`,
//     "private_key": `${SACCOUNT_PRIVATE_KEY}`,
//     "client_email": `${SACCOUNT_CLIENT_EMAIL}`,
//     "client_id": `${SACCOUNT_CLIENT_ID}`,
//     "auth_uri": `${SACCOUNT_AUTH_URI}`,
//     "token_uri": `${SACCOUNT_TOKEN_URI}`,
//     "auth_provider_x509_cert_url": `${SACCOUNT_AUTH_PROVIDE}`,
//     "client_x509_cert_url": `${SACCOUNT_CLIENT_X509}`,
//     "universe_domain": `${SACCOUNT_USERNIVERSE_DOMAIN}`
// }

const accountService = {
    "type": "service_account",
    "project_id": "notification-jutpai-dev",
    "private_key_id": "2c5eb7524ecf580b9719f0f9164505a0712ab876",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDAbMacURkPeKfi\nFvGbI0NCl7XvQjp+rtDIihbIT6AzbMHlmtbdIFFZPKYhY4SXn1ophBd47oiRaJEC\nXs/X8hQVZ8WHcULny/LE80ar30/UN8esC1PtBQUJ5FXYppKACnXzBEeoFifywFw9\n9NJXcxikvuDAan1wC57GZ+zJ8P/94LhRdLBQGDjrC/Z1BG5IDXvwPTyVab4NfMRq\nbmLMUbhFDUE+8t+Ge7XYa/MkGBnh/n3gGZ3wRPQsJXR+/pmoRUpM+U8Z/+XdoKDl\naUBci6HMgEhBSryaLidqOeIkDuaek6xy4XGqf+5OKHESAHgmfqCAEndB+PtYPns2\nGpeNLGB7AgMBAAECggEAE6/NThbZ+oQ8oNv6EgY0jm6ZFYZwF5/pCmteU1YaLMi2\nubfyvaLdz8RttsLIwP5zqgWypRO6cy4Aj/6FQzGoLlx0kBvdXXu3NcEx/MmXED44\ntnheOMSntFBhHA5GtMTdNmS8tAy4P5TAmzIeBwZmggxpUCZU+Q6nSuM9DZgTiLS0\nnCDrVrgTgJbV564OZbvu79mikmBJjJ4EOTNWvRigjg4pA8jA6drLAGMvOCokhkBU\nGLwKaHjv2kiDJXTJgA9/hP12agrXVnIzBiq7UuVPzRmyA97nvX8IcicECFnSQsgK\nQwTdXo3oBSLKny5UGfKrbILYGv1a2nbbMfADOoUNCQKBgQDf9i20GIGQFWQzRo5J\neQvvXk7tVExsW4aZMM6nFkwfi4DX3HOZ1oqwA8Ipvl3Bz/42PceayoEu10yFHYoq\nkKxenviufcDFdajGR9u5rLH2284T4+hHdPw15F2d6781ydc77ct/KuIjv67fk1Xm\nBi7ws/T89tRMc8tVmz7CuDBRBwKBgQDb86xpscAJ5vAsAV8xwoInSRlSpui1lDKJ\nyjEgc+EcAFiPVpf8jGgc9hBkguJK69OE34S144vwRqsj6w9LqqFf4ePwPEoR4vcS\niSx9pwGdtsuqoFFn4Z/UOzz4dLfmadG+Ga3kAxlvkiW7uTLnB20l2CuBLB+I6OPK\n0dSlqKV77QKBgE+C09kDdkQUBB3cJ7nX+q/BuJ2zduplWBTc6hER7naojVaVkokE\nTPqOawls51ZepG7XYh0HVfOuRiFgSmQwNrHlGH7CcITp78BtVInH0OrGQJR5Lkbo\nNn5flAjz4E+VWA+TrdJ5BA4TCF+hrDZc7Z9RFGIWs2ptFbxPwGlbAPRTAoGAcgkB\n6MKJaBjdiFMlwaywwiF6CYoTuKCfGyVDFyo9GcFsKNSidANvryQ8F4BsRp/ByHAC\nZDMXSHm7HSIvifFrPUTmYpU/acqcgnWwJW1CvzwYl9wKmKs3rFcSI1aQSduvLLov\nl7mrpFbHTW6VX4ZQJoDO/Wec6eSkxXDIqSKouXkCgYA/MGXfwSIZZN0DcWirNQ5n\nKl166sTMLA4pOPsHDb3Z79xBEOqXwWjG7gg/++clIGCpHA3tfLGsswSjdQldGXd6\nMThtJ+iNZShChSNAXWjPS0QVpOPkJoBw5+cbp+urGKta6T1HJhSvQLertbubZ+mW\naxUl5BA2Di9+GpL7bte3iA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-nqro6@notification-jutpai-dev.iam.gserviceaccount.com",
    "client_id": "116825046911934290838",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nqro6%40notification-jutpai-dev.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

admin.initializeApp({
    credential: admin.credential.cert(accountService)
});


// console.log(accountService)

export default admin;