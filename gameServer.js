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

var GAMESTATUS = {
  PAUSED: 'PAUSED',
  STARTED: 'STARTED'
}
var status = GAMESTATUS.PAUSED;


function gameOver(clientId) {
  status = GAMESTATUS.PAUSED;
  console.log('Game Over');
  console.log(clientId);
}

function gameStart() {
  status = GAMESTATUS.STARTED;
}

updateLoop = setInterval(function(){
  if (status == GAMESTATUS.PAUSED) return;

  io.sockets.emit('update', _.flatten(_.union(_.map(_.values(snakes), 'body'), eggs)));
}, 20)

moveSnakeLoop = setInterval(function(){
  if (status == GAMESTATUS.PAUSED) return;
  for (var key in snakes) {
    if (!snakes[key]) continue;
    push(key);
    if(snakes[key].noshift) {
      snakes[key].noshift = false;
    } else {
      snakes[key].body.shift();
    }
  }  // Move Snake Body

}, 40);

spawnEggLoop = setInterval(function(){
  if (status == GAMESTATUS.PAUSED) return;
  spawnEgg();
}, 300)

function spawnEgg() {
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  eggs.push({x: x, y: y});
}

function push (key) {
  if(!snakes[key]) return;
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
  // Compare new head with the eggs
  for (var i = 0; i < eggs.length; ++i) {
    if( coolides({x: eggs[i].x, y: eggs[i].y, width: 15, height: 15}, {x: newHead.x, y: newHead.y, width: 15, height: 15})){
      snakes[key].noshift = true;
      eggs.splice(i, 1);
    }
  }

  // Compare new head with the walls
  if (newHead.x < 0 || newHead.x > 640 || newHead.y < 0 || newHead.y > 480) {
    gameOver(key);
  }

  // Compare the new head with the other snake bodies
  for (var prop in snakes) {
    if (!snakes[prop] || !snakes[prop].body) continue;
    for (var j = 0; j < snakes[prop].body.length; j++) {
      if (!snakes[prop].body[j]) continue;
      console.log('check ' + snakes[prop].body[j].x + ' - ' + snakes[prop].body[j].y);
      if( coolides({x: snakes[prop].body[j].x, y: snakes[prop].body[j].y, width: 15, height: 15}, {x: newHead.x, y: newHead.y, width: 15, height: 15})){
        gameOver(key);
      }
    }

  }

  //console.log(newHead.x + '' + newHead.y);
  snakes[key].body.push(newHead)
}


function coolides (rect1, rect2) {
  return (rect1.x < rect2.x + rect2.width &&
   rect1.x + rect1.width > rect2.x &&
   rect1.y < rect2.y + rect2.height &&
   rect1.height + rect1.y > rect2.y)

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
      gameStart();

  })
  client.on('disconnect', function() {
    console.log('Client Disconnected - ' + client.id);
    snakes[client.id] = null;
  })

  client.on('up', function () {
    if (snakes[client.id] && snakes[client.id].direction != DIRECTION.DOWN)
      snakes[client.id].direction = DIRECTION.UP;
  });

  client.on('down', function () {
    if (snakes[client.id] && snakes[client.id].direction != DIRECTION.UP)
      snakes[client.id].direction = DIRECTION.DOWN;
  });

  client.on('left', function () {
    if (snakes[client.id] && snakes[client.id].direction != DIRECTION.RIGHT)
      snakes[client.id].direction = DIRECTION.LEFT;
  });

  client.on('right', function () {
    if (snakes[client.id] && snakes[client.id].direction != DIRECTION.LEFT)
      snakes[client.id].direction = DIRECTION.RIGHT;
  });

})
