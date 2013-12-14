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

  var materialNormalMap = new THREE.ShaderMaterial( parameters );
  

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
  var ambientLight = new THREE.AmbientLight( RED );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( BLUE, 2 );
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
    console.log("All assets loaded");
    // Load some sample meshes
    for (var i = 0; i < 10; i++) {
      Asteroid.init("ast1");
    }

    var m = new THREE.Mesh(Assets.get("player_ship"), new THREE.MeshBasicMaterial());
    m.scale.set(10, 10, 10);
    m.position.z = 10;
    scene.add(m);
    player_ship_mesh = m;

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.z = 5;
    camera.position.y = 5;
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

// RENDER LOOP
var last_time = null;
function animate(timestamp) {

  if (last_time === null) last_time = timestamp;
  var scale = (timestamp - last_time) / 1000.0;
  last_time = timestamp;

  requestAnimationFrame( animate );

  if (keyboard.pressed('A')) {
    player_ship_mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 1.0 * scale);
  }
  if (keyboard.pressed('D')) {
    player_ship_mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1.0 * scale);
  }

  var ship_forward = new THREE.Vector3(0, 0, -1);
  ship_forward.applyQuaternion(player_ship_mesh.quaternion);
  ship_forward.multiplyScalar(scale * 3000.0);

  if (keyboard.pressed('W')) {
    player_ship_mesh.position.add(ship_forward);
  }
  if (keyboard.pressed('S')) {
    player_ship_mesh.position.add(ship_forward.negate());
  }

  for (i in asteroids) {
    asteroids[i].update(scale);
  }
  TargetEnemy.update(scale);

  render();
  stats.update();

}

function render() {

  renderer.render( scene, camera );

}

