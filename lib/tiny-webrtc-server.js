"use strict";
var port = process.env['app_port'] || 8080;
//var io = require("socket.io").listen(port);
var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: port});

console.log("info: listening on port " + port);

// global variables
var userCounter = 0;
var rooms = {};
var roomLimit = 5;

wss.on('connection',
    function (socket) {
        socket.userId = userCounter++;
        console.log("connect", "[userId: " + userCounter + "]", "[origin: " + socket.upgradeReq.headers['origin'] + "]");
        send(socket, "userId", socket.userId);

        socket.on('message', function (msg) {
            msg = JSON.parse(msg);
            if (typeof socketFns[msg.fn] == 'function') {
                socketFns[msg.fn](msg.data);
            }
        });

        socket.on('close', function () {
            leaveRoom(socket);
        });

        var socketFns = {
            joinRoom: function (data) {
                if (data.room === undefined) {
                    send(socket, "roomJoinError", "wrong arguments");
                    return;
                }

                if (socket.room) {
                    leaveRoom(socket);
                }

                if (rooms[data.room] === undefined) {
                    rooms[data.room] = [];
                }

                var userArray = [];

                // create room if not exists
                var members = rooms[data.room];
                if (members.length >= roomLimit) {
                    send(socket, "roomJoinError", "room full");
                    return;
                }

                // get members
                for (var i in members) {
                    if (members.hasOwnProperty(i)) {
                        userArray.push(members[i].userId);
                    }
                }

                rooms[data.room].push(socket);

                // save room and userId in socket object
                socket.room = data.room;

                // return users
                send(socket, "roomJoinSuccess", {users: userArray});
            },
            leaveRoom: function () {
                leaveRoom(socket);
            },
            answer: function (data) {
                if (socket.room !== undefined && validArguments(["userId", "answer"], data)) {
                    var forwardSocket = getSocket(socket.room, data.userId);
                    if (forwardSocket) {
                        send(forwardSocket, "answer", {
                            userId: socket.userId,
                            answer: data.answer,
                            peer: data.peer
                        });
                    }
                }
            },
            offer: function (data) {
                if (validArguments(["userId", "offer"], data)) {
                    var forwardSocket = getSocket(socket.room, data.userId);
                    if (forwardSocket) {
                        send(forwardSocket, "offer", {
                            userId: socket.userId,
                            offer: data.offer,
                            peer: data.peer
                        });
                    }
                }
            },
            iceCandidate: function (data) {
                if (validArguments(["userId", "iceCandidate"], data)) {
                    var forwardSocket = getSocket(socket.room, data.userId);
                    if (forwardSocket) {
                        send(forwardSocket, "iceCandidate", {
                            userId: socket.userId,
                            iceCandidate: data.iceCandidate
                        });
                    }
                }
            }
        };


    });

function send(socket, fn, data) {
    socket.send(JSON.stringify({fn: fn, data: data}));
}

function leaveRoom(socket) {
    var members = rooms[socket.room];
    if (members !== undefined) {
        for (var i in members) {
            if (!members.hasOwnProperty(i)) continue;
            if (members[i].userId === socket.userId) {
                members.splice(i, 1);
            } else {
                send(members[i],"userLeave", {userId: socket.userId});
            }
        }
        if (members.length === 0) {
            delete rooms[socket.room];
        }
    }
    socket.room = undefined;
}

function validArguments(expected, params) {
    if (params !== null && typeof params === "object") {
        for (var i in expected) {
            if (expected.hasOwnProperty(i) && !params.hasOwnProperty(expected[i])) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

function getSocket(room, userId) {
    var members = rooms[room];
    for (var i in members) {
        if (members.hasOwnProperty(i) && members[i].userId === userId) {
            return members[i];
        }
    }
    return null;
}