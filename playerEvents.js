function getPlayerPosition(player) {
    return {
        xpos: player.x,
        ypos: player.y
    };
}

function servePlayerPositions() {
    var players = [];
    for(var i = 0; i < arguments.length; i++) {
        players.push({
            uuid: arguments[i].uuid, // Identify player
            xpos: arguments[i].xpos, // Player's X position
            ypos: arguments[i].ypos  // Player's Y position
        });
    }
    return players;
}

exports.getPlayerPositions = function(){
    return serverPlayerPositions;
};
