const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/socket.io/', (req, res) => {
  res.send('<h1>hello, this is socket server</h1>'); 
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(5252, () => {
  console.log('listening on *:5252');
});

