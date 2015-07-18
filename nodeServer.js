// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));
var snakes = {};
var DIRECTION = {
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
};

setInterval(function(){
  io.sockets.emit('update', snakes);

}, 20)


setInterval(function(){
  for (var key in snakes) {
    push(key);
    snakes[key].body.shift();
  }
}, 30)

function push (key) {
  var head = snakes[key].body[snakes[key].body.length - 1];
  var newHead = {};
  console.log(snakes[key].direction);
  switch (snakes[key].direction) {
    case DIRECTION.UP:
      newHead.x = head.x;
      newHead.y = head.y - 16;
    break;
    case DIRECTION.DOWN:
      newHead.x = head.x;
      newHead.y = head.y + 16;
    break;
    case DIRECTION.LEFT:
      newHead.x = head.x - 16;
      newHead.y = head.y;
    break;
    case DIRECTION.RIGHT:
      newHead.x = head.x + 16;
      newHead.y = head.y;
    break;
  }
  //console.log(newHead.x + '' + newHead.y);
  snakes[key].body.push(newHead)


}


io.on('connection', function (client) {
  console.log('client connected:' + client.id );


  client.on('start', function (clientId) {
    console.log ("start: " + clientId);
      snakes[client.id] = {
        direction : DIRECTION.RIGHT,
        body: [{x: 100, y: 100}]
      };

      for ( var i = 0; i < 6; i++) {
        push(client.id);
      }

  })

  client.on('up', function () {
    snakes[client.id].direction = DIRECTION.UP;
  });

  client.on('down', function () {
    snakes[client.id].direction = DIRECTION.DOWN;
  });

  client.on('left', function () {
    snakes[client.id].direction = DIRECTION.LEFT;
  });

  client.on('right', function () {
    snakes[client.id].direction = DIRECTION.RIGHT;
  });



})
