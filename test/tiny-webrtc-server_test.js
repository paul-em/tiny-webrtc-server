var assert = require("assert");
var io = require('socket.io-client');


var socketURL = 'http://localhost:8080';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = {'name': 'Tom'};
var chatUser2 = {'name': 'Sally'};
var chatUser3 = {'name': 'Dana'};

describe("Chat Server", function () {
  it('Should return user id', function (done) {
    var client1 = io.connect(socketURL, options);
    client1.on('connect', function (data) {
      client1.emit('getUserId', {}, function (re) {
        assert.equal(re.success, true, "success should be true");
        assert.equal(re.error, null, "there should be no error set");
        assert.equal(typeof re.data.userId, 'number', "the id should be set");
        done();
      });
    });
  });
});