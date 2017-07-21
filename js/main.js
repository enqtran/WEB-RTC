const Peer = require('peerjs');
const $ = require('jquery');
const io = require('./socket.io');
const adapter = require('webrtc-adapter');

let user_id = $('#my-peer').val();

console.log('browserDetails = ', adapter.browserDetails.browser);

/**
 * CONNECT SOCKET
 */
// const socket = io('http://localhost:3000');
const socket = io('https://enqtranserversocketio-enqtran.c9users.io/');

// REGISTER
$('.webrtc-chat').hide();
socket.on('DANG_KY_THAT_BAI', () => alert('Username da ton tai, hay chon username khac !'));

//LIST USER ONLINE
socket.on('DANH_SACH_ONLINE', data => {
    $('#ulUser').html('');

    data.forEach(data => {
        const { username, id } = data;
        const peer_id = $('#my-peer').html();
        if (peer_id != id) {
            $('#ulUser').append(`<li id="${id}" class="list-group-item act">${username} - ${id}</li>`);
        } else {
            $('#currentUser').html(`${username} - ${id}`);
        }
    });
});

// //NEW USER CONNECT
// socket.on('CO_NGUOI_DUNG_MOI', user => {
//     const { username, id } = user;
//     const peer_id = $('#my-peer').html();

//     if (peer_id != id) {
//         $('#ulUser').append(`<li id="${id}" class="list-group-item act">${username} - ${id}</li>`);
//     } else {
//         $('#my-peer').append(`${username} - ${id}`);
//     }
// });

//USER OUT
socket.on('AI_DO_NGAT_KET_NOI', peerId => {
    console.log(peerId);
    $(`#${peerId}`).remove();
} );

/**************************************************************************************************/


/**
 * CHAT ALL SOCKET
 */
//SHOW MESSAGES ALL
socket.on("SERVER_TRA_TIN_NHAN", data_messages => {
    let class_name = (data_messages.peerId == user_id) ? 'curent_messages_user' : 'other_user';
    let user_name_chat = (data_messages.peerId != user_id) ? data_messages.username+":" : '';

    $('#listMessages').append("<div class='ms "+class_name+"'><b>" + user_name_chat +"</b> " + data_messages.messages + "</div>");
    $('#listMessages').animate({
        scrollTop: $('#listMessages').prop("scrollHeight")
    },
        500
    );
});

/**************************************************************************************************/


/**
 * CHAT ROOM SOCKET
 */
// LIST ROOM
socket.on("SERVER_TRA_LIST_ROOM_HIEN_CO", list_room => {
    $('#listRoom').html('');
    list_room.map((id_room) => $('#listRoom').append("<h4 class='room'>" + id_room + "</h4>"));
});

//ROOM ID
socket.on("SERVER_TRA_KET_NOI_ROOM", id_room_curuent => $('#roomHienTai').html(id_room_curuent));

//SHOW MESSAGES ROOM
socket.on("NGUOI_DUNG_GUI_TIN_NHAN_CHAT_ROOM", data_messages => {
    $('#roomListMessages').append("<div class='msr'>" + data_messages.username + " : " + data_messages.messages + "</div>");
    $('#roomListMessages').animate({
        scrollTop: $('#roomListMessages').prop("scrollHeight")
    },
        500
    );
});

/**************************************************************************************************/


/**
 * CHAT EFFECT TYPE
 */
//TYPING START
socket.on("SERVER_TRA_TYPING_START", effect_type => $('#typing').html(effect_type));

//TYPING END
socket.on("SERVER_TRA_TYPING_END", () => $('#typing').html(''));

/**************************************************************************************************/




/**
 * ICE SERVER
 */
//config TURN SERVER = xirsys
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

// const peer = new Peer({ key: 'lwjd5qra8257b9' });
const peer = new Peer({
    key: 'peerjs',
    host: 'enqtranwebrtc.herokuapp.com',
    secure: true,
    port: 443,
    config: { 'iceServers': customConfig }
});
/**************************************************************************************************/



/**
 * PEER CONNECT
 */
// connect peer -> id
peer.on('open', id => {
    user_id = id;
    $('#my-peer').append(id);

    //LOGIN
    $('#btnSignUp').click(() => {
        $('.webrtc-chat').show();
        $('.login-form').hide();
        $('#menu-mobile').show();
        
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { username, id });
        //test webcam device
        openSteam()
            .then(stream => playStream('localStream', stream))
            .catch(err => console.log('Error: ', err));
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

//call video from list user
$('#ulUser').on('click', 'li', function () {
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

/**************************************************************************************************/



/**
 * DEVICE GETUSERMEDIA
 */
//getUserMedia stream
function openSteam() {
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

//play video stream
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
        // console.log("chrome");
        return true;
    }

    if (navigator.mozGetUserMedia) {
        // console.log("firefox");
        return false;
    }
}

// openSteam()
//     .then( stream => playStream('remoteStream', stream))
//     .catch(err => console.log('Error: ', err));

/**************************************************************************************************/



/**
 * ACTION WITH JQUERY
 */
//TYPING START
$('#txtMessages').focusin(() => socket.emit("NGUOI_DUNG_TYPING_START"));

//TYPING END
$('#txtMessages').focusout(() => socket.emit("NGUOI_DUNG_TYPING_END"));

//LOGOUT
$('#btnLogout').click(() => {
    socket.emit("NGUOI_DUNG_LOGOUT", user_id );
    $('#txtUsername').val('');
    $('.webrtc-chat').hide();
    $('.login-form').show();
});

//CHAT SEND MESSAGES
$('#btnSendMessages').click(() => {
    if ($('#txtMessages').val() != '') {
        socket.emit("NGUOI_DUNG_GUI_TIN_NHAN", $('#txtMessages').val());
        $('#txtMessages').val('');
    } else {
        alert('Chưa có nội dung chat !');
    }
});

//ROOM CHAT
$('#btnRoom').click(() => {
    socket.emit("NGUOI_DUNG_TAO_ROOM", $('#txtRoom').val());
    $('#txtRoom').val('');
});

$('#btnSendMessagesRoom').click(() => {
    if ($('#txtMessagesRoom').val() != '') {
        socket.emit("NGUOI_DUNG_GUI_TIN_NHAN_CHAT_ROOM", $('#txtMessagesRoom').val());
        $('#txtMessagesRoom').val('');
    } else {
        alert('Chưa có nội dung chat !');
    }
});


/**************************************************************************************************/
$('#menu-mobile').click(function(event) {
    $('.profile').toggle();
});