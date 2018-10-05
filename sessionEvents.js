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

exports.createSession = function(uuid) {
    return createSession(uuid);
};
