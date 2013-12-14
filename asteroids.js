var ASTEROID_RADIUS = 100*100;

function rand(min, max) {
  return min + (Math.random() * (max - min));
};

function vecDistanceSq(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  var dz = a.z - b.z;
  return dx*dx + dy*dy + dz*dz;
}

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
    for (var i = 0; i < asteroids.length; i++) {
      var ast = asteroids[i];
      var forward = new THREE.Vector3(ast.vx, ast.vy, ast.vz);
      forward.multiplyScalar(scale);
      ast.mesh.position.add(forward);

      // follow the player
      ast.vx += (player_ship_mesh.position.x - ast.mesh.position.x) / 100;
      ast.vy += (player_ship_mesh.position.y - ast.mesh.position.y) / 100;
      ast.vz += (player_ship_mesh.position.z - ast.mesh.position.z) / 100;

      // wobble
      ast.vx += rand(-1,1);
      ast.vy += rand(-1,1);
      ast.vz += rand(-1,1);

      // dampen
      ast.vx *= 0.999;
      ast.vy *= 0.999;
      ast.vz *= 0.999;

      // lol collision detection
      for (var j = i + 1; j < asteroids.length; j++) {
        var bst = asteroids[j];
        if (vecDistanceSq(ast.mesh.position, bst.mesh.position) < ASTEROID_RADIUS) {
          ast.vx += ast.mesh.position.x - bst.mesh.position.x;
          ast.vy += ast.mesh.position.y - bst.mesh.position.y;
          ast.vz += ast.mesh.position.z - bst.mesh.position.z;
        }
      }

    }
  }

  return {
    "init": init,
    "update": update
  };
})();
