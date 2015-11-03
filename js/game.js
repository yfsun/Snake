var renderer = PIXI.autoDetectRenderer(640,480);
  renderer.backgroundColor = 0x1099bb;
// create an empty container
var gameContainer = new PIXI.Container();
// add the container to the stage

// add the renderer view element to the DOM
var t = document.getElementById('game-container')
t.appendChild(renderer.view);

var snake = new PIXI.Graphics();

gameContainer.addChild(snake);

animate();
function animate(time) {
  requestAnimationFrame(animate);
  renderer.render(gameContainer);
}
