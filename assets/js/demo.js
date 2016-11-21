var DEMO = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Water: null,
	ms_FilesDND: null,
	ms_Raycaster: null,
    ms_Direction: null,
	ms_Clickable: [],
    waterInfo: null,
    causticsInfo: null,
    waterMaterials: null,
    cubeMaterial: null,
	waterMeshes: null,
    ms_Range: null,
    ms_Cloud: null,

	initialize: function initialize(inIdCanvas, inParameters) { 
        var waterInfoWidth = waterWidth;
        var waterInfoHeight = waterWidth / 2;

        this.ms_Range = waterWidth;
        
        var causticsInfoWidth = 4 * waterInfoWidth;
        var causticsInfoHeight = causticsInfoWidth;

        var waterHeight = waterWidth;
        


		this.ms_Canvas = $('#' + inIdCanvas);
		
		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = new THREE.WebGLRenderer();
        this.ms_Renderer.setPixelRatio( WINDOW.devicePixelRatio );
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 1, 1000);
		this.ms_Camera.position.set(inParameters.width, inParameters.width, inParameters.width);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.ms_Raycaster = new THREE.Raycaster();
		
		// Initialize Orbit control		
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		this.ms_Controls.userPan = false;
		this.ms_Controls.userPanSpeed = 0.0;
		this.ms_Controls.maxDistance = 500.0;
		this.ms_Controls.maxPolarAngle = Math.PI * 0.495;
        // ************************* start of water ****************************
        // waterInfo texture

        this.waterInfo = new WaterInfo({
            renderer: this.ms_Renderer, 
            w: waterInfoWidth, 
            h: waterInfoHeight, 
            debug: false
        });
    
        // caustics texture

        this.causticsInfo = new CausticsInfo({
            renderer: this.ms_Renderer, 
            w: causticsInfoWidth, 
            h: causticsInfoHeight, 
            debug: false
        });
        
        // skyTexture
        var skyTexture = new THREE.CubeTexture( [] );
        skyTexture.format = THREE.RGBFormat;

        var loader = new THREE.ImageLoader();
        loader.load( 'assets/img/skyboxsun25degtest.png', function ( image ) {

            var getSide = function ( x, y ) {
                var size = 1024;
                var canvas = document.createElement( 'canvas' );
                canvas.width = size;
                canvas.height = size;
                var context = canvas.getContext( '2d' );
                context.drawImage( image, - x * size, - y * size );
                return canvas;
            };
            skyTexture.images[ 0 ] = getSide( 2, 1 ); // px
            skyTexture.images[ 1 ] = getSide( 0, 1 ); // nx
            skyTexture.images[ 2 ] = getSide( 1, 0 ); // py
            skyTexture.images[ 3 ] = getSide( 1, 2 ); // ny
            skyTexture.images[ 4 ] = getSide( 1, 1 ); // pz
            skyTexture.images[ 5 ] = getSide( 3, 1 ); // nz
            skyTexture.needsUpdate = true;
        } );
        
        
        // tileTexture
        var tileTexture = new THREE.TextureLoader().load('assets/img/tile1.png');
        tileTexture.format = THREE.RGBFormat;
        // water surface
        this.waterMaterials = [];
        for (var i = 0; i < 2; i ++){
            waterShaders[i].uniforms ={
                'u_TileTexture': {type: 't', value: tileTexture},
                'u_SkyTexture': {type: 't', value: skyTexture},
                'u_WaterInfoTexture': {type: 't', value: null},
                'u_CausticTex': {type: 't', value: null},
                'u_LightDir': {type: 't', value: null},
                'u_PoolHeight': {type: 't', value: null},
            };
            this.waterMaterials[i] = new THREE.ShaderMaterial(waterShaders[i]);
            // i == 1, underwater; i == 0, above water
            this.waterMaterials[i].side = i ? THREE.BackSide: THREE.FrontSide;
        }

        var waterPlane = new THREE.PlaneGeometry(waterWidth, waterHeight, 1,1);
        waterPlane.transparent = true;
        
        this.waterMeshes = [];
        for (var i = 0; i < 2; i ++){
            this.waterMeshes[i] = new THREE.Mesh(waterPlane, this.waterMaterials[i]);
            this.waterMeshes[i].rotation.x = 3 / 2 * Math.PI; // front to top, back to bottom
            this.ms_Clickable.push(this.waterMeshes[i]);
            this.ms_Scene.add(this.waterMeshes[i]);
        }
        
        // water cube

        cubeShader.uniforms = {
            'u_TileTexture': {type: 't', value: tileTexture},
            'u_WaterInfoTexture': {type: 't', value: null},
            'u_CausticTex': {type: 't', value: null},
            'u_LightDir': {type: 't', value: null},
            'u_PoolHeight': {type: 't', value: null}
        };

        this.cubeMaterial = new THREE.ShaderMaterial(cubeShader);
        this.cubeMaterial.transparent = true;

        var cubeMesh = new THREE.Mesh(new THREE.OpenBoxBufferGeometry(waterWidth,1,waterHeight), this.cubeMaterial);
        cubeMesh.position.y = -0.5;


        this.ms_Scene.add(cubeMesh);
        // ************************* end of water ****************************
	    // Axis
        var axisHelper = new THREE.AxisHelper( waterWidth/2 );
        this.ms_Scene.add( axisHelper );
        
		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.ms_Direction = new THREE.Vector3(-0.5, 0.5, -0.5);
		directionalLight.position.set(this.ms_Direction);
        this.ms_Direction.negate();
		this.ms_Scene.add(directionalLight);
        
        var ambient = new THREE.AmbientLight( 0x101030 );
		this.ms_Scene.add(ambient);

//        this.addRandomDrops();
		this.loadSkyBox();
        this.loadFish(inParameters);
        this.loadRain();
	},
    // ************************** start of Mingmin ********************************
    loadRain: function loadRain(){
        var speed = 2;
        var texture = THREE.ImageUtils.loadTexture("assets/img/drop.png");
        var geom = new THREE.Geometry();
        var material = new THREE.PointsMaterial({
            size: 10,
            transparent: true,
            opacity: 0.7,
            map: texture,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: 0xffffff,
            color: true,
            fog: true,
            overdraw: true
        });
        for (var i = 0; i < 50; i++) {
            var particle = new THREE.Vector3(
                    Math.random() * this.ms_Range - this.ms_Range / 2,
                    Math.random() * this.ms_Range / 2,
                    Math.random() * this.ms_Range - this.ms_Range / 2);
            particle.velocityY = 1 + Math.random() * speed;
            
            particle.velocityX = 0.2 * particle.velocityY;//(Math.random() - 0.5) / 8 * speed;
            geom.vertices.push(particle);
        }
        this.ms_Cloud = new THREE.Points(geom, material);
        this.ms_Cloud.sortParticles = true;
        this.ms_Scene.add(this.ms_Cloud);
	},
	rainUpdate: function rainUpdate()
	{
		this.ms_Cloud.geometry.verticesNeedUpdate = true;
		var vertices = this.ms_Cloud.geometry.vertices;
		for ( var i = 0; i < vertices.length; i ++ ) {
			v = vertices[i];
			v.y = v.y - (v.velocityY);
            v.x = v.x - (v.velocityX);
            if (v.y <= 0) {
                v.y = Math.random() * this.ms_Range / 2;
                if ( Math.random() * 100 < 1) {
                    var center = new THREE.Vector2(
                        (v.x + this.ms_Range / 2) / waterWidth, 
                        (v.z + this.ms_Range / 2) / waterWidth);
                    for (var i = 0; i < 2; i++) {
                        this.addDrop(center, 0.05, (i & 1) ? - 0.02 : 0.02);
                    }
                }
            }
            if (v.x <= -this.ms_Range / 2 || v.x >= this.ms_Range / 2) {
                v.x = Math.random() * this.ms_Range - this.ms_Range / 2;
                v.y = Math.random() * this.ms_Range / 2;
            }
		}
	},
    
    loadFish: function loadFish(inParameters){
		var boid, fish,
		boids=[],
		fishes=[]
		;
        fish_width=128;
		var numFish = 15;
    	for ( var i = 0; i < numFish; i ++ ) {
            //reduce maxspeed & steer force
            boid = boids[ i ] = new Boid(5, 0.02);
            //the actual 3D object
            fish = fishes[ i ] = new FishMesh();

            boid.position.x = Math.random() * fish_width/2 - fish_width/4;
            boid.position.y = 0;
            boid.position.z = Math.random() * fish_width/2- fish_width/4 ;

            // var len1=MATH.sqrt(MATH.pow(boid.position.x,2)+MATH.pow(boid.position.z,2));

            

            var endPos=new THREE.Vector3();
            endPos.x=boid.position.x+fish_width/2*Math.random()- fish_width/4;
            endPos.y=0;
            endPos.z=boid.position.z+fish_width/2*Math.random()- fish_width/4;

            
            boid.setParas(boid.position, endPos);
           

            boid.velocity.x = Math.random() * 1 - 0.5;
            boid.velocity.y = Math.random() * 1 - 0.5;
            boid.velocity.z = Math.random() * 1 - 0.5;
            boid.setAvoidWalls( true );
            boid.setWorldSize( fish_width, fish_width, fish_width );

            fish.position = boids[ i ].position;
            fish.doubleSided = true;

            this.boids =boids;
            this.fishes=fishes;
            this.ms_Scene.add(fish);
  		} 
	},
	fishRender:function fishRender(inParameters){
		var boid, fish,
        boids = this.boids,
        fishes = this.fishes;
        fish_width=128;
    	for ( var i = fishes.length - 1; i >= 0; i-- ) {
      		boid = boids[ i ];
      		// boid.run( boids );
            boid.flying(boids);

            // console.log('222222222222222222');
            // console.log(boid);
            
            if(boid.position.y<=0.0)
            {
                console.log('11111111');
                boid.position.x = Math.random() * fish_width/2 - fish_width/4;
                boid.position.y = 0;
                boid.position.z = Math.random() * fish_width/2- fish_width/4 ;

               
                

                var endPos=new THREE.Vector3();
                endPos.x=boid.position.x+fish_width/2*Math.random()- fish_width/4;
                endPos.y=0;
                endPos.z=boid.position.z+fish_width/2*Math.random()- fish_width/4;
                

               
                boid.setParas(boid.position, endPos);
               
                boid.flying(boids);
            }

     		fish = fishes[ i ];
     		fish.updateCourse(boid);
    	}
	},
    // ************************** end of Ming min *********************************
    
	loadSkyBox: function loadSkyBox() {
        var cubeMap = new THREE.CubeTexture( [] );
        cubeMap.format = THREE.RGBFormat;

        var loader = new THREE.ImageLoader();
        loader.load( 'assets/img/skyboxsun25degtest.png', function ( image ) {

            var getSide = function ( x, y ) {

                var size = 1024;

                var canvas = document.createElement( 'canvas' );
                canvas.width = size;
                canvas.height = size;

                var context = canvas.getContext( '2d' );
                context.drawImage( image, - x * size, - y * size );

                return canvas;

            };

            cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
            cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
            cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
            cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
            cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
            cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
            cubeMap.needsUpdate = true;

        } );

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = cubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
		  new THREE.BoxGeometry(waterWidth, waterWidth, waterWidth),
		  aSkyBoxMaterial
		);
		
		this.ms_Scene.add(aSkybox);
	},
	
	display: function display() {
        var waterInfoTexture = this.waterInfo.render1(); 
        // causticTex
        this.causticsInfo.pCaustics.updateUniform('u_LightDir', this.ms_Direction);
        this.causticsInfo.pCaustics.updateUniform('u_PoolHeight', waterWidth/2);

        var causticTex = this.causticsInfo.render1(waterInfoTexture);
        
        for (var i = 0; i < 2; i ++){
            this.waterMaterials[i].uniforms['u_WaterInfoTexture'].value = waterInfoTexture;
            this.waterMaterials[i].uniforms['u_CausticTex'].value = causticTex;
            this.waterMaterials[i].uniforms['u_LightDir'].value = this.ms_Direction;
            this.waterMaterials[i].uniforms['u_PoolHeight'].value = waterWidth/2;
        }
        
        // water cube
        this.cubeMaterial.uniforms['u_WaterInfoTexture'].value = waterInfoTexture;
        this.cubeMaterial.uniforms['u_CausticTex'].value = causticTex;
        this.cubeMaterial.uniforms['u_LightDir'].value = this.ms_Direction;
        this.cubeMaterial.uniforms['u_PoolHeight'].value = waterWidth/2;
        
        this.rainUpdate();
        this.fishRender();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},
	
	update: function update() {
		if (this.ms_FilesDND != null) {
			this.ms_FilesDND.rotation.y += 0.01;
		}
		this.ms_Controls.update();
		this.display();
	},
	
    addDrop: function(center, radius, strength){
        this.waterInfo.addDrop(center, radius, strength);
    },
    
    addRandomDrops: function(){
        for (var i = 0; i < 10; i++) {
        // params: center, radius in uv coord, strength [0, 1]
        this.addDrop(new THREE.Vector2(this.getRandomArbitrary(0.0, 0.5), this.getRandomArbitrary(0.0, 0.5)), 0.1, (i & 1) ? - 0.1 : 0.1);
        }
    },
    
    getRandomArbitrary: function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    },
    
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}
};