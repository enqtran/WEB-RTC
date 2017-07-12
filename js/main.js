const socket = io('http://localhost:3000');

$('#div-chat').hide();

let customConfig;

// Call XirSys ICE servers
$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "enqtran",
    secret: "966b2eb0-66ac-11e7-aa8a-5af66f31fc42",
    domain: "http://enqtrandev.website/webrtc",
    application: "AppName",
    room: "RoomName",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});
  
// PeerJS object
// var peer = new Peer({
//   key: 'Your PeerServer cloud API key',
//   debug: 3,
//   config: customConfig
// });

socket.on('DANH_SACH_ONLINE', data => {

    $('#div-chat').show();
    $('#div-dangky').hide();

    data.forEach(data => {
        const {username, id } = data;
        $('#ulUser').append(`<li id="${id}">${username}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const {username, id } = user;
        $('#ulUser').append(`<li id="${id}">${username}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });




});


socket.on('DANG_KY_THAT_BAI', () => alert('Username da ton tai, hay chon username khac !'));



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

// const peer = new Peer({ key: 'lwjd5qra8257b9' });
const peer = new Peer({ 
    key: 'peerjs', 
    host: 'webrtc-enqtran.herokuapp.com', 
    secure: true, 
    port: 443, 
    config: customConfig 
});


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



$('#ulUser').on('click', 'li', function(){
    const id = $(this).attr('id');
    openSteam()
        .then(stream => {
            console.log(stream);

            playStream('localStream', stream);
            const call = peer.call(id, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        });
});



