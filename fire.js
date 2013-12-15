/*
 * source: a mesh with a .position that is a THREE.Vector3
 * density: number of particles 
 * color: 0xFF0000 for red
 * lifetime: in seconds, average lifetime
 */
var FireParticleSource = function(source, density, color) {
  this.source = source;
  this.sourceLastPosition = new THREE.Vector3(source.position);
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

  this.jitter = 0.6;
  this.movement = new THREE.Vector3();
  this.update = function() {

    for (var i = 0; i < this.density; i++) {
      var pos = this.geometry.vertices[i];
      if (Math.random() < this.deathrate) {
        this.movement.subVectors(this.source.position, this.sourceLastPosition);
        pos.copy(this.source.position);
        pos.sub(this.movement);
        this.movement.multiplyScalar(Math.random());
        pos.sub(this.movement);
      }
      pos.x += rand(-this.jitter, this.jitter);
      pos.y += rand(-this.jitter, this.jitter);
      pos.z += rand(-this.jitter, this.jitter);
    }
    this.sourceLastPosition.copy(this.source.position);
  };
};
