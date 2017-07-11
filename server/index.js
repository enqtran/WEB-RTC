const io = require('socket.io')(3000);


const arrUsername = [];

io.on('connection', socket => {
    console.log(socket.id);

    socket.on('NGUOI_DUNG_DANG_KY', user => {
        arrUsername.push(user);

        socket.emit('DANH_SACH_ONLINE', arrUsername);
        socket.broadcast.emit('CO_NGUOI_DUNG_MOI', user);
    });
});