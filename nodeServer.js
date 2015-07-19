// Setup basic express server
var express = require('express');
var _ = require('lodash');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


var WIDTH = 640;
var HEIGHT = 480;
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));
var snakes = {};

var eggs = [];
var DIRECTION = {
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
};

setInterval(function(){
  io.sockets.emit('update', _.flatten(_.union(_.pluck(_.values(snakes), 'body'), eggs)));
}, 20)


setInterval (function(){
  spawnEgg();
}, 3000)

setInterval(function(){
  for (var key in snakes) {
    push(key);
    snakes[key].body.shift();
  }
}, 30)

function spawnEgg() {
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  eggs.push({x: x, y: y});
}



function push (key) {
  var head = snakes[key].body[snakes[key].body.length - 1];
  var newHead = {};
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
  if (newHead.x <= 0 || newHead.x >= 640 || newHead.y <= 0 || newHead.y >= 480) {
    io.sockets.emit('over', key);
  }
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
    if (snakes[client.id]) snakes[client.id].direction = DIRECTION.UP;
  });

  client.on('down', function () {
    if (snakes[client.id]) snakes[client.id].direction = DIRECTION.DOWN;
  });

  client.on('left', function () {
    if (snakes[client.id]) snakes[client.id].direction = DIRECTION.LEFT;
  });

  client.on('right', function () {
    if (snakes[client.id]) snakes[client.id].direction = DIRECTION.RIGHT;
  });



})
