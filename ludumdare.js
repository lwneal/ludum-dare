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
var bounds = {x: -1000000, y: -1000000, width: 1000000, height: 1000000};
var quadtree = new QuadTree(bounds);

init();

function init() {

  container = document.getElementById( 'container' );

  keyboard = new THREEx.KeyboardState();

  scene = new THREE.Scene();

  // uniforms

  var shader = THREE.ShaderLib[ "normalmap" ];
  var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
  uniforms[ "uDiffuseColor" ].value.setHex( 0xffffff );
  uniforms[ "uSpecularColor" ].value.setHex( 0x333333 );
  uniforms[ "uAmbientColor" ].value.setHex( 0x000000 );

  var parameters = {
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: uniforms,
    lights: true,
    fog: true
  };


  var texture = THREE.ImageUtils.loadTexture('asteroid.jpg');
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  /// STARS

  var radius = 100;
  var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

  for ( i = 0; i < 250; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar( r );

    starsGeometry[ 0 ].vertices.push( vertex );

  }

  for ( i = 0; i < 1500; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar( r );

    starsGeometry[ 1 ].vertices.push( vertex );

  }

  var stars;
  var starsMaterials = [
    new THREE.ParticleSystemMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
    new THREE.ParticleSystemMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
    new THREE.ParticleSystemMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
    new THREE.ParticleSystemMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
    new THREE.ParticleSystemMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
    new THREE.ParticleSystemMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
  ];

  for ( i = 10; i < 30; i ++ ) {

    stars = new THREE.ParticleSystem( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

    stars.rotation.x = Math.random() * 6;
    stars.rotation.y = Math.random() * 6;
    stars.rotation.z = Math.random() * 6;

    s = i * 10;
    stars.scale.set( s, s, s );

    stars.matrixAutoUpdate = false;
    stars.updateMatrix();

    scene.add( stars );

  }

  // LIGHTING

  var BLACK = 0x000000;
  var RED = 0xFF0000;
  var BLUE = 0x0000FF;
  var ambientLight = new THREE.AmbientLight( 0x222222 );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( 0x888888, 2 );
  directionalLight.position.set( 1, 1, 0.5 ).normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { alpha: false } );
  renderer.setClearColor( BLACK, 1 );
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

  Assets.callback = function() {
    Asteroid.init();

    var m = new THREE.Mesh(Assets.get("player_ship"), new THREE.MeshLambertMaterial({color: 0xFF0000}));
    m.scale.set(1, 1, 1);
    scene.add(m);
    player_ship_mesh = m;

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 2000000 );
    camera.position.z = 10;
    camera.position.y = 10;
    camera.lookAt(new THREE.Vector3(0, 0, -5));
    player_ship_mesh.add(camera);

    TargetEnemy.init("target_ship");

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

// RENDER LOOP
var last_time = null;
function animate(timestamp) {

  requestAnimationFrame( animate );

  if (last_time === null) last_time = timestamp;
  var scale = (timestamp - last_time) / 1000.0;
  last_time = timestamp;

  if (keyboard.pressed('A')) {
    player_ship_mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 1.0 * scale);
  }
  if (keyboard.pressed('D')) {
    player_ship_mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1.0 * scale);
  }

  var ship_forward = new THREE.Vector3(0, 0, -1);
  ship_forward.applyQuaternion(player_ship_mesh.quaternion);
  ship_forward.multiplyScalar(scale * 500.0);

  if (keyboard.pressed('W')) {
    player_ship_mesh.position.add(ship_forward);
  }
  if (keyboard.pressed('S')) {
    player_ship_mesh.position.add(ship_forward.negate());
  }

  Asteroid.update(scale);
  TargetEnemy.update(scale);

  updateQuadtree();

  for (i in asteroids) {
    var ast = asteroids[i];
    ast.mesh.material.color.setHex(0xFFFFFF);
  }

  // Check for collisions
  for (i in asteroids) {
    var ast = asteroids[i];
    var others = quadtree.retrieve(ast.bounds);
    console.log(others.length);
    for (j in others) {
      var other_bounds = others[j];
      var other_ast = other_bounds.obj;
      if (other_ast == ast) continue;

      //asteroidInteract(ast, other_ast, scale);
      ast.mesh.material.color.setHex(0xFF0000);
      other_ast.mesh.material.color.setHex(0xFF0000);

      /*
      //var diff = new THREE.Vector3(ast.mesh.position);
      //diff.sub(other_ast.mesh.position);
      var diff = new THREE.Vector3().subVectors(ast.mesh.position, other_ast.mesh.position);
      //console.log("diff.x=" + diff.x);
      var dist = diff.lengthSq();
      if (dist < 200.0 * 200.0 * 2.0) {
        ast.mesh.material.color.setHex(0xFF0000);
        other_ast.mesh.material.color.setHex(0xFF0000);
      }
      else {
        ast.mesh.material.color.setHex(0xFFFFFF);
        other_ast.mesh.material.color.setHex(0xFFFFFF);
      }
      */
    }
  }

  render();
  stats.update();

}

function render() {

  renderer.render( scene, camera );

}

