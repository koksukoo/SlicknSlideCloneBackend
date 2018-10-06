var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var uuidv1 = require('uuid/v1');
var faker = require('faker');

var players = {};

function createSession(uuid) {
  var session = {
    isStarted: false,
    id: uuidv1(),
    players: [
      {
        uuid: uuid,
        name: faker.name.firstName()
      },
    ],
    created: Date.now(),
  };
  sessions.push(session);
  return session;
}

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

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function() {
    delete players[socket.id];
    io.emit('disconnect', socket.id)
  })

  socket.on('position', function(data) {
    // on position change emit that to clients
    console.log(data);
    console.log('sending data');
    socket.broadcast.emit('position-change', { data: {
      uuid: socket.id,
      x: data.x,
      y: data.y,
    }});
  });
});
