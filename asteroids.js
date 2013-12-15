var ASTEROID_DESPAWN_DIST = 400;
var ASTEROID_SPAWN_DIST = 1000;

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

function asteroid() {
  this.mesh = new THREE.Mesh(Assets.get("ast1"), new THREE.MeshLambertMaterial({color: 0x606060, ambient: 0x202020}));

  this.deatomizing = false;
  this.r = rand(8, 30);
  this.mesh.scale.set(1 * this.r, 1 *this.r, 1 * this.r);
  this.mesh.position.x = rand(BOUNDS.x, (BOUNDS.x + BOUNDS.width));
  this.mesh.position.y = rand(BOTTOM, TOP);
  this.mesh.position.z = rand(BOUNDS.y, (BOUNDS.y + BOUNDS.height));

  if (isTooCloseToOrigin(this.mesh.position)) {
    this.mesh.position.x += BOUNDS.x / 2;
  }

  var pos = new THREE.Vector3(this.mesh.position);
  pos.normalize();

  this.vx = (Math.random() - 0.5) * 20;
  this.vy = (Math.random() - 0.5) * 40;
  this.vz = (Math.random() - 0.5) * 20;

  this.rvx = (Math.random() - 0.5) * 0.1;
  this.rvy = (Math.random() - 0.5) * 0.1;
  this.rvz = (Math.random() - 0.5) * 0.1;

  scene.add(this.mesh);
  scene.add(this.bizzaroMesh);

  var planeMat = new THREE.MeshBasicMaterial({
    wireframe: true
  });
  this.planeMesh = new THREE.Mesh(new THREE.CircleGeometry(this.r, 15), planeMat);
  this.planeMesh.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
  scene.add(this.planeMesh);

  /*
  var boxMat = new THREE.MeshBasicMaterial({
    wireframe: true
  });
  this.boxMesh = new THREE.Mesh(new THREE.CubeGeometry(this.r*2, this.r*2, this.r*2), boxMat);
  scene.add(this.boxMesh);
  */

  this.bounds = {obj: this};
  this.type = function() { return "asteroid"; };
  this.updateBounds = function() {
    var radiusMult = 2.0;
    this.bounds.x = this.mesh.position.x - this.r * radiusMult;
    this.bounds.y = this.mesh.position.z - this.r * radiusMult;
    this.bounds.width = 2 * this.r* radiusMult;
    this.bounds.height = 2 * this.r* radiusMult;
    this.bounds.obj = this;

    this.planeMesh.position.set(this.mesh.position.x, 0, this.mesh.position.z);
    if (Math.abs(this.mesh.position.y) < this.r) {
      this.planeMesh.material.color.setHex(0x600000);
    }
    else {
      this.planeMesh.material.color.setHex(0x111111);
    }

    //this.boxMesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
  };
};

var axx = new THREE.Vector3(1, 0, 0);
var axy = new THREE.Vector3(0, 1, 0);
var axz = new THREE.Vector3(0, 0, 1);
function asteroidMove(ast, scale) {
  var forward = new THREE.Vector3(ast.vx, ast.vy, ast.vz);
  forward.multiplyScalar(scale);
  ast.mesh.position.add(forward);

  // wobble
  ast.vx += rand(-1,1) * scale;
  ast.vy += rand(-1,1) * scale;
  ast.vz += rand(-1,1) * scale;

  // Keep things close to the xz plane
  //ast.vy -= 0.02 * ast.mesh.position.y;

  // rotate around!
  ast.mesh.rotateOnAxis(axx, ast.rvx * scale);
  ast.mesh.rotateOnAxis(axy, ast.rvy * scale);
  ast.mesh.rotateOnAxis(axz, ast.rvz * scale);

  /*
  // Wrap around
  if (ast.mesh.position.x < BOUNDS.x) {
    ast.mesh.position.x += BOUNDS.width;
  }
  if (ast.mesh.position.x > BOUNDS.x + BOUNDS.width) {
    ast.mesh.position.x -= BOUNDS.width;
  }
  if (ast.mesh.position.z < BOUNDS.y) {
    ast.mesh.position.z += BOUNDS.height;
  }
  if (ast.mesh.position.z > BOUNDS.y + BOUNDS.height) {
    ast.mesh.position.z -= BOUNDS.height;
  }
  if (ast.mesh.position.y < BOTTOM && ast.vy < 0) {
    ast.vy *= -1;
  }
  if (ast.mesh.position.y > TOP && ast.vy > 0) {
    ast.vy *= -1;
  }
  */

  ast.updateBounds();
}

function isInFrontOfPlayer(pos) {
  var playerDirection = new THREE.Vector3( 0, 0, -1 );
  playerDirection.applyQuaternion( PlayerShip.mesh.quaternion );

  var dot = playerDirection.dot(pos);

  return dot > 0;
}

function asteroidRespawnCheck(ast, scale) {
  var posRelativeToPlayer = new THREE.Vector3();
  posRelativeToPlayer.subVectors(ast.mesh.position, PlayerShip.mesh.position);

  var distFromPlayer = posRelativeToPlayer.length();

  if (!isInFrontOfPlayer(posRelativeToPlayer) && distFromPlayer > ASTEROID_DESPAWN_DIST) {
    var spawnDirection = new THREE.Vector3(rand(-1,1), rand(-.2, .2), rand(-1,1));
    spawnDirection.normalize();
    spawnDirection.multiplyScalar(ASTEROID_SPAWN_DIST);

    //ast.mesh.position = new THREE.Vector3(PlayerShip.mesh.position);
    //ast.mesh.position.add(spawnDirection);
    ast.mesh.position.x = TargetEnemy.mesh.position.x + spawnDirection.x;
    ast.mesh.position.y = TargetEnemy.mesh.position.y + spawnDirection.y;
    ast.mesh.position.z = TargetEnemy.mesh.position.z + spawnDirection.z;
  }
  
}

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
  var astMass = ast.r * ast.r;

  // gravitation ?!
  var dx = (bst.mesh.position.x - ast.mesh.position.x);
  var dy = (bst.mesh.position.y - ast.mesh.position.y);
  var dz = (bst.mesh.position.z - ast.mesh.position.z);

  var distSq = dx*dx + dy*dy + dz*dz;
  bst.vx -= (dx / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;
  bst.vy -= (dy / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;
  bst.vz -= (dz / distSq) * astMass * GRAVITATIONAL_CONSTANT * scale;

  if (vecDistanceSq(ast.mesh.position, bst.mesh.position) / 2 < ast.r*ast.r + bst.r*bst.r) {
    asteroidCollide(ast, bst);
  }
}

function calculateGravityCenter() {
  var gravity = new THREE.Vector3(0,0,0);
  for (i in asteroids) {
    var ast = asteroids[i];
    gravity.x += ast.mesh.position.x;
    gravity.y += ast.mesh.position.y;
    gravity.z += ast.mesh.position.z;
  }
  gravity.x /= asteroids.length;
  gravity.y /= asteroids.length;
  gravity.z /= asteroids.length;
  return gravity;
}

var gravitate = function(obj, c, scale) {
  var dx = obj.mesh.position.x - c.x;
  var dy = obj.mesh.position.y - c.y;
  var dz = obj.mesh.position.z - c.z;

  obj.vx += 1 / (dx*dx);
  obj.vy += 1 / (dy*dy);
  obj.vz += 1 / (dz*dz);
};

var Asteroid = (function() {
  var init = function(geom_name) {
    for (var i = 0; i < 600; i++) {
      asteroids.push(new asteroid());
    }
  };

  var update = function(scale) {
    var gravity = calculateGravityCenter();

    for (var i = 0; i < asteroids.length; i++) {
      var ast = asteroids[i];
      asteroidMove(ast, scale);
      asteroidRespawnCheck(ast, scale);
      if (rand(1,100) == 42) {
        ast.deatomizing = true;
      }
      if (ast.deatomizing) {
        ast.mesh.material.color.setHex(0xFF0000);
      }
    }
  }

  return {
    "init": init,
    "update": update
  };
})();
