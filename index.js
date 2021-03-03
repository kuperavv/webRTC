const express = require('express');
const app = express();

const port = 4000;

const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

io.sockets.on('error', (e) => console.log(e));
server.listen(port, () => console.log(`Server is running on port ${port}`));

let broadcaster;

io.sockets.on('connection', (socket) => {
  socket.on('broadcaster', () => {
    console.log('broadcaster', socket.id);
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });
  socket.on('watcher', () => {
    console.log('watcher', socket.id);
    socket.to(broadcaster).emit('watcher', socket.id);
  });
  socket.on('disconnect', () => {
    socket.to(broadcaster).emit('disconnectPeer', socket.id);
  });
  socket.on('offer', (id, message) => {
    console.log('offer', id);
    socket.to(id).emit('offer', socket.id, message);
  });
  socket.on('answer', (id, message) => {
    console.log('answer', id);
    socket.to(id).emit('answer', socket.id, message);
  });
  socket.on('candidate', (id, message) => {
    console.log('candidate', id);
    socket.to(id).emit('candidate', socket.id, message);
  });
});
