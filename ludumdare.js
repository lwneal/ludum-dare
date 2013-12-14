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
  

  // sides

  var matrix = new THREE.Matrix4();

  var pxGeometry = new THREE.PlaneGeometry( 100, 100 );
  pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.0;
  pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  pxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  pxGeometry.applyMatrix( matrix.makeRotationY( Math.PI / 2 ) );
  pxGeometry.applyMatrix( matrix.makeTranslation( 50, 0, 0 ) );

  var nxGeometry = new THREE.PlaneGeometry( 100, 100 );
  nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  nxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  nxGeometry.applyMatrix( matrix.makeRotationY( - Math.PI / 2 ) );
  nxGeometry.applyMatrix( matrix.makeTranslation( - 50, 0, 0 ) );

  var pyGeometry = new THREE.PlaneGeometry( 100, 100 );
  pyGeometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 0.5;
  pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 0.5;
  pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 0.5;
  pyGeometry.applyMatrix( matrix.makeRotationX( - Math.PI / 2 ) );
  pyGeometry.applyMatrix( matrix.makeTranslation( 0, 50, 0 ) );

  var pzGeometry = new THREE.PlaneGeometry( 100, 100 );
  pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  pzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  pzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, 50 ) );

  var nzGeometry = new THREE.PlaneGeometry( 100, 100 );
  nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
  nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
  nzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
  nzGeometry.applyMatrix( matrix.makeRotationY( Math.PI ) );
  nzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, -50 ) );

  //

  var geometry = new THREE.Geometry();
  var dummy = new THREE.Mesh();

  for ( var z = 0; z < worldDepth; z ++ ) {

    for ( var x = 0; x < worldWidth; x ++ ) {

      var h = getY( x, z );

      dummy.position.x = x * 100 - worldHalfWidth * 100;
      dummy.position.y = h * 100;
      dummy.position.z = z * 100 - worldHalfDepth * 100;

      var px = getY( x + 1, z );
      var nx = getY( x - 1, z );
      var pz = getY( x, z + 1 );
      var nz = getY( x, z - 1 );

      dummy.geometry = pyGeometry;
      THREE.GeometryUtils.merge( geometry, dummy );

      if ( ( px != h && px != h + 1 ) || x == 0 ) {

        dummy.geometry = pxGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

      if ( ( nx != h && nx != h + 1 ) || x == worldWidth - 1 ) {

        dummy.geometry = nxGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

      if ( ( pz != h && pz != h + 1 ) || z == worldDepth - 1 ) {

        dummy.geometry = pzGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

      if ( ( nz != h && nz != h + 1 ) || z == 0 ) {

        dummy.geometry = nzGeometry;
        THREE.GeometryUtils.merge( geometry, dummy );

      }

    }

  }

  var texture = THREE.ImageUtils.loadTexture('asteroid.jpg');
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture, ambient: 0xbbbbbb } ) );
  scene.add( mesh );

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

  //

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

