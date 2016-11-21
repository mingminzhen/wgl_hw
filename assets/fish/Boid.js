var Boid = function(maxSpeed, maxSteerForce) {

  var vector = new THREE.Vector3(),
    _acceleration,
    _width = 500,
    _height = 500,
    _depth = 200,
    _neighborhoodRadius = 100,
    _maxSpeed = maxSpeed || 4,
    _maxSteerForce = maxSteerForce || 0.1,
    _avoidWalls = false,
    _goal,
    _flyHeight;

  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  _acceleration = new THREE.Vector3();
  this._initPos=new THREE.Vector3();
  this._endPos=new THREE.Vector3();




   this.setParas=function (initPos,endPos){
    this._initPos.copy(initPos);
    this._endPos.copy(endPos);
    console.log('2222222222222');
    console.log(this._initPos);
   }

  this.setGoal = function ( target ) {

    _goal = target;

  };

  this.setAvoidWalls = function ( value ) {

    _avoidWalls = value;

  };

  this.setWorldSize = function ( width, height, depth ) {

    _width = width;
    _height = height;
    _depth = depth;

  };
  this.compute=function(){

  }
  this.flying=function (boids){
    // console.log('mmmmmmmmmmmmmmmm');
    // console.log(this._initPos);
    // console.log(this._endPos);
    // console.log(this.position);
    var x,y,z;
    var speed=2;
    var n=100/speed;
    x=this.position.x+(this._endPos.x-this._initPos.x)/n;
    z=this.position.z+(this._endPos.z-this._initPos.z)/n;
    var dist=Math.sqrt(Math.pow(x-this._initPos.x,2)+Math.pow(z-this._initPos.z,2));
    var len =Math.sqrt(Math.pow(this._endPos.x-this._initPos.x,2)+Math.pow(this._endPos.z-this._initPos.z,2));
    y=dist*(len-dist)/5;
    this.position.x=x;
    this.position.y=y;
    this.position.z=z;
    // console.log(dist);
    // console.log(len);
     console.log(this.position);

  }
  this.run = function ( boids ) {

    if ( _avoidWalls ) {

      vector.set( - _width, this.position.y, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( _width, this.position.y, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, - _height, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, _height, this.position.z );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, this.position.y, - _depth );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

      vector.set( this.position.x, this.position.y, _depth );
      vector = this.avoid( vector );
      vector.multiplyScalar( 5 );
      _acceleration.add( vector );

    }/* else {

      this.checkBounds();

    }
    */

    if ( Math.random() > 0.5 ) {

      this.flock( boids );

    }

    this.move();

  };

  this.flock = function ( boids ) {

    if ( _goal ) {

      _acceleration.add( this.reach( _goal, 0.005 ) );

    }

    _acceleration.add( this.alignment( boids ) );
    _acceleration.add( this.cohesion( boids ) );
    _acceleration.add( this.separation( boids ) );

  };

  this.move = function () {

    this.velocity.add( _acceleration );

    var l = this.velocity.length();

    if ( l > _maxSpeed ) {

      this.velocity.divideScalar( l / _maxSpeed );

    }

    this.position.add( this.velocity );
    _acceleration.set( 0, 0, 0 );
    // if(this.position.y<=0){
    //   _acceleration.x=- _acceleration.x;
    //   _acceleration.y=-_acceleration.y;
    //   _acceleration.z=-_acceleration.z;
    // }

  };

  this.checkBounds = function () {

    if ( this.position.x >   _width ) this.position.x = - _width;
    if ( this.position.x < - _width ) this.position.x =   _width;
    if ( this.position.y >   _height ) this.position.y = - _height;
    if ( this.position.y < - _height ) this.position.y =  _height;
    if ( this.position.z >  _depth ) this.position.z = - _depth;
    if ( this.position.z < - _depth ) this.position.z =  _depth;

  };

  //
  this.avoid = function ( target ) {

    var steer = new THREE.Vector3();

    steer.copy( this.position );
    // steer.subSelf( target );
     steer.x=steer.x-target.x;
     steer.y=steer.y-target.y;
     steer.z=steer.z-target.z;
    steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

    return steer;

  };

  this.repulse = function ( target ) {

    var distance = this.position.distanceTo( target );

    if ( distance < 100 ) {

      var steer = new THREE.Vector3();

      steer.subVectors( this.position, target );
      steer.multiplyScalar( 0.5 / distance );

      _acceleration.add( steer );

    }

  };

  this.reach = function ( target, amount ) {

    var steer = new THREE.Vector3();

    steer.subVectors( target, this.position );
    steer.multiplyScalar( amount );

    return steer;

  };

  this.alignment = function ( boids ) {

    var boid, velSum = new THREE.Vector3(),
    count = 0;

    for ( var i = 0, il = boids.length; i < il; i++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];

      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {

        velSum.add( boid.velocity );
        count++;

      }

    }

    if ( count > 0 ) {

      velSum.divideScalar( count );

      var l = velSum.length();

      if ( l > _maxSteerForce ) {

        velSum.divideScalar( l / _maxSteerForce );

      }

    }

    return velSum;

  };

  this.cohesion = function ( boids ) {

    var boid, distance,
    posSum = new THREE.Vector3(),
    steer = new THREE.Vector3(),
    count = 0;

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {

        posSum.add( boid.position );
        count++;

      }

    }

    if ( count > 0 ) {

      posSum.divideScalar( count );

    }

    steer.subVectors( posSum, this.position );

    var l = steer.length();

    if ( l > _maxSteerForce ) {

      steer.divideScalar( l / _maxSteerForce );

    }

    return steer;

  };

  this.separation = function ( boids ) {

    var boid, distance,
    posSum = new THREE.Vector3(),
    repulse = new THREE.Vector3();

    for ( var i = 0, il = boids.length; i < il; i ++ ) {

      if ( Math.random() > 0.6 ) continue;

      boid = boids[ i ];
      distance = boid.position.distanceTo( this.position );

      if ( distance > 0 && distance <= _neighborhoodRadius ) {

        repulse.subVectors( this.position, boid.position );
        repulse.normalize();
        repulse.divideScalar( distance );
        posSum.add( repulse );

      }

    }

    return posSum;

  }

};