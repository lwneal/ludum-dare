var GRAVITATIONAL_CONSTANT = 0.50;
var PLANE_ATTRACTION_COEFF = 40;

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
  this.r = rand(1, 1000) * Math.random() * Math.random() * Math.random() / 2;
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

  var mat = new THREE.MeshBasicMaterial({
    wireframe: true
  });
  this.planeMesh = new THREE.Mesh(new THREE.CircleGeometry(this.r, 15), mat);
  this.planeMesh.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
  scene.add(this.planeMesh);

  this.bounds = {obj: this};
  this.updateBounds = function() {
    this.bounds.x = this.mesh.position.x - this.r;
    this.bounds.y = this.mesh.position.z - this.r;
    this.bounds.width = 2 * this.r;
    this.bounds.height = 2 * this.r;
    this.bounds.obj = this;

    this.planeMesh.position.set(this.mesh.position.x, 0, this.mesh.position.z);
    if (Math.abs(this.mesh.position.y) < this.r * 2) {
      this.planeMesh.material.color.setHex(0xFF0000);
    }
    else {
      this.planeMesh.material.color.setHex(0x444444);
    }
  };
  this.updateBounds();
};

function asteroidMove(ast, scale) {
  var forward = new THREE.Vector3(ast.vx, ast.vy, ast.vz);
  forward.multiplyScalar(scale);
  ast.mesh.position.add(forward);

  // wobble
  ast.vx += rand(-1,1) * scale;
  ast.vy += rand(-1,1) * scale;
  ast.vz += rand(-1,1) * scale;

  // dampen
  ast.vx *= 0.999;
  ast.vy *= 0.999;
  ast.vz *= 0.999;

  // Keep things close to the xz plane
  if (ast.mesh.position.y > 0) {
    ast.vy -= PLANE_ATTRACTION_COEFF * scale;
  } else {
    ast.vy += PLANE_ATTRACTION_COEFF * scale;
  }

  // rotate around!
  var axx = new THREE.Vector3(1, 0, 0);
  var axy = new THREE.Vector3(0, 1, 0);
  var axz = new THREE.Vector3(0, 0, 1);
  ast.mesh.rotateOnAxis(axx, ast.rvx * scale);
  ast.mesh.rotateOnAxis(axy, ast.rvy * scale);
  ast.mesh.rotateOnAxis(axz, ast.rvz * scale);
}

function asteroidInteract(ast, bst, scale) {
  var astMass = ast.r * ast.r;

  // gravitation ?!
  var dx = (bst.mesh.position.x - ast.mesh.position.x);
  var dy = (bst.mesh.position.y - ast.mesh.position.y);
  var dz = (bst.mesh.position.z - ast.mesh.position.z);

  var distSq = dx*dx + dy*dy + dz*dz;
  bst.vx -= (dx / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;
  bst.vy -= (dy / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;
  bst.vz -= (dz / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;

  if (vecDistanceSq(ast.mesh.position, bst.mesh.position) < ast.r*ast.r + bst.r*bst.r) {
    ast.vx += ast.mesh.position.x - bst.mesh.position.x;
    ast.vy += ast.mesh.position.y - bst.mesh.position.y;
    ast.vz += ast.mesh.position.z - bst.mesh.position.z;

    ast.rvx += Math.random() - 0.5;
    ast.rvy += Math.random() - 0.5;
    ast.rvz += Math.random() - 0.5;
  }
}

var Asteroid = (function() {
  var init = function(geom_name) {
    for (var i = 0; i < 100; i++) {
      asteroids.push(new asteroid());
    }
  };

  var update = function(scale) {
    for (var i = 0; i < asteroids.length; i++) {
      var ast = asteroids[i];
      //asteroidMove(ast, scale);
      ast.updateBounds();

      // lol collision detection
      for (var j = 0; j < asteroids.length; j++) {
        if (i == j) continue;
        var bst = asteroids[j];
        asteroidInteract(ast, bst, scale);
      }

    }
  }

  return {
    "init": init,
    "update": update
  };
})();
