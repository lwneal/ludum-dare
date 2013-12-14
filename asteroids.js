var rand = function(min, max) {
  return min + (Math.random() * (max - min));
};

function asteroid() {
  this.mesh = new THREE.Mesh(Assets.get("ast1"), new THREE.MeshLambertMaterial());
  this.mesh.scale.set(100, 100, 100);
  this.mesh.position.x = (Math.random() - 0.5) * 10000;
  this.mesh.position.y = (Math.random() - 0.5) * 10000;
  this.mesh.position.z = (Math.random() - 0.5) * 10000;
  this.vx = (Math.random() - 0.5) * 1;
  this.vy = (Math.random() - 0.5) * 1;
  this.vz = (Math.random() - 0.5) * 1;
  scene.add(this.mesh);
};

var Asteroid = (function() {
  var init = function(geom_name) {
    for (var i = 0; i < 20; i++) {
      asteroids.push(new asteroid());
    }
  };

  var update = function(scale) {
    for (i in asteroids) {
      var ast = asteroids[i];
      var forward = new THREE.Vector3(ast.vx, ast.vy, ast.vz);
      forward.multiplyScalar(scale);
      ast.mesh.position.add(forward);

      // acceleration of some sort?
      ast.vx += (player_ship_mesh.position.x - ast.mesh.position.x) / 100;
      ast.vy += (player_ship_mesh.position.y - ast.mesh.position.y) / 100;
      ast.vz += (player_ship_mesh.position.z - ast.mesh.position.z) / 100;

      ast.vx += rand(-100,100);
      ast.vy += rand(-100,100);
      ast.vz += rand(-1,1);
    }
  }

  return {
    "init": init,
    "update": update
  };
})();
