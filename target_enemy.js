var TargetEnemy = (function(){
  var init = function(geom_name) {
    this.r = 10;

    this.mesh = new THREE.Mesh(Assets.get(geom_name), new THREE.MeshLambertMaterial({color: 0xFF0000, ambient: 0x800000, fog: false}));
    this.mesh.position.set(0, 0, -400);
    this.mesh.scale.set(this.r, this.r, this.r);
    scene.add(this.mesh);

    /*this.indicatorMesh = new THREE.Mesh(new THREE.CubeGeometry(this.r*2, this.r*2, this.r*2),
      new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true,
        depthTest: false
        }));
    overlay_scene.add(this.indicatorMesh);*/

    this.desired_turn = 0.0;
    this.bounds = {obj: this};
  }

  var update = function(scale) {
    var forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.mesh.quaternion);

    // Avoid asteroids
    var candidates = quadtree.retrieve({x: this.mesh.position.x - this.r * 4, y: this.mesh.position.z - this.r * 4, width: this.r * 8, height: this.r * 8});

    var closest_dist = Infinity;
    var closest = null;
    self = this;
    _.each(candidates, function(astb) {
      // Only consider asteroids close to the plane
      if (Math.abs(astb.obj.mesh.position.y) > astb.obj.r * 2.0) {
        return;
      }

      var diff = new THREE.Vector3().subVectors(self.mesh.position, astb.obj.mesh.position);
      var dist = diff.lengthSq();
      if (dist < closest_dist) {
        closest_dist = dist;
        closest = astb;
      }
    });

    if (closest !== null) {
      var turn = turn_towards(this.mesh, closest.mesh);
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -2.0 * turn * scale);
    }
    else {
      //this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.sin(this.desired_turn) * scale);
      this.desired_turn += scale / 4.0;
    }

    forward.multiplyScalar(scale * 100.0);
    this.mesh.position.add(forward);
    this.updateBounds();

    update_enemy_overlay(this.mesh);
  };

  var updateBounds = function() {
    this.bounds.x = this.mesh.position.x - this.r;
    this.bounds.y = this.mesh.position.z - this.r;
    this.bounds.width = this.r * 2;
    this.bounds.height = this.r * 2;
  };

  var type = function() {
    return "target_enemy";
  };

  return {
    "init": init,
    "update": update,
    "updateBounds": updateBounds,
    "type": type,
  };
})();
