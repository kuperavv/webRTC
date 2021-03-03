let peerConnection;
const config = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

const socket = io.connect(window.location.origin);
const video = document.querySelector('video');

socket.on('offer', (id, description) => {
  console.log(id);
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit('answer', id, peerConnection.localDescription);
    });
  console.log('peerConnect', peerConnection);
  peerConnection.ontrack = (event) => {
    console.log('event', event);
    video.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    console.log('onice', event);
    if (event.candidate) {
      socket.emit('candidate', id, event.candidate);
    }
  };
});

socket.on('candidate', (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch((e) => console.error(e));
});

socket.on('connect', () => {
  console.log(socket.id);
  socket.emit('watcher');
});

socket.on('broadcaster', () => {
  socket.emit('watcher');
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};
