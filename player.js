var PlayerShip = (function(){
  var init = function() {
    this.r = 5;
    this.mesh = new THREE.Mesh(Assets.get("player_ship"), new THREE.MeshLambertMaterial({color: 0x0080FF, ambient: 0x004080}));
    this.mesh.scale.set(this.r, this.r, this.r);
    scene.add(this.mesh);

    this.bounds = {obj: this};
  };

  var update = function(scale) {
    if (keyboard.pressed('A')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 1.0 * scale);
    }
    if (keyboard.pressed('D')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -1.0 * scale);
    }
    if (keyboard.pressed('Q')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), 1.0 * scale);
    }
    if (keyboard.pressed('E')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), -1.0 * scale);
    }
    if (keyboard.pressed('R')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), 1.0 * scale);
    }
    if (keyboard.pressed('F')) {
      this.mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -1.0 * scale);
    }

    var ship_forward = new THREE.Vector3(0, 0, -1);
    ship_forward.applyQuaternion(this.mesh.quaternion);
    ship_forward.multiplyScalar(scale * 100.0);

    //this.mesh.position.add(ship_forward);
    if (keyboard.pressed('W')) {
      this.mesh.position.add(ship_forward);
    }
    if (keyboard.pressed('S')) {
      this.mesh.position.add(ship_forward.negate());
    }
  };

  return {
    init: init,
    update: update
  };
})();
