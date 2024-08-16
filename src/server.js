import express from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import cors from "cors";

import http from "http";
import { Server } from "socket.io";
import Socket from "./socket.server.js";

import "./config/db.js"
import { PORT } from "./config/golblaKey.js";
import { SendE404, SendE500, SendSuccess } from "./services/response.js";
import router from "./router/index.js";

// create server
const app = express();
const server = http.createServer(app);
export const io = new Server(server);
new Socket(io);

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json())
// { extended: true, limit: '500mb', parameterLimit: 500 }
app.use(bodyParser.urlencoded({ extended: false, limit: '500mb', parameterLimit: 500 }))

const interceptor = (req, res, next) => {
	console.log(`req method: ${req.method} ${req.originalUrl}`);
	console.log('-------------------------------');
	next();
}

// router
app.use("/api/v1.0.0", interceptor, router);
app.use("/api/test", (req, res) => {
    return SendSuccess(res, 200, 'connected api', []);
    // res.status(200).json({ message: 'connected api.' })
})

app.use("/*", (req, res) => {
	try {
		const message = `can't ${req.method} ${req.originalUrl}`;
		return SendE404(res, message, 'not found')
	} catch (error) {
		return SendE500(res, 'server error', error)
	}
})

server.listen(PORT || 5505, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})