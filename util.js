function rand(min, max) {
  return min + (Math.random() * (max - min));
};

function randVect(min, max) {
  var v = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5);
  v.normalize();
  v.multiplyScalar(rand(min,max));
  return v;
}
