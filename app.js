var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var uuidv1 = require('uuid/v1');
var faker = require('faker');

var sessions = [];

function createSession(uuid) {
  var session = {
    isStarted: false,
    id: uuidv1(),
    players: [
      {
        uuid: uuid,
        name: faker.name.firstName
      },
    ],
    created: Date.now(),
  };
  sessions.push(session);
  return session;
}

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.on('disconnect', function() {
    socket.emit('disconnected', { data: {
      message: 'A player has disconnected',
    }});
  });
  socket.on('game-join', function (data) {
    console.log(data);
    if (sessions.length) {
      // get last session
      var session = sessions[sessions.length - 1];
      // check if session is started
      if (session.isStarted) {
        // if session started create new session with user in it
        session = createSession(data.uuid);
        socket.emit('game-joined', { data: { session }});
      } else {
        // if not add player to session
        session.players.push({ uuid: data.uuid, name: faker.name.firstName });
        socket.emit('game-joined', { data: { session }});
        // if session full start the game
        if (session.players.length >= 4) {
          sessions[sessions.length - 1].isStarted = true;
          socket.emit('game-start', { data: {
            session: session,
          }});
          // create new socket for started game
          socket.join(session.id);
          // listen position change events
          io.to(session.id).on('position', function(data) {
            // on position change emit that to clients
            console.log(data);
            io.to(session.id).emit('position-change', { data: {
              uuid: data.uuid,
              x: data.x,
              y: data.y,
            }});
          });
        }
      }
    } else {
      // No sessions created, create one
      var session = createSession(data.uuid);
      socket.emit('game-joined', { data: { session }});
    }
    console.log(session);
  });
});
