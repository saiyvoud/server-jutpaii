
import express from "express";
import CategoryController from "../controller/category.controller.js";
import UserController from "../controller/user.cotroller.js";
// eslint-disable-next-line no-unused-vars
import BankController from "../controller/bank.controller.js";
import AddressController from "../controller/address.controller.js";
import ProductController from "../controller/product.controller.js";
import PostController from "../controller/post.controller.js";

// eslint-disable-next-line no-unused-vars
import { auth, admin } from "../middleware/auth.js";
import FavoriteController from "../controller/favorite.controller.js";
import RefreshToken from "../middleware/rerfresToken.js";
import ShareController from "../controller/share.controller.js";
import OrderController from "../controller/order.controller.js";
import RoomController from "../controller/room.controller.js";
import MessageController from "../controller/message.controller.js";
import PayMentController from "../controller/payment.controller.js";
import ReportPostController from "../controller/reportPost.controller.js";
import NotificationController from "../controller/notification.controller.js";
import SearchController from "../controller/search.controller.js";

const router = express.Router();


//--------------auth refres
router.post(`/auth/refresh`, auth, RefreshToken)


// --------------User
const user = '/user';
router.post(`${user}/register`, UserController.register);
router.post(`${user}/login/email`, UserController.loginWithEmail);
router.post(`${user}/login/username`, UserController.loginWithUsername);
router.get(`${user}/info`, auth, UserController.userInfo);
router.put(`${user}/editpassword`, auth, UserController.editPassword);
router.put(`${user}/forgotpassword`, UserController.changePassword);
router.post(`${user}/changeprofile`, auth, UserController.editProfile);
router.get(`${user}/getone/:userid`, auth, UserController.getOneUser);
router.put(`${user}/update`, auth, UserController.updateUser);
router.put(`${user}/edit/bio`, auth, UserController.editBio);
// admin
router.put(`${user}/upgrade/admin/:userid`, auth, /*admin,*/ UserController.insertAdmin);
router.get(`${user}/getall`, auth, /*admin,*/ UserController.getAllUser);
router.get(`${user}/useramount`, auth, /*admin,*/ UserController.countUser)
router.get(`${user}/alladmin`, auth, /*admin,*/ UserController.getAllAdmin);
router.put(`${user}/downgrade-admin/:userid`, auth, /*admin,*/ UserController.downGradeAdmin);
router.put(`${user}/delete/:userid`, auth, /*admin,*/ UserController.deleteUser);

// --------------Category
const category = '/category';
// addmin
// router.get(`${category}/getall`, CategoryController.getAllCategory);
// router.post(`${category}/create`, auth, admin, CategoryController.insertCategory);
// router.put(`${category}/delete/:id`, auth, admin, CategoryController.deleteCategory);
// router.put(`${category}/update/:id`, auth, admin, CategoryController.updateCategory);
// router.put(`${category}/unpublish/:id`, auth, admin, CategoryController.unPublish);
// router.put(`${category}/publish/:id`, auth, admin, CategoryController.publish);
router.get(`${category}/getall`, CategoryController.getAllCategory);
router.post(`${category}/create`, auth, CategoryController.insertCategory);
router.put(`${category}/delete/:id`, auth, CategoryController.deleteCategory);
router.put(`${category}/update/:id`, auth, CategoryController.updateCategory);
router.put(`${category}/unpublish/:id`, auth, CategoryController.unPublish);
router.put(`${category}/publish/:id`, auth, CategoryController.publish);

//---------------Bank
// const bank = '/bank'
// router.put(`${bank}/delete/:id`, auth, BankController.deleteBank);
// router.get(`${bank}/getone/:id`, auth, BankController.getOneBank);
// router.post(`${bank}/insert`, auth, BankController.insertBankAccount);
// router.get(`${bank}/getall`, auth, BankController.myBankAccount);

// ---------------Address
const addrs = '/address'
router.post(`${addrs}/insert`, auth, AddressController.insertAddress);
router.get(`${addrs}/getone/:id`, auth, AddressController.getOneAddress);
router.put(`${addrs}/delete/:id`, auth, AddressController.deleteAddress);
router.put(`${addrs}/update/`, auth, AddressController.updateAddress);

//-----------------product
const product = '/product'
router.post(`${product}/insert`, auth, ProductController.insertProduct)
router.put(`${product}/update/:id`, auth, ProductController.updateProduct)
router.get(`${product}/getall`, auth, ProductController.getAllProduct)
router.get(`${product}/getone/:id`, auth, ProductController.getOneProduct)
router.put(`${product}/delete/:id`, auth, ProductController.deleteProduct)

// ----------------Post
const post = '/post'
router.post(`${post}/create`, auth, PostController.createPost);
router.post(`${post}/product/:id`, auth, PostController.postProduct);
router.get(`${post}/getall`, PostController.getAllPost)
router.get(`${post}/getall/limit`, PostController.getAllPostLimit)
router.get(`${post}/getall/byuser/:id`, PostController.getAllPostByUser)
router.get(`${post}/getall/category/:name`, PostController.getAllPostByCategory)
router.get(`${post}/getone/:id`, PostController.getOnePost)
router.put(`${post}/update/:id`, auth, PostController.updatePost)
router.put(`${post}/delete/:id`, auth, PostController.deletePost)
router.get(`${post}/getmyall`, auth, PostController.getAllMyPost)
router.put(`${post}/update/exchange/:id`, auth, PostController.updateExchangeRate)
router.put(`${post}/update/status/:id`, auth, PostController.updatePostStatusSale)

// ----------------Favorite
const favorite = '/favorite'
router.post(`${favorite}/post/:id`, auth, FavoriteController.favPost)
router.get(`${favorite}/getall`, auth, FavoriteController.getAllmyFavoritesPost)
router.get(`${favorite}/getall/byuser/:id`, FavoriteController.getAllFavoritesPostByUser)
router.post(`/bookmark/:id`, auth, FavoriteController.bookMark)
router.get(`/bookmark`, auth, FavoriteController.myBookmark)
router.put(`/unbookmark/:id`, auth, FavoriteController.unBookmark)

// ----------------Share
const share = '/share'
router.post(`${share}/post/:id`, auth, ShareController.sharePost)
router.put(`${share}/unshare/post/:id`, auth, ShareController.unSharePost)
router.get(`${share}/getall`, auth, ShareController.getMySharePost)

// ----------------Order
const order = '/order'
router.post(`${order}/create`, auth, OrderController.createOrder);
router.put(`${order}/sale/update/status/:id`, auth, OrderController.updateSaleOrderStatus);
router.get(`${order}/sale/getall/status/:status`, auth, OrderController.getSaleOrderByStatus);
router.get(`${order}/sale/getall`, auth, OrderController.getAllSaleOrder);

router.get(`${order}/myorder/getall`, auth, OrderController.getAllMyOrder);
router.get(`${order}/myorder/getall/status/:status`, auth, OrderController.getMyOrderByStatus);

router.get(`${order}/getone/:id`, auth, OrderController.getOneOrder);
// admin
router.get(`${order}/getall`, auth, /*admin,*/ OrderController.getAll);
router.get(`${order}/getall/user/:id`, auth, /*admin,*/ OrderController.getAllWithUser);
router.get(`${order}/sale/getall/user/:id`, auth, OrderController.getAllSaleWithUser);
router.get(`${order}/buy/getall/user/:id`, auth, OrderController.getAllBuyWithUser);
// router.get(`${order}/allwithuser/:id`, auth, /*admin,*/ OrderController.getAllSaleWithUser)
// router.get(`${order}/allwithuser/:id`, auth, /*admin,*/ OrderController.getAllSaleWithUser)

// ----------------Room
const room = '/room'
router.post(`${room}/create`, auth, RoomController.createRoom);
router.get(`${room}/getone/:room_id`, auth, RoomController.getOneRoom);
router.get(`${room}/getallmyroom`, auth, RoomController.getAllMyRoom);
router.put(`${room}/delete/:roomId`, auth, RoomController.deleteRoom);

// admin
router.get(`${room}/getall`, auth, /*admin,*/ RoomController.getAllRoom);

// ----------------Message
const message = '/message'
router.get(`${message}/getallmessage/:roomid`, auth, MessageController.getAllMessageInRoom);
router.post(`${message}/sendmessage`, auth, MessageController.sendMessage);
router.post(`${message}/send/image`, auth, MessageController.sendImage);
router.post(`${message}/send/formorder`, auth, MessageController.sendFormOrder);
router.post(`${message}/send/post`, auth, MessageController.sendPost);
router.put(`${message}/delete/:msg_id`, auth, MessageController.delete);
router.put(`${message}/readed/:roomid`, auth, MessageController.readedMessage);

// ----------------Payment
const payment = '/payment'
router.post(`${payment}/create`, auth, PayMentController.insertPayMent);
router.get(`${payment}/getall`, auth, PayMentController.getAllPayMent);
router.get(`${payment}/getone/:payid`, auth, PayMentController.getOnePayMent);
router.get(`${payment}/getmyall`, auth, PayMentController.getAllMyPayMent);
router.put(`${payment}/delete/:payid`, auth, PayMentController.deletePayMent);

// admin
router.get(`${payment}/all`, auth, /*admin,*/ PayMentController.getAllByAdmin)


// ----------------Report Post
const reportPost = '/reportpost'
router.post(`${reportPost}/create`, auth, ReportPostController.report);
router.get(`${reportPost}/getone/post/:id`, auth, /*admin,*/ ReportPostController.getReportByPost);
router.get(`${reportPost}/getallpost`, auth, /*admin,*/ ReportPostController.getAllPostReport);
router.put(`${reportPost}/delete/:id`, auth, /*admin,*/ ReportPostController.deleteReport);

//-----------------Notification
const notification = '/notification';
router.post(`${notification}/test`, NotificationController.testSendNoti);
// router.post(`${notification}/send`, auth, NotificationController.sendNoti);
router.post(`${notification}/registertoken`, auth, NotificationController.saveRegisterToken);
router.get(`${notification}/getall`, auth, NotificationController.getAllNoti);
router.get(`${notification}/getnew`, auth, NotificationController.getAllNewNoti);
router.get(`${notification}/getold`, auth, NotificationController.getAllOldNoti);
router.put(`${notification}/read`, auth, NotificationController.readNoti);
router.put(`${notification}/delete/:id`, auth, NotificationController.deleteNoti);


//-----------------Search
const search = "/search"
router.get(`${search}`, SearchController.search)
router.get(`${search}/chatroom`, auth, SearchController.searchChatRoom)

export default router;


/*
	14-12-2023
	edit favorite
*/