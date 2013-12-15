var NUM_PARTICLES = 1000;
var PlayerShip = (function(){
  var init = function() {
    this.r = 5;
    this.enabled = true;
    this.mesh = new THREE.Mesh(Assets.get("player_ship"), new THREE.MeshLambertMaterial({color: 0x0080FF, ambient: 0x004080}));
    this.mesh.scale.set(this.r, this.r, this.r);
    scene.add(this.mesh);

    this.particles = new THREE.Geometry();
    this.particleMaterial = new THREE.ParticleSystemMaterial({
      color: 0xFF0000, 
      size: 12, 
      sizeAttenuation: false, 
      fog: false,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    for (var i = 0; i < NUM_PARTICLES; i++) {
      var particlePos = new THREE.Vector3(rand(-1,1), rand(-1,1), rand(-1,1));
      this.particles.vertices.push(particlePos);
    }
    this.particleSystem = new THREE.ParticleSystem(this.particles, this.particleMaterial);
    this.particleSystem.sortParticles = true;
    scene.add(this.particleSystem);

    this.missiles_left = 1;

    this.bounds = {obj: this};
  };

  var updateParticles = function(particles) {
    for (var i = 0; i < NUM_PARTICLES; i++) {
      var particlePos = particles.vertices[i];
      if (Math.random() < 0.1) { 
        particlePos.copy(PlayerShip.mesh.position);
      }

      particlePos.x += rand(-1, 1);
      particlePos.y += rand(-1, 1);
      particlePos.z += rand(-1, 1);
    }
  };

  var update = function(scale) {
    if (keyboard.pressed('A')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 1.0 * scale);
    }
    if (keyboard.pressed('D')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1.0 * scale);
    }
    if (keyboard.pressed('Q')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), 1.0 * scale);
    }
    if (keyboard.pressed('E')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), -1.0 * scale);
    }
    if (keyboard.pressed('R')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), 1.0 * scale);
    }
    if (keyboard.pressed('F')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -1.0 * scale);
    }

    var ship_forward = new THREE.Vector3(0, 0, -1);
    ship_forward.applyQuaternion(this.mesh.quaternion);
    ship_forward.multiplyScalar(scale * 100.0);

    this.mesh.position.add(ship_forward);
    if (keyboard.pressed('W')) {
      this.mesh.position.add(ship_forward);
    }
    if (keyboard.pressed('S')) {
      this.mesh.position.add(ship_forward.negate());
    }

    if (keyboard.pressed('space')) {
      if (this.missiles_left > 0) {
        this.missiles_left -= 1;
        var m = new Missile(true);
        m.mesh.applyMatrix(this.mesh.matrixWorld);
        missiles.push(m);

        this.mesh.remove(camera);
        m.mesh.add(camera);
        this.enabled = false;
      }
    }
    
    /*
    // Wrap around
    if (this.mesh.position.x < BOUNDS.x) {
      this.mesh.position.x += BOUNDS.width;
    }
    if (this.mesh.position.x > BOUNDS.x + BOUNDS.width) {
      this.mesh.position.x -= BOUNDS.width;
    }
    if (this.mesh.position.z < BOUNDS.y) {
      this.mesh.position.z += BOUNDS.height;
    }
    if (this.mesh.position.z > BOUNDS.y + BOUNDS.height) {
      this.mesh.position.z -= BOUNDS.height;
    }
    */

    updateParticles(this.particles);
  };

  return {
    init: init,
    update: update,
    type: function() { return "player_ship" },
  };
})();
