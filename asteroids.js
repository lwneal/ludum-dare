var GRAVITATIONAL_CONSTANT = 0.01;
var PLANE_ATTRACTION_COEFF = 10;

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

  this.rvx = (Math.random() - 0.5) * 0.1;
  this.rvy = (Math.random() - 0.5) * 0.1;
  this.rvz = (Math.random() - 0.5) * 0.1;
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
      if (ast.mesh.position.y > 0) {
        ast.vy -= PLANE_ATTRACTION_COEFF;
      } else {
        ast.vy += PLANE_ATTRACTION_COEFF;
      }

      var astMass = ast.r * ast.r;

      // lol collision detection
      for (var j = 0; j < asteroids.length; j++) {
        if (i == j) continue;
        var bst = asteroids[j];

        // gravitation ?!
        var dx = (bst.mesh.position.x - ast.mesh.position.x);
        var dy = (bst.mesh.position.y - ast.mesh.position.y);
        var dz = (bst.mesh.position.z - ast.mesh.position.z);

        var distSq = dx*dx + dy*dy + dz*dz;
        bst.vx -= (dx / distSq) * astMass * GRAVITATIONAL_CONSTANT
        bst.vy -= (dy / distSq) * astMass * GRAVITATIONAL_CONSTANT;
        bst.vz -= (dz / distSq) * astMass * GRAVITATIONAL_CONSTANT;

        if (vecDistanceSq(ast.mesh.position, bst.mesh.position) < ast.r*ast.r + bst.r*bst.r) {
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
