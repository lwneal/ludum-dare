var Stars = (function(){
  var init = function() {
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
  };

  var update = function(scale) {
  };

  return {
    init: init,
    update: update
  };
})();
