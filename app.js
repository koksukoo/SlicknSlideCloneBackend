var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var uuidv1 = require('uuid/v1');
var faker = require('faker');

var players = {};
var clock = null;
var clockInterval = null;

server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  players[socket.id] = {
    rotation: 0,
    x: 0,
    y: 0,
    playerId: socket.id,
    name: faker.name.firstName(),
    car: 'motorbike'
  }

  if (!clock) {
    clock = 30;  
    clockInterval = setInterval(() => {
      clock--;
      socket.emit('starting-in', clock);
      socket.broadcast.emit('starting-in', clock);
      if (clock <= 0) {
        clearInterval(clockInterval);
        clock = 0;
        socket.emit('game-start');
        socket.broadcast.emit('game-start');
      }
    }, 1000);
  }
  socket.emit('starting-in', clock);

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function() {
    delete players[socket.id];
    io.emit('disconnect', socket.id)
  })

  socket.on('position', function(data) {
    // on position change emit that to clients
    socket.broadcast.emit('position-change', { 
      uuid: socket.id,
      x: data.x,
      y: data.y,
      angle: data.angle
    });
  });
});
