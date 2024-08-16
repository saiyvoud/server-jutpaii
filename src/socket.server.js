import MessageController from "./controller/message.controller.js";
import { SMessage } from "./services/message.js";
class Socket {
    constructor(io) {
        this.socketServer(io);
    }

    socketServer(io) {
        // socket 

        io.on("connection", (socket) => {
            console.log(`a (id: ${socket.id}) client is connected.`);

            // message controller => sendmessage
            // io.to(data.room_id).emit('chat_message', { sender: data.sender, data: send });
            // socket.on('chat_message', message => {
            // });

            socket.on('join_room', room => {
                socket.room = room;
                console.log(`socket room: `, socket.rooms)
                socket.join(room);
                new MessageController().getMessage(room).then(r => {
                    if(r.message != SMessage.SUCCESS){
                        console.log(r);
                        return 
                    }
                    io.to(room).emit('get_message', { data: r.data });
                    // console.log(r.data);
                    console.log(`${socket.id} joined room ${room}`);
                })
            });

            // io.emit("create_room", room) // => room comntroller (create room)
            // socket.on('create_room', (room)) => {
            // })

            // order controller => create order
            // io.to(room_id).emit("create_order", { user_id, order })
            // socket.on('create_order', ({ user_id, order }) => {
            // })

            // order controller => update order status
            // io.to(upStatus.room_id).emit("order_status", { sender: user_id, upStatus })

            socket.on('read_message', room => {
                new MessageController().readedMessage(room).then(r => {
                    if (r != null) {
                        return
                    }
                    io.to(room).emit('readed_message')
                })
            });

            // io.to(data.room_id).emit('chat_message', { sender: data.sender, data: send });
            socket.on('disconnect', () => {
                console.log('A user disconnected:', socket.id);
            });

        })
    }

}

export default Socket;

// export const 