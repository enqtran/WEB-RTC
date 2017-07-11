const socket = io('http://localhost:3000');

socket.on('DANH_SACH_ONLINE', data => {
    data.forEach(data => {
        const {username, id } = data;
        $('#ulUser').append(`<li id="${id}">${username}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const {username, id } = user;
        $('#ulUser').append(`<li id="${id}">${username}</li>`);
    });
});



function openSteam() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

//openSteam().then( stream => playStream('localStream', stream));

const peer = new Peer({ key: 'lwjd5qra8257b9' });
peer.on('open', id => { 
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { username, id });
    });
});


// Call
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openSteam()
        .then(stream => {
            console.log(stream);

            playStream('localStream', stream);
            const call = peer.call(id, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        });
});



//answer

peer.on('call', call => {
    openSteam()
        .then(stream => {
            console.log(stream);

            call.answer(stream);
            playStream('localStream', stream);
            call.on('stream', remoteStream => {
                console.log(remoteStream);
                playStream('remoteStream', remoteStream);
            });
        });
});






