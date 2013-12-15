function MissileExhaustParticles(missile) {
  var color = missile.friendly ? 0x0000FF : 0xFF0000;
  return new FireParticleSource(missile.mesh, 100, color);
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
  this.mesh = new THREE.Mesh(Assets.get("missile"), new THREE.MeshLambertMaterial({color: color, ambient: acolor, fog: false}));
  this.mesh.scale.set(this.r, this.r, this.r);
  scene.add(this.mesh);

  this.bounds = {obj: this};
  this.particles = new MissileExhaustParticles(this);

  this.update = function(scale) {
    var target = (this.friendly) ? TargetEnemy : PlayerShip;

    var turn = turn_towards(this.mesh, target.mesh);
    this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 2.0 * turn * scale);

    var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion);
    var speed = (1.0 - Math.abs(turn)) * 120.0;
    if (this.friendly) speed *= 1.5;
    forward.multiplyScalar(scale * speed);
    this.mesh.position.add(forward);

    this.particles.update();
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
