if ( ! Detector.webgl ) {
  Detector.addGetWebGLMessage();
  document.getElementById( 'container' ).innerHTML = "The game is running!";
}

var container, stats;

var camera, controls, scene, renderer;

var mesh;

var worldWidth = 128, worldDepth = 128,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2,
data = generateHeight( worldWidth, worldDepth );

var clock = new THREE.Clock();

init();
animate();

function init() {

  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.y = getY( worldHalfWidth, worldHalfDepth ) * 100 + 100;

  controls = new THREE.FirstPersonControls( camera );

  controls.movementSpeed = 1000;
  controls.lookSpeed = 0.125;
  controls.lookVertical = true;

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

  for ( i = 10; i < 300; i ++ ) {

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
  var loader = new THREE.JSONLoader();
  loader.load("assets/ast1.js", function(geometry) {
    var m = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
    m.scale.set(10, 10, 10);
    m.position.y = 10;
    scene.add(m);
  });

  loader.load("assets/player_ship.js", function(geom) {
    var m = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
    m.scale.set(10, 10, 10);
    m.position.z = 10;
    scene.add(m);
  });

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  controls.handleResize();

}

function generateHeight( width, height ) {

  var data = [], perlin = new ImprovedNoise(),
  size = width * height, quality = 2, z = Math.random() * 100;

  for ( var j = 0; j < 4; j ++ ) {

    if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;

    for ( var i = 0; i < size; i ++ ) {

      var x = i % width, y = ( i / width ) | 0;
      data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;


    }

    quality *= 4

  }

  return data;

}

function getY( x, z ) {

  return ( data[ x + z * worldWidth ] * 0.2 ) | 0;

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  controls.update( clock.getDelta() );
  renderer.render( scene, camera );

}

