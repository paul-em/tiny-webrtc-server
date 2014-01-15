require("../lib/tiny-webrtc-server");
var assert = require("assert");
var io = require('socket.io-client');
var os = require('os');

var socketURL = 'http://127.0.0.1:8080';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var client1 = io.connect(socketURL, options);
var userId;

describe("joinRoom", function () {
  it("should tell me is should enter room first", function (done) {
    client1.emit("offer", {userId: 99999, offer: {offer: 1}}, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "no room selected");
      assert.strictEqual(data.data, null);
      done();
    })
  });

  it("should tell me there is missing room param", function (done) {
    client1.emit("joinRoom", {}, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "wrong arguments");
      assert.equal(data.data, null);
      done();
    })
  });

  it("should return my id", function (done) {
    client1.emit("getUserId", {}, function (data) {
      assert.strictEqual(data.success, true);
      userId = data.data.userId;
      done();
    })
  });

  it("should join my room and tell me there are no users in the room", function (done) {
    client1.emit("joinRoom", {room: "testRoom1"}, function (data) {
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.error, null);
      assert.notEqual(data.data.users, "undefined");
      assert.strictEqual(data.data.users.length,0);
      done();
    });
  });
});

describe("answer", function () {
  it("should fail and inform me of missing arguments", function (done) {
    client1.emit("answer", null, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "wrong arguments");
      assert.equal(data.data, null);
      done();
    });
  });

  it("should inform me, that user is gone", function (done) {
    client1.emit("answer", {userId: 99999, answer: {offer: 1}}, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "users does not exist");
      done();
    });
  });

  it("should tell me the call was successful", function (done) {
    client1.on("answer", function (data) {
      done();
      assert.equal(data.userId, userId);
      assert.strictEqual(data.answer.answer, 1);
    });

    client1.emit("answer", {userId: userId, answer: {answer: 1}}, function (data) {
      assert.equal(data.success, true);
      assert.strictEqual(data.error, null);
    });
  });
});

describe("offer", function () {
  it("should fail and inform me of missing arguments", function (done) {
    client1.emit("offer", null, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "wrong arguments");
      assert.strictEqual(data.data, null);
      done();
    });
  });

  it("should inform me, that user is gone", function (done) {
    client1.emit("offer", {userId: 99999, offer: {offer: 1}}, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "users does not exist");
      done();
    });
  });

  it("should tell me the call was successful", function (done) {
    client1.on("offer", function (data) {
      assert.strictEqual(data.userId, userId);
      assert.strictEqual(data.offer.offer, 1);
      done();
    });

    client1.emit("offer", {userId: userId, offer: {offer: 1}}, function (data) {
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.error, null);
    });
  });
});


describe("iceCandidate", function () {
  it("should fail and inform me of missing arguments", function (done) {
    client1.emit("iceCandidate", null, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "wrong arguments");
      assert.strictEqual(data.data, null);
      done();
    });
  });

  it("should inform me, that user is gone", function (done) {
    client1.emit("iceCandidate", {userId: 99999, iceCandidate: {a: 1}}, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "users does not exist");
      done();
    });
  });

  it("should tell me the call was successful", function (done) {
    client1.on("iceCandidate", function (data) {
      assert.strictEqual(data.userId, userId);
      assert.strictEqual(data.iceCandidate.a, 1);
      done();
    });

    client1.emit("iceCandidate", {userId: userId, iceCandidate: {a: 1}}, function (data) {
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.error, null);
    });
  });
});

describe("leaveRoom", function () {
  it("should successfully leave room", function (done) {
    client1.emit("leaveRoom", null, function (data) {
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.error, null);
      done();
    });
  });


  it("should tell me is should enter room first", function (done) {
    client1.emit("offer", {userId: userId, offer: {offer: 1}}, function (data) {
      assert.strictEqual(data.success, false);
      assert.equal(data.error, "no room selected");
      assert.strictEqual(data.data, null);
      done();
    });
  });

  it("should join my room and tell me there are no users in the room", function (done) {
    client1.emit("joinRoom", {room: "testRoom1"}, function (data) {
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.error, null);
      assert.notEqual(data.data.users, undefined);
      assert.strictEqual(data.data.users.length, 0);
      done();
    });
  });
});