var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var sessions = [];

function createSession(uuid) {
  var session = {
    isStarted: false,
    players: [
      { uuid: uuid },
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

  socket.on('game-join', function (data) {
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
        session.players.push({ uuid: data.uuid });
        socket.emit('game-joined', { data: { session }});
        // if session full start the game
        if (session.players.length >= 4) {
          sessions[sessions.length - 1].isStarted = true;
          socket.emit('game-start', { data: {
            session: session,
          }});
        }
      }
    } else {
      // No sessions created, create one
      var session = createSession(data.uuid);
      socket.emit('game-joined', { data: { session }});
    }
  });
});