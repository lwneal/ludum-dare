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

    var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
    var right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.mesh.quaternion);
    var to_target = new THREE.Vector3().subVectors(target.mesh.position, this.mesh.position).normalize();

    var fdot = forward.dot(to_target);
    var turn = (fdot > 0) ? (1 - fdot) : 1;
    var dir = right.dot(to_target);
    if (dir > 0) turn = -turn;
    
    this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 8.0 * turn * scale);
    forward.multiplyScalar(scale * 25.0);
    this.mesh.position.add(forward);


    // Check for collisions
    var objs = collisions(this);
    _.each(objs, function(o) {
      if (o.type() == "asteroid") {
        this.remove();
      }
    });

    //this.particles.update(scale);
  };

  this.remove = function() {
    scene.remove(this.mesh);
    missiles = _.without(missiles, this);
  };
}
