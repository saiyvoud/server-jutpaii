import mongoose from "mongoose";
import { DATABASE_URL_DEV } from "./golblaKey.js";


mongoose.connect(DATABASE_URL_DEV, {
    useNewUrlParser: true, useUnifiedTopology: true 
}).then(() => {
    console.log('connected Database!')
}).catch((err) => { console.log('Error: ', err) })