if ( ! Detector.webgl ) {
  Detector.addGetWebGLMessage();
  document.getElementById( 'container' ).innerHTML = "The game is running!";
}

var loader = new THREE.JSONLoader();

var container, stats, keyboard;

var camera, controls, scene, renderer;

var mesh;
var player_ship_mesh;

var clock = new THREE.Clock();

var asteroids = [];
var missiles = [];
var GRAVITATIONAL_CONSTANT = 0.00;
var PLANE_ATTRACTION_COEFF = 40;
var TOP = 100;
var BOTTOM = -100;
var BOUNDS = {x: -1000, y: -1000, width: 2000, height: 2000};
var quadtree = new Quadtree(BOUNDS);

init();

function init() {

  container = document.getElementById( 'container' );

  keyboard = new THREEx.KeyboardState();

  scene = new THREE.Scene();

  /// STARS
  Stars.init();

  // LIGHTING

  var BLACK = 0x000000;
  var RED = 0xFF0000;
  var BLUE = 0x0000FF;
  var ambientLight = new THREE.AmbientLight( 0xAAAAAA );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0x555555, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.autoClear = false;
  renderer.setClearColor(BLACK, 1.0 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container.innerHTML = "";

  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  // Load some sample meshes
  Assets.init();

  var loader = new THREE.JSONLoader();
  loader.load("assets/ast1.js", Assets.asset("ast1"));
  loader.load("assets/player_ship.js", Assets.asset("player_ship"));
  loader.load("assets/target_ship.js", Assets.asset("target_ship"));
  loader.load("assets/missile.js", Assets.asset("missile"));

  Assets.callback = function() {
    Asteroid.init();

    PlayerShip.init();

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 2000000 );
    camera.position.z = 10;
    camera.position.y = 10;
    camera.lookAt(new THREE.Vector3(0, 0, -5));
    PlayerShip.mesh.add(camera);

    TargetEnemy.init("target_ship");

    missiles.push(new Missile(true));
    var em = new Missile(false);
    em.mesh.position.x -= 50;
    missiles.push(em);

    em = new Missile(false);
    em.mesh.position.x += 50;
    missiles.push(em);

    window.addEventListener( 'resize', onWindowResize, false );

    requestAnimationFrame(animate);
  };

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function updateQuadtree() {
  quadtree.clear();
  for (i in asteroids) {
    var ast = asteroids[i];
    quadtree.insert(ast.bounds);
  }
}

function collisions(obj, obj_bounds) {
  if (typeof obj_bounds === 'undefined') {
    obj_bounds = obj.bounds;
  }

  var result = [];
  var others = quadtree.retrieve(obj_bounds);
  for (j in others) {
    var oth_bounds = others[j];
    var oth = oth_bounds.obj;

    var diff = new THREE.Vector3().subVectors(obj.mesh.position, oth.mesh.position);
    var dist = diff.lengthSq();
    if (dist <= (obj.r*obj.r) + (oth.r*oth.r)) {
      result.push(oth);
    }
  }
  return result;
}

// RENDER LOOP
var last_time = null;
function animate(timestamp) {

  requestAnimationFrame( animate );

  if (last_time === null) last_time = timestamp;
  var scale = (timestamp - last_time) / 1000.0;
  last_time = timestamp;


  PlayerShip.update(scale);
  Asteroid.update(scale);
  TargetEnemy.update(scale);
  _.each(missiles, function(m) {
    m.update(scale);
  });
  Stars.update(scale);

  //updateQuadtree();

  // Check for collisions
  for (var i = 0; i < asteroids.length; i++) {
    var ast = asteroids[i];
    //var others = quadtree.retrieve(ast.bounds);

    for (var j = i + 1; j < asteroids.length; j++) {
      asteroidInteract(ast, asteroids[j], scale);
    }
  }

  render();
  stats.update();

}
function renderWithOffset(scene, camera, x, y, z) {

  var m = new THREE.Matrix4(PlayerShip.mesh.matrixWorld);
  var t = new THREE.Matrix4();
  t.makeTranslation(x,y,z);

  

  camera.position.x += x;
  camera.position.y += y;
  camera.position.z += z;
  //PlayerShip.mesh.add(camera);

  renderer.render(scene, camera);
}

function render() {
  renderer.clear();
  renderWithOffset(scene, camera, 0, 1000, 0);
  renderer.render( scene, camera );
}

