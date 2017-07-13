//connect socket
// const socket = io('http://localhost:3000');
const socket = io('https://enqtran.github.io');
  
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


// register
$('#div-chat').hide();


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
        console.log('-----------------------customConfig-----------------------');
        console.log(res.v.iceServers);
        console.log('----------------------------------------------------------');

        customConfig = res.v.iceServers;
    }
});


//Function stream
function openSteam() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openSteam().then( stream => playStream('localStream', stream));
// openSteam().then( stream => playStream('remoteStream', stream));

// const peer = new Peer({ key: 'lwjd5qra8257b9' });
const peer = new Peer({ 
    key: 'peerjs', 
    host: 'enqtranwebrtc.herokuapp.com', 
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



