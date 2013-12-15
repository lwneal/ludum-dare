function MissileExhaustParticles(missile) {
  this.missile = missile;

  this.particles = new THREE.Geometry();
  this.lifetimes = [];
  var mat = new THREE.ParticleSystemMaterial({
    color: 0xFFFFFF,
    size: 50,
    sizeAttenuation: false
  });

  for (var i = 0; i < 100; i++) {
    this.particles.vertices.push(new THREE.Vector3(this.missile.mesh.position));
    this.lifetimes.push(i);
  }

  this.system = new THREE.ParticleSystem(this.particles, mat);
  scene.add(this.system);
  console.log("Added system");
  console.log(this.system.position);


  this.spawnPosition = function() {
    return this.missile.mesh.position;
  };

  this.update = function(scale) {
    /*var backward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.missile.mesh.quaternion);
    backward.multiplyScalar(scale);

    self = this;
    _.each(this.particles.vertices, function(p, ix) {
      p.add(backward);
      self.lifetimes[ix] += 1;
      if (self.lifetimes[ix] >= 100) {
        self.lifetimes[ix] = 0;
        p.set(self.spawnPosition());
      }
    });*/
  };
}

function Missile(friendly) {
  this.friendly = friendly;

  var color;
  if (friendly) {
    color = 0x0080FF;
    acolor = 0x004080;
  }
  else {
    color = 0xFF0000;
    acolor = 0x800000;
  }

  this.r = 10;
  this.mesh = new THREE.Mesh(Assets.get("missile"), new THREE.MeshLambertMaterial({color: color, ambient: acolor}));
  this.mesh.scale.set(this.r, this.r, this.r);
  scene.add(this.mesh);

  this.bounds = {obj: this};
  //this.particles = new MissileExhaustParticles(this);

  this.update = function(scale) {
    var target = (this.friendly) ? TargetEnemy : PlayerShip;

    var turn = turn_towards(this.mesh, target.mesh);
    this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 4.0 * turn * scale);

    var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
    var speed = (1.0 - Math.abs(turn)) * 110.0;
    forward.multiplyScalar(scale * speed);
    this.mesh.position.add(forward);

    //this.particles.update(scale);
    this.updateBounds();
  };

  this.updateBounds = function() {
    this.bounds.x = this.mesh.position.x - this.r;
    this.bounds.y = this.mesh.position.z - this.r;
    this.bounds.width = this.r * 2;
    this.bounds.height = this.r * 2;
  };

  this.type = function() { return "missile" };
}
