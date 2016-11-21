var Fish = function () {
	THREE.PlaneGeometry.call( this, 10, 8, 2, 1 );
};

Fish.prototype = new THREE.PlaneGeometry();
Fish.prototype.constructor = Fish;

var FishMesh = function () {
  THREE.Mesh.call(this,
    new Fish(),
    new THREE.MeshBasicMaterial( { 
      map: THREE.ImageUtils.loadTexture( 'assets/img/fish-texture.png' ), 
      // blending: THREE.AdditiveBlending, 
      transparent:true, 
      opacity:1.0,
      overdraw: true, 
      side: THREE.DoubleSide } )
  );

  this.phase = Math.floor( Math.random() * 62.83 );
};

FishMesh.prototype = new THREE.Mesh();
FishMesh.prototype.constructor = FishMesh;

FishMesh.prototype.updateCourse = function(boid) {
  // console.log('before');
  // console.log(this.position);
  this.position.copy(boid.position);
  // console.log('after');
  // console.log(this.position);

};