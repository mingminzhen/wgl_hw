
var Fish = function () {
	THREE.PlaneGeometry.call( this, 30, 15, 2, 1 );
};

Fish.prototype = new THREE.PlaneGeometry();
Fish.prototype.constructor = Fish;

var FishMesh = function () {
  THREE.Mesh.call(this,
    new Fish(),
    new THREE.MeshBasicMaterial( { 
      map: THREE.ImageUtils.loadTexture( 'img/fish-texture.png' ), 
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
  // var phase = this.phase,
  //     rotation = this.rotation,
  //     geometry = this.geometry,
  //     boidVelocity = boid.velocity;
  


  this.position.copy(boid.position);
  // rotation.y = Math.atan2( - boidVelocity.z, boidVelocity.x );
  // rotation.z = Math.asin( boidVelocity.y/boidVelocity.length  ) * 0.2; //reduce fish's vertical rotation

  // phase = ( phase + ( Math.max( 0, rotation.z ) + 0.1 )  ) % 62.83;
  
  // // console.log('111111111');
  // // console.log(geometry);
  // // console.log('222222222');
  // geometry.vertices[ 3 ].z = geometry.vertices[ 0 ].z = Math.sin( phase ) * 5;

  // this.phase = phase;

};
