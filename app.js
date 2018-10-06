var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var uuidv1 = require('uuid/v1');
var faker = require('faker');

var players = {};
var clock = null;
var clockInterval = null;
var stage = 1;
var playerStarts = {
  1: [{ x: 367, y: 80, angle: -180 }, { x: 390, y: 52, angle: -180 }, { x: 420, y: 52, angle: -180 }, { x: 420, y: 52, angle: -180 }, { x: 440, y: 52, angle: -180 }, { x: 4400, y: 52, angle: -180 }]
}

server.listen(80);

 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  players[socket.id] = {
    angle: (playerStarts[stage][Object.keys(players).length]) ? (playerStarts[stage][Object.keys(players).length].angle) : 0,
    x: (playerStarts[stage][Object.keys(players).length]) ? (playerStarts[stage][Object.keys(players).length].x) : 0,
    y: (playerStarts[stage][Object.keys(players).length]) ? (playerStarts[stage][Object.keys(players).length].y) : 0,
    playerId: socket.id,
    name: faker.name.firstName(),
    car: 'motorbike'
  }

  if (!clock) {
    clock = 1;  
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

  socket.on('player-starts', function(data) {
    playerStarts = data;

  })
});
