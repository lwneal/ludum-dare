var TargetEnemy = (function(){
  var init = function(geom_name) {
    this.rot = 0.0;
    this.mesh = new THREE.Mesh(Assets.get(geom_name), new THREE.MeshBasicMaterial());
    this.mesh.scale.set(100, 100, 100);
    scene.add(this.mesh);
  }

  var update = function(scale) {
    var forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.mesh.quaternion);
    forward.multiplyScalar(scale * 500.0);

    this.mesh.position.add(forward);
    this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.sin(this.rot) * scale);
    this.rot += scale;
  };

  return {
    "init": init,
    "update": update
  };
})();
