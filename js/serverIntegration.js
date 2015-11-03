
function connect(ipAddr, port ) {
  var socket = io(ipAddr + ":" + port);
  var clientId = null;

  // Update UI based on what sever send me
  socket.on('update', function(data) {
    // Find things that need to be removed;
    _.forEach(snake.children, function (r) {
      if (!r) return;
      if (!_.find(data, function(t) {
        return t.x == r.position.x && t.y == r.position.y;
      })) {
        snake.removeChild(r);
      }
    });

    _.forEach(data, function(t) {
      if (!_.find(snake.children, function(r) {
        return t.x == r.position.x && t.y == r.position.y;
      })) {
        var part = new PIXI.Graphics();
        part.beginFill(0xffffff);
        part.drawRect(0, 0, 15, 15);
        part.position.x = t.x;
        part.position.y = t.y;
        snake.addChild(part);
      }
    })
  });

  socket.on('clientId', function (id) {
    clientId = id;
  });

  socket.on('over', function (id) {
    alert('Game Over' + id);
  });

  $("#start").on('click', function () {
    socket.emit('start', socket.id);
  });


  // Attach key handlers
  addEventListener("keypress", keyEvent);

  function keyEvent(event) {
    var key = event.keyCode || event.which;
    var keychar = String.fromCharCode(key);
    switch(event.keyCode) {
      case 119: // w
          socket.emit('up');
        break;
      case 115: // s
          socket.emit('down');
        break;
      case 100: //d
          socket.emit('right');
        break;
      case 97:
          socket.emit('left');
        break;
    }
  }
}



connect('localhost', '3000');
