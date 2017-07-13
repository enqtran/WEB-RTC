const io = require('socket.io')(process.env.PORT || 3000);

const arrUsername = [];

io.on('connection', socket => {
    socket.on('NGUOI_DUNG_DANG_KY', user => {
        const isExist = arrUsername.some(e => e.username === user.username);

        socket.peerId = user.id;

        if(isExist) return socket.emit('DANG_KY_THAT_BAI');

        arrUsername.push(user);

        socket.emit('DANH_SACH_ONLINE', arrUsername);
        socket.broadcast.emit('CO_NGUOI_DUNG_MOI', user);
    });

    socket.on('disconnect', () => {
        const index = arrUsername.findIndex(user => user.id === socket.peerId);
        arrUsername.splice(index,1);

        io.emit('AI_DO_NGAT_KET_NOI', socket.peerId);
    });


});