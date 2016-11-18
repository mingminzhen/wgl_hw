var gl;
var DEMO = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_Scene: null, 
	ms_Controls: null,
	ms_Water: null,
	ms_FilesDND: null,
	ms_Raycaster: null,
	ms_Clickable: [],

	

    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),
	
	initialize: function initialize(inIdCanvas, inParameters) {
		this.ms_Canvas = $('#'+inIdCanvas);
		
		
		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		// gl=this.ms_Renderer.context;
		// console.log('mmmmmmmmmmmmm');
		// console.log(gl);
		// console.log(gl.ARRAY_BUFFER);

		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8, -inParameters.height);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.ms_Raycaster = new THREE.Raycaster();
		
		// this.ms_Renderer.setClearColor(new THREE.Color(0xeeffff, 1.0));
		// Initialize Orbit control		
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		this.ms_Controls.userPan = false;
		this.ms_Controls.userPanSpeed = 0.0;
		this.ms_Controls.maxDistance = 5000.0;
		this.ms_Controls.maxPolarAngle = Math.PI * 0.495;
	
		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(-600, 300, 600);
		this.ms_Scene.add(directionalLight);
		
		// Create terrain
		//this.loadTerrain(inParameters);
		
		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture('img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
		
		// Load filesdnd texture
		new Konami(function() {
			if(DEMO.ms_FilesDND == null)
			{
				var aTextureFDND = THREE.ImageUtils.loadTexture("img/filesdnd_ad.png");
				aTextureFDND.minFilter = THREE.LinearFilter;
				DEMO.ms_FilesDND = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ map : aTextureFDND, transparent: true, side : THREE.DoubleSide }));

				// Mesh callback
				DEMO.ms_FilesDND.callback = function() { window.open("http://www.filesdnd.com"); }
				DEMO.ms_Clickable.push(DEMO.ms_FilesDND);
				
				DEMO.ms_FilesDND.position.y = 1200;
				DEMO.ms_Scene.add(DEMO.ms_FilesDND);
			}
		});
		
		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 512, 
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 50.0
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10), 
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.ms_Scene.add(aMeshMirror);
	

		var axisHelper = new THREE.AxisHelper( 500 );
        this.ms_Scene.add( axisHelper );
        // f=new FishMesh();
        // this.ms_Scene.add(f);

       // var local_scene = this.ms_Scene;
       //    var mtlLoader = new THREE.MTLLoader();
       //  mtlLoader.setPath('obj/');
       //  mtlLoader.load( 'Fish.mtl', function( materials ) {
       //      materials.preload();
       //      var objLoader = new THREE.OBJLoader();
       //      objLoader.setPath('obj/');
       //      objLoader.setMaterials( materials );
       //      objLoader.load( 'Fish.obj', function ( object ) {
       //          object.scale.x = 10;
       //          object.scale.y = 20;
       //          object.scale.z = 20;
       //          object.position.x = 0;
       //          object.position.z = 0;
       //          object.position.y = 0;
       //          object.name = 'Fish';
       //          // for (i = 0; i < object.children.length; i++) {
       //          //     this.ms_Clickable.push(object.children[i]);
       //          // }
       //          local_scene.add(object);
       //      });
       //  });


		this.loadFish(inParameters);
		this.loadSkyBox();
		this.loadRain();

	},
	loadRain:function loadRain(){
		var scene=this.ms_Scene;
		 var system1;
        var cloud;
        var range=this.ms_range=2000;
        var controls = new function () {
            this.size = 20;
            this.transparent = true;
            this.opacity = 0.7;
            this.color = 0xffffff;

            this.sizeAttenuation = true;

            this.redraw = function () {
                scene.remove(scene.getObjectByName("particles1"));
                scene.remove(scene.getObjectByName("particles2"));

                createPointCloud(controls.size, controls.transparent, controls.opacity, controls.sizeAttenuation, controls.color);
            };
        };
         controls.redraw();
		  function createPointCloud(size, transparent, opacity, sizeAttenuation, color) {

            var texture = THREE.ImageUtils.loadTexture("img/raindrop-3.png");
            var geom = new THREE.Geometry();

            var material = new THREE.PointsMaterial({
                size: size,
                transparent: transparent,
                opacity: opacity,
                map: texture,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: sizeAttenuation,
                color: color,
                fog:true,
                overdraw:true
            });

            speed=10;
            
            for (var i = 0; i < 1000; i++) {
                var particle = new THREE.Vector3(
                        Math.random() * range - range / 2,
                        Math.random() * range * 1.5,
                        Math.random() * range - range / 2);
                particle.velocityY = 0.1 + Math.random() / 5*speed;
                particle.velocityX = (Math.random() - 0.5) / 8*speed;
                geom.vertices.push(particle);
            }
            // geom.verticesNeedUpdate=true;
            cloud = new THREE.Points(geom, material);
            cloud.sortParticles = true;

            scene.add(cloud);
        }
        this.ms_cloud=cloud;
	},
	rainUpdate:function rainUpdate()
	{
		this.ms_cloud.geometry.verticesNeedUpdate=true;
		var vertices = this.ms_cloud.geometry.vertices;
		console.log('1111111111111');
		// console.log(vertices);
		// console.log(vertices.length);
		for ( var i = 0; i < vertices.length; i ++ ) {
			v=vertices[i];
			v.y = v.y - (v.velocityY);
            v.x = v.x - (v.velocityX);
                 // console.log(v);
                if (v.y <= 0) v.y = this.ms_range*1.5;
                if (v.x <= -this.ms_range/2 || v.x >= this.ms_range/2) v.velocityX = v.velocityX * -1;
                // vertices[i]=v;
		}
		// this.ms_cloud.geometry.vertices=vertices;
	},
	loadFish: function loadFish(inParameters){
		var boid, fish,
		boids=[],
		fishes=[]
		;
		var numFish = 300;
    	for ( var i = 0; i < numFish; i ++ ) {
      
        //reduce maxspeed & steer force
        boid = boids[ i ] = new Boid(5, 0.02);
        //the actual 3D object
        fish = fishes[ i ] = new FishMesh();
        
      	boid.position.x = Math.random() * inParameters.width/2 - inParameters.width/4;
        boid.position.y = Math.random() * inParameters.width/4 - inParameters.width/8;
        boid.position.z = Math.random() * inParameters.width/2 - inParameters.width/4;
      
        boid.velocity.x = Math.random() * 2 - 1;
        boid.velocity.y = Math.random() * 2 - 1;
        boid.velocity.z = Math.random() * 2 - 1;
        boid.setAvoidWalls( true );
        boid.setWorldSize( inParameters.width, inParameters.width, inParameters.width );


        fish.position = boids[ i ].position;
        fish.doubleSided = true;

        this.boids=boids;
        this.fishes=fishes;
        this.ms_Scene.add(fish);
  		} 
	},
	fishRender:function fishRender(inParameters){
		var boid, fish,
        boids = this.boids,
        fishes = this.fishes;

    	for ( var i = fishes.length - 1; i >= 0; i-- ) {
      		boid = boids[ i ];

      		boid.run( boids );
     		 fish = fishes[ i ];
     		 // console.log(fish);
     		 // fish.geometry.verticesNeedUpdate=true;
     		 fish.updateCourse(boid);
    	}
	},

	loadSkyBox: function loadSkyBox() {
		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		  'img/px.jpg',
		  'img/nx.jpg',
		  'img/py.jpg',
		  'img/ny.jpg',
		  'img/pz.jpg',
		  'img/nz.jpg'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
		  new THREE.BoxGeometry(1000000, 1000000, 1000000),
		  aSkyBoxMaterial
		);
		
		this.ms_Scene.add(aSkybox);
	},
	
	// loadTerrain: function loadTerrain(inParameters) {
	// 	var terrainGeo = TERRAINGEN.Get(inParameters);
	// 	var terrainMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide });
		
	// 	var terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
	// 	terrain.position.y = - inParameters.depth * 0.4;
	// 	this.ms_Scene.add(terrain);
	// },
	
	display: function display() {
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},
	
	update: function update() {
		if (this.ms_FilesDND != null) {
			this.ms_FilesDND.rotation.y += 0.01;
		}
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		this.ms_Controls.update();
		this.fishRender();


		
		this.rainUpdate();


		this.display();
	},
	
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}
};