/*
 * source: a THREE.Vector3 such as PlayerShip.mesh.position
 * density: number of particles 
 * color: 0xFF0000 for red
 * lifetime: in seconds, average lifetime
 */
var FireParticleSource = function(source, density, color) {
  this.source = source;
  this.density= density;
  this.color = color;
  // TODO: Calculate a death rate for a given target average lifespan
  this.deathrate = 0.1;

  this.geometry = new THREE.Geometry();
  for (var i = 0; i < density; i++) {
    var vertex = randVect(0,1);
    this.geometry.vertices.push(vertex);
  }

  this.material = new THREE.ParticleSystemMaterial({
    color: color,
    size: 1, 
    sizeAttenuation: true, 
    fog: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    map: THREE.ImageUtils.loadTexture("assets/particle.png")
  });

  this.system = new THREE.ParticleSystem(this.geometry, this.material);
  this.system.sortParticles = true;
  scene.add(this.system);

  this.bounds = {obj: this};
  this.type = function() { return "particle_system"; };

  this.update = function(source) {
    var jitter = 0.6;
    for (var i = 0; i < this.density; i++) {
      var pos = this.geometry.vertices[i];
      if (Math.random() < this.deathrate) {
        pos.copy(source);
      }
      pos.x += rand(-jitter, jitter);
      pos.y += rand(-jitter, jitter);
      pos.z += rand(-jitter, jitter);
    }
  };
};
