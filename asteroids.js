var GRAVITATIONAL_CONSTANT = 0.90;
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
  this.r = rand(1, 100) * Math.random() * Math.random() * Math.random() / 2;
  this.mesh.scale.set(1 * this.r, 1 *this.r, 1 * this.r);
  this.mesh.position.x = (Math.random() - 0.5) * 1000;
  this.mesh.position.y = (Math.random() - 0.5) * 100;
  this.mesh.position.z = (Math.random() - 0.5) * 1000;
  this.vx = (Math.random() - 0.5) * 100;
  this.vy = (Math.random() - 0.5) * .01;
  this.vz = (Math.random() - 0.5) * 100;

  this.rvx = (Math.random() - 0.5) * 0.1;
  this.rvy = (Math.random() - 0.5) * 0.1;
  this.rvz = (Math.random() - 0.5) * 0.1;
  scene.add(this.mesh);

  var planeMat = new THREE.MeshBasicMaterial({
    wireframe: true
  });
  this.planeMesh = new THREE.Mesh(new THREE.CircleGeometry(this.r, 15), planeMat);
  this.planeMesh.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
  scene.add(this.planeMesh);

  var boxMat = new THREE.MeshBasicMaterial({
    wireframe: true
  });
  this.boxMesh = new THREE.Mesh(new THREE.CubeGeometry(this.r*2, this.r*2, this.r*2), boxMat);
  scene.add(this.boxMesh);

  this.bounds = {obj: this};
  this.type = function() { return "asteroid"; };
  updateBounds(this);
};

function updateBounds(ast) {
  var radiusMult = 1.0;
  ast.bounds.x = ast.mesh.position.x - ast.r * radiusMult;
  ast.bounds.y = ast.mesh.position.z - ast.r * radiusMult;
  ast.bounds.width = 2 * ast.r* radiusMult;
  ast.bounds.height = 2 * ast.r* radiusMult;
  ast.bounds.obj = ast;

  ast.planeMesh.position.set(ast.mesh.position.x, 0, ast.mesh.position.z);
  if (Math.abs(ast.mesh.position.y) < ast.r * 2) {
    ast.planeMesh.material.color.setHex(0xFF0000);
  }
  else {
    ast.planeMesh.material.color.setHex(0x444444);
  }

  ast.boxMesh.position.set(ast.mesh.position.x, ast.mesh.position.y, ast.mesh.position.z);
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
  ast.vx *= 0.99;
  ast.vy *= 0.99;
  ast.vz *= 0.99;

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
  updateBounds(ast);
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

function calculateGravityCenter() {
  var gravity = new THREE.Vector3(0,0,0);
  for (i in asteroids) {
    var ast = asteroids[i];
    gravity.x += ast.mesh.position.x;
    gravity.y += ast.mesh.position.y;
    gravity.z += ast.mesh.position.z;
    ast.mesh.material.color.setHex(0xFFFFFF);
  }
  gravity.x /= asteroids.length;
  gravity.y /= asteroids.length;
  gravity.z /= asteroids.length;
  return gravity;
}

var gravitate = function(obj, c) {
  var dx = obj.mesh.position.x - c.x;
  var dy = obj.mesh.position.y - c.y;
  var dz = obj.mesh.position.z - c.z;

  obj.vx -= dx * .001;
  obj.vy -= dy * .001;
  obj.vz -= dz * .001;
};

var Asteroid = (function() {
  var init = function(geom_name) {
    for (var i = 0; i < 100; i++) {
      asteroids.push(new asteroid());
    }
  };

  var update = function(scale) {
    var gravity = calculateGravityCenter();

    for (var i = 0; i < asteroids.length; i++) {
      var ast = asteroids[i];
      gravitate(ast, gravity);
      asteroidMove(ast, scale);
    }
  }

  return {
    "init": init,
    "update": update
  };
})();
