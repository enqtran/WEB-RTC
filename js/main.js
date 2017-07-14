const Peer = require('peerjs');
const $ = require('jquery');
const io = require('./socket.io');

//connect socket
// const socket = io('http://localhost:8888');
const socket = io('https://socketenqtran-enqtran.c9users.io');

// register
$('#div-chat').hide();

socket.on('DANH_SACH_ONLINE', data => {

    $('#div-chat').show();
    $('#div-dangky').hide();

    data.forEach(data => {
        const {username, id } = data;
        const peer_id = $('#my-peer').html();
        if (peer_id != id) {
            $('#ulUser').append(`<li id="${id}" class="list-group-item act">${username} - ${id}</li>`);
        } else {
            $('#my-peer').html(`${username} - ${id}`);
        }
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const {username, id } = user;
        const peer_id = $('#my-peer').html();
        if (peer_id != id) {
            $('#ulUser').append(`<li id="${id}" class="list-group-item act">${username} - ${id}</li>`);
        } else {
            $('#my-peer').html(`${username} - ${id}`);
        }
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });

});

socket.on('DANG_KY_THAT_BAI', () => alert('Username da ton tai, hay chon username khac !'));



//config TURN SERVER
let customConfig;

$.ajax({
    url: "https://global.xirsys.net/_turn/MyFirstApp/",
    type: "PUT",
    async: false,
    headers: {
        "Authorization": "Basic " + btoa("enqtran:a8a51244-676f-11e7-bc36-8ac1aa05a3c4")
    },
    success: function (res) {
         customConfig = res.v.iceServers;
    }
});



//getUserMedia stream
function openSteam() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);

    if (webrtc_detected_browser_webkit()) {
        video.srcObject = stream;
        video.play();
    } else {
        video.mozSrcObject = stream;
        video.play();
    };
}


// webrtc Detected Browser: true = chrome, false = firefox
function webrtc_detected_browser_webkit() {
    if (navigator.webkitGetUserMedia) {
        console.log("chrome");
        return true;
    }

    if (navigator.mozGetUserMedia) {
        console.log("firefox");
        return false;
    }
}


// openSteam().then( stream => playStream('localStream', stream));
// openSteam().then( stream => playStream('remoteStream', stream));

// const peer = new Peer({ key: 'lwjd5qra8257b9' });
const peer = new Peer({
    key: 'peerjs',
    host: 'enqtranwebrtc.herokuapp.com',
    secure: true,
    port: 443,
    config: { 'iceServers': customConfig }
});

// connect peer -> id
peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { username, id });
    });
});


// offer
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openSteam()
        .then(stream => {
            playStream('localStream', stream);
            console.log('localStream ', stream);

            const call = peer.call(id, stream);
            call.on('stream', remoteStream => {
                playStream('remoteStream', remoteStream);
                console.log('remoteStream ', remoteStream);
            });
        });
});



//answer
peer.on('call', call => {
    openSteam()
        .then(stream => {
            call.answer(stream);
            playStream('localStream', stream);
            console.log('localStream ', stream);

            call.on('stream', remoteStream => {
                playStream('remoteStream', remoteStream);
                console.log('remoteStream ', remoteStream);
            });
        });
});


//list user
$('#ulUser').on('click', 'li', function(){
    const id = $(this).attr('id');
    openSteam()
        .then(stream => {
            playStream('localStream', stream);
            console.log('localStream ', stream);

            const call = peer.call(id, stream);
            call.on('stream', remoteStream => {
                console.log('remoteStream ', remoteStream);
                playStream('remoteStream', remoteStream);
            });
        });
});



