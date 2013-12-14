var rand = function(min, max) {
  return min + (Math.random() * (max - min));
};

var Asteroid = (function() {
  var init = function(geom_name) {
    this.mesh = new THREE.Mesh(Assets.get(geom_name), new THREE.MeshBasicMaterial());
    this.mesh.scale.set(100, 100, 100);
    this.mesh.position.x = (Math.random() - 0.5) * 10000;
    this.mesh.position.y = (Math.random() - 0.5) * 10000;
    this.mesh.position.z = (Math.random() - 0.5) * 10000;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.vz = (Math.random() - 0.5) * 1;
    scene.add(this.mesh);
    asteroids.push(this);
  };

  var update = function(scale) {
    var forward = new THREE.Vector3(this.vx, this.vy, this.vz);
    forward.multiplyScalar(scale);
    this.mesh.position.add(forward);

    // acceleration of some sort?
    this.vx += (player_ship_mesh.position.x - this.mesh.position.x) / 100;
    this.vy += (player_ship_mesh.position.y - this.mesh.position.y) / 100;
    this.vz += (player_ship_mesh.position.z - this.mesh.position.z) / 100;

    this.vx += rand(-100,100);
    this.vy += rand(-100,100);
    this.vz += rand(-1,1);
  }

  return {
    "init": init,
    "update": update
  };
})();
