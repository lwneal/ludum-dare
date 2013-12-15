var ASTEROID_DESPAWN_DIST = 1000;
var ASTEROID_SPAWN_DIST = 1000;
var axx = new THREE.Vector3(1, 0, 0);
var axy = new THREE.Vector3(0, 1, 0);
var axz = new THREE.Vector3(0, 0, 1);

function rand(min, max) {
  return min + (Math.random() * (max - min));
};

function vecDistanceSq(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  var dz = a.z - b.z;
  return dx*dx + dy*dy + dz*dz;
}

function isTooCloseToOrigin(position) {
  return -100 < position.x && position.x < 100
    && -100 < position.z && position.z < 100;
}

function Asteroid() {
  this.r = rand(8, 30);
  this.type = function() { return "asteroid"; };
  this.bounds = {obj: this};
  this.respawn = function() {
    var spawnDirection = new THREE.Vector3(rand(-1,1), rand(-.7, .7), rand(-1,1));
    spawnDirection.normalize();
    spawnDirection.multiplyScalar(ASTEROID_SPAWN_DIST);

    this.mesh.position.copy(PlayerShip.mesh.position);
    this.mesh.position.add(spawnDirection);

    this.v = randVect(0, 50);
    this.rv = randVect(0, 1);
  };

  this.updateBounds = function() {
    this.planeMesh.position.set(this.mesh.position.x, 0, this.mesh.position.z);
    if (Math.abs(this.mesh.position.y) < this.r) {
      this.planeMesh.material.color.setHex(0x900000);
    }
    else {
      this.planeMesh.material.color.setHex(0x111111);
    }
  };

  this.update = function(scale) {
    // Respawn if out of view
    var distFromPlayer = this.mesh.position.distanceTo(PlayerShip.mesh.position);
    if (distFromPlayer > ASTEROID_DESPAWN_DIST) {
      this.respawn();
    }

    // wobble
    this.v.x += rand(-scale, scale);
    this.v.y += rand(-scale, scale);
    this.v.z += rand(-scale, scale);

    // rotate around!
    this.mesh.rotateOnAxis(axx, this.rv.x * scale);
    this.mesh.rotateOnAxis(axy, this.rv.y * scale);
    this.mesh.rotateOnAxis(axz, this.rv.z * scale);

    // Invisible walls on top/bottom
    if (this.mesh.position.y < BOTTOM) {
      this.mesh.position.y = BOTTOM;
      this.v.y = Math.abs(this.v.y);
    } else if (this.mesh.position.y > TOP) {
      this.mesh.position.y = TOP;
      this.v.y = -Math.abs(this.v.y);
    }

    // move
    this.mesh.position.x += this.v.x * scale;
    this.mesh.position.y += this.v.y * scale;
    this.mesh.position.z += this.v.z * scale;

    this.updateBounds();
  };

  this.mesh = new THREE.Mesh(Assets.get("ast1"), new THREE.MeshLambertMaterial({color: 0x606060, ambient: 0x202020}));
  this.mesh.scale.set(1 * this.r, 1 *this.r, 1 * this.r);
  scene.add(this.mesh);

  this.planeMat = new THREE.MeshBasicMaterial({ wireframe: true });
  this.planeMesh = new THREE.Mesh(new THREE.CircleGeometry(this.r, 15), this.planeMat);
  this.planeMesh.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
  scene.add(this.planeMesh);

  this.respawn();
};

function asteroidCollide(ast, bst) {
  var astmass = ast.r*ast.r;
  var bstmass = bst.r*bst.r;

  var diff = new THREE.Vector3(
      ast.mesh.position.x - bst.mesh.position.x,
      ast.mesh.position.y - bst.mesh.position.y,
      ast.mesh.position.z - bst.mesh.position.z);
  diff.normalize();

  ast.vx += bstmass / astmass * diff.x / 10;
  ast.vy += bstmass / astmass * diff.y / 10;
  ast.vz += bstmass / astmass * diff.z / 10;

  ast.rvx += Math.random() - 0.5;
  ast.rvy += Math.random() - 0.5;
  ast.rvz += Math.random() - 0.5;

  ast.rvx *= 0.9;
  ast.rvy *= 0.9;
  ast.rvz *= 0.9;
}

function asteroidInteract(ast, bst, scale) {
  // Asteroids gravitate toward each other
  var astMass = ast.r * ast.r;
  var bstMass = bst.r * bst.r;
  var dx = (bst.mesh.position.x - ast.mesh.position.x);
  var dy = (bst.mesh.position.y - ast.mesh.position.y);
  var dz = (bst.mesh.position.z - ast.mesh.position.z);

  var distSq = dx*dx + dy*dy + dz*dz;
  bst.v.x -= (dx / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;
  bst.v.y -= (dy / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;
  bst.v.z -= (dz / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;

  ast.v.x += (dx / distSq) * bstMass * GRAVITATIONAL_CONSTANT * scale;
  ast.v.y += (dy / distSq) * bstMass * GRAVITATIONAL_CONSTANT * scale;
  ast.v.z += (dz / distSq) * bstMass * GRAVITATIONAL_CONSTANT * scale;

  // Colliding asteroids bounce
  if (ast.mesh.position.distanceToSquared(bst.mesh.position) / 2 < ast.r*ast.r + bst.r*bst.r) {
    asteroidCollide(ast, bst);
  }
}

var AsteroidField = (function() {
  var init = function(geom_name) {
    for (var i = 0; i < 400; i++) {
      asteroids.push(new Asteroid());
    }
  };

  var update = function(scale) {
    for (var i = 0; i < asteroids.length; i++) {
      var ast = asteroids[i];
      ast.update(scale);
    }
  }

  return {
    "init": init,
    "update": update
  };
})();
