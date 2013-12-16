if ( ! Detector.webgl ) {
  Detector.addGetWebGLMessage();
  document.getElementById( 'container' ).innerHTML = "The game is running!";
}

var loader = new THREE.JSONLoader();

var container, stats, keyboard;

var camera, controls, scene, renderer;
var overlay_scene, overlay_camera;
var meshPlanet;

var clock = new THREE.Clock();

var asteroids = [];
var missiles = [];
var INITIAL_ENEMY_DISTANCE = 1000;
var ENEMY_SPEED = 115;
var NUM_ENEMY_MISSILES = 3;
var MISSILE_TURN_RATE = 200;
var GRAVITATIONAL_CONSTANT = 0.05;
var PLANE_ATTRACTION_COEFF = 40;
var TOP = 75;
var BOTTOM = -75;
var BOUNDS = {x: -1000, y: -1000, width: 2000, height: 2000};
var EARTH_DISTANCE = -4500;

var NO_LOSE = false;
var startTime;

init();

function signOf(x) {
  return x > 0 ? 1 : -1;
}

function spawn_enemy_missile() {
  var em = new Missile(false);

  em.mesh.position = TargetEnemy.mesh.position.clone();

  em.mesh.position.x += signOf(Math.random() - 0.5) * rand(150, 350);
  em.mesh.position.z -= signOf(Math.random() - 0.5) * rand(150, 350);

  missiles.push(em);
}

function init() {

  container = document.getElementById( 'container' );

  keyboard = new THREEx.KeyboardState();

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.01);
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

  var planetGeometry = new THREE.SphereGeometry( 1000, 100, 50 );
  var planetTexture   = THREE.ImageUtils.loadTexture( "assets/earth_atmos_2048.jpg" );
  var planetMaterial = new THREE.MeshPhongMaterial( {
    fog: false,
    map: planetTexture
  });
  
  meshPlanet = new THREE.Mesh( planetGeometry, planetMaterial );
  meshPlanet.rotation.y = 0;
  meshPlanet.rotation.z = 0.1;
  meshPlanet.position.z = -3000;
  scene.add( meshPlanet );
  

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
    PlayerShip.init();
    AsteroidField.init();

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.z = 10;
    camera.position.y = 10;
    camera.lookAt(new THREE.Vector3(0, 0, -5));
    PlayerShip.mesh.add(camera);

    overlay_camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );

    TargetEnemy.init("target_ship");

    for (var i = 0; i < NUM_ENEMY_MISSILES; i++) {
      spawn_enemy_missile();
    }

    //missiles.push(new Missile(true));

    window.addEventListener( 'resize', onWindowResize, false );

    startTime = new Date().getTime();
    requestAnimationFrame(animate);
  };

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function collisions(obj, obj_bounds) {
  if (typeof obj_bounds === 'undefined') {
    obj_bounds = obj.bounds;
  }

  var result = [];
  function check(oth) {
    var diff = new THREE.Vector3().subVectors(obj.mesh.position, oth.mesh.position);
    var dist = diff.lengthSq();
    var min_dist = obj.r + oth.r;
    if (dist <= (min_dist*min_dist)) {
      result.push(oth);
    }
  }
  _.each(asteroids, check);
  check(TargetEnemy);
  check(PlayerShip);
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

  // Update 'seconds remaining'
  var ms_remaining = 1000 * 60 + startTime - new Date().getTime();
  $('#seconds').text(ms_remaining/1000);
  if (ms_remaining < 0 && !NO_LOSE) {
    window.location = "lose.html";
  }

  // Move earth so you don't hit it
  meshPlanet.rotation.y += 0.001;
  meshPlanet.position.z = PlayerShip.mesh.position.z + EARTH_DISTANCE;
  meshPlanet.position.y = PlayerShip.mesh.position.y + EARTH_DISTANCE/2;

  if (last_time === null) last_time = timestamp;
  var scale = (timestamp - last_time) / 1000.0;
  last_time = timestamp;

  PlayerShip.update(scale);
  AsteroidField.update(scale);
  TargetEnemy.update(scale);
  var i = 0;
  _.each(missiles, function(m) {
    m.update(scale);
    if (m.friendly) return;

    // Update missile indicator
    var fel = $('#missile_ind_' + i);
    var bel = $('#missile_bind_' + i);
    if (onscreen(m.mesh)) {
      var coords = screen_coords(m.mesh);
      if (fel !== null && bel !== null) {
        fel.css('display', 'block');
        bel.css('display', 'none');
        fel.css('left', (coords.left - fel.width() / 2) + 'px')
            .css('top', (coords.top - fel.height() / 2) + 'px');
      }
    }
    else {
      if (fel !== null && bel !== null) {
        fel.css('display', 'none');
        bel.css('display', 'block');
        var to_m = new THREE.Vector3().subVectors(m.mesh.position, PlayerShip.mesh.position);
        var dist = to_m.length();
        to_m.normalize();
        var x = ((to_m.x + 1) / 2) * window.innerWidth;

        bel.css('left', (x - bel.width() / 2) + 'px');
        var sat = 100*(dist / 600.0);
        if (sat > 100) sat = 100;
        if (sat < 0) sat = 0;
        bel.css('border-top-color', 'hsl(0, ' + sat + '%, 50%)');
      }
    }
    i++;
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
  var new_missiles = 0;
  _.each(missiles, function(m, ix_m) {
    var objs = collisions(m);
    _.every(objs, function(o) {
      if (o.type() == "asteroid") {
        scene.remove(m.mesh);
        delete missiles[ix_m];
        // Remove particles
        var zero = new THREE.Vector3();
        for (var i = 0; i < m.particles.geometry.vertices.length; i++) {
          m.particles.geometry.vertices[i].copy(zero);
        }

        // If it's the player's missile, end the game
        if (m.friendly && !NO_LOSE) {
          window.location = "lose.html";
        }

        new_missiles += 1;

        return false;
      }

      if (o.type() == "target_enemy" && m.friendly) {
        window.location = "win.html";
      }
      else if (o.type() == "player_ship" && !m.friendly) {
        if (o.enabled && !NO_LOSE) {
          window.location = "lose.html";
        }
      }
      return true;
    });
  });

  for (var i = 0; i < new_missiles; i++) {
    spawn_enemy_missile();
    var snd = new Audio("assets/explosion.wav");
    snd.play();
  }

  (function() {
    if (!PlayerShip.enabled) return;
    var objs = collisions(PlayerShip);
    _.each(objs, function(o) {
      if (o.type() == "asteroid" && !NO_LOSE) {
        window.location = "lose.html";
      }
    });
  })();


  render();
  stats.update();

}
  
function screen_coords(mesh) {
  var p, v, percX, percY, left, top;

  // this will give us position relative to the world
  p = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);

  // projectVector will translate position to 2d
  v = new THREE.Projector().projectVector(p, camera);

  if (v.z < 0) return {left: -1000, top: -1000};

  // translate our vector so that percX=0 represents
  // the left edge, percX=1 is the right edge,
  // percY=0 is the top edge, and percY=1 is the bottom edge.
  percX = (v.x + 1) / 2;
  percY = (-v.y + 1) / 2;

  // scale these values to our viewport size
  left = percX * window.innerWidth;
  top = percY * window.innerHeight;

  return {left: left, top: top};
}

function onscreen(mesh) {
  var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(PlayerShip.mesh.quaternion);
  var to_enemy = new THREE.Vector3().subVectors(mesh.position, PlayerShip.mesh.position).normalize();
  return forward.dot(to_enemy) > 0;
}

function update_enemy_overlay(mesh) {
  if (onscreen(mesh)) {
    var coords = screen_coords(mesh);
    if (coords !== null) {
      $('#overlay')
          .css('left', (coords.left - $('#overlay').width() / 2) + 'px')
          .css('top', (coords.top - $('#overlay').height() / 2) + 'px');
    }
    else {
      $('#overlay').css('left', -200).css('top', -200);
    }
  }
  else {
    $('#overlay').css('left', -200).css('top', -200);
  }
}

function render() {
  renderer.clear();
  renderer.render( scene, camera );
}

