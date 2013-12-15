if ( ! Detector.webgl ) {
  Detector.addGetWebGLMessage();
  document.getElementById( 'container' ).innerHTML = "The game is running!";
}

var loader = new THREE.JSONLoader();

var container, stats, keyboard;

var camera, controls, scene, renderer;
var overlay_scene, overlay_camera;

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
  overlay_scene = new THREE.Scene();

  /// STARS
  Stars.init();

  // LIGHTING

  var BLACK = 0x000000;
  var RED = 0xFF0000;
  var BLUE = 0x0000FF;
  var ambientLight = new THREE.AmbientLight( 0xAAAAAA );
  scene.add( ambientLight );

  overlay_scene.add(new THREE.AmbientLight(0xFFFFFF));

  var directionalLight = new THREE.DirectionalLight( 0x555555, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  scene.add( directionalLight );

<<<<<<< HEAD
  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.autoClear = false;
  renderer.setClearColor(BLACK, 1.0 );
=======
  renderer = new THREE.WebGLRenderer( { alpha: false } );
  renderer.autoClear = false;
  renderer.setClearColor( BLACK, 1 );
>>>>>>> a2a674741736a16601a62eac4a4d15d781aed3dd
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

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.z = 10;
    camera.position.y = 10;
    camera.lookAt(new THREE.Vector3(0, 0, -5));
    PlayerShip.mesh.add(camera);

    overlay_camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );

    TargetEnemy.init("target_ship");

    missiles.push(new Missile(true));
    var em = new Missile(false);
    em.mesh.position.x -= 80;
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
  _.each(asteroids, function(oth) {
    var diff = new THREE.Vector3().subVectors(obj.mesh.position, oth.mesh.position);
    var dist = diff.lengthSq();
    var min_dist = obj.r + oth.r;
    if (dist <= (min_dist*min_dist)) {
      result.push(oth);
    }
  });
  return result;
}

function turn_towards(msrc, mtgt) {
  var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(msrc.quaternion);
  var right = new THREE.Vector3(1, 0, 0).applyQuaternion(msrc.quaternion);
  var to_target = new THREE.Vector3().subVectors(mtgt.position, msrc.position).normalize();

  var fdot = forward.dot(to_target);
  var turn = (fdot > 0) ? (1 - fdot) : 1;
  var dir = right.dot(to_target);
  if (dir > 0) turn = -turn;
  
  return turn;
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

  // Check for missile collisions
  _.each(missiles, function(m, ix_m) {
    var objs = collisions(m);
    _.every(objs, function(o) {
      console.log("collision: " + o);
      if (o.type() == "asteroid") {
        scene.remove(m.mesh);
        delete missiles[ix_m];
        return false;
      }
      return true;
    });
  });


  render();
  stats.update();

}
function renderWithOffset(scene, camera, x, y, z) {

  var t = new THREE.Matrix4();
  t.makeTranslation(x,y,z);

  var m = new THREE.Matrix4(PlayerShip.mesh.matrixWorld);

  var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.x += x;
  camera.position.y += y;
  camera.position.z += z;
  // camera.setWorldMatrix or something
  renderer.render(scene, camera);
}
  
function update_overlay(mesh) {
  var p, v, percX, percY, left, top;

  // this will give us position relative to the world
  p = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);

  // projectVector will translate position to 2d
  v = new THREE.Projector().projectVector(p, camera);

  // translate our vector so that percX=0 represents
  // the left edge, percX=1 is the right edge,
  // percY=0 is the top edge, and percY=1 is the bottom edge.
  percX = (v.x + 1) / 2;
  percY = (-v.y + 1) / 2;

  // scale these values to our viewport size
  left = percX * window.innerWidth;
  top = percY * window.innerHeight;

  // position the overlay so that it's center is on top of
  // the sphere we're tracking
  $('#overlay')
      .css('left', (left - $('#overlay').width() / 2) + 'px')
      .css('top', (top - $('#overlay').height() / 2) + 'px');
}

function render() {
  renderer.clear();
  renderWithOffset(scene, camera, 0, 1000, 0);
  renderer.render( scene, camera );
}

