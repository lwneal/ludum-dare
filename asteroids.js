var ASTEROID_RADIUS = 100*100*2;

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
  this.r = rand(1, 1000) * Math.random() * Math.random() * Math.random();
  this.mesh.scale.set(1 * this.r, 1 *this.r, 1 * this.r);
  this.mesh.position.x = (Math.random() - 0.5) * 10000;
  this.mesh.position.y = (Math.random() - 0.5) * 1000;
  this.mesh.position.z = (Math.random() - 0.5) * 10000;
  this.vx = (Math.random() - 0.5) * 1000;
  this.vy = (Math.random() - 0.5) * 100;
  this.vz = (Math.random() - 0.5) * 1000;
  scene.add(this.mesh);
};

var Asteroid = (function() {
  var init = function(geom_name) {
    for (var i = 0; i < 90; i++) {
      asteroids.push(new asteroid());
    }
  };

  var update = function(scale) {
    for (var i = 0; i < asteroids.length; i++) {
      var ast = asteroids[i];
      var forward = new THREE.Vector3(ast.vx, ast.vy, ast.vz);
      forward.multiplyScalar(scale);
      ast.mesh.position.add(forward);

      // wobble
      ast.vx += rand(-1,1);
      ast.vy += rand(-1,1);
      ast.vz += rand(-1,1);

      // dampen
      ast.vx *= 0.999;
      ast.vy *= 0.999;
      ast.vz *= 0.999;

      // Keep things close to the xz plane
      ast.vy -= 0.001 * ast.mesh.position.y;

      // lol collision detection
      for (var j = i + 1; j < asteroids.length; j++) {
        var bst = asteroids[j];

        // gravitation

        var dx = (bst.mesh.position.x - ast.mesh.position.x);
        var dy = (bst.mesh.position.y - ast.mesh.position.y);
        var dz = (bst.mesh.position.z - ast.mesh.position.z);

        var distSq = dx*dx + dy*dy + dz*dz;
        bst.vx -= (dx / distSq) * 100;
        bst.vy -= (dy / distSq) * 100;
        bst.vz -= (dz / distSq) * 100;

        if (vecDistanceSq(ast.mesh.position, bst.mesh.position) < ast.r*ast.r + bst.r*bst.r) {
          ast.vx += ast.mesh.position.x - bst.mesh.position.x;
          ast.vy += ast.mesh.position.y - bst.mesh.position.y;
          ast.vz += ast.mesh.position.z - bst.mesh.position.z;

          bst.vx -= ast.mesh.position.x - bst.mesh.position.x;
          bst.vy -= ast.mesh.position.y - bst.mesh.position.y;
          bst.vz -= ast.mesh.position.z - bst.mesh.position.z;
        }
      }

    }
  }

  return {
    "init": init,
    "update": update
  };
})();
