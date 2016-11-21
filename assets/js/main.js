function mainLoop() {
	requestAnimationFrame(mainLoop);
	DEMO.update();
}

function onDocumentKeyDown(event){
    var keycode = event.keyCode;
    switch(keycode){
        default:
            break;
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    var mouse = new THREE.Vector2(
        ( event.clientX / window.innerWidth ) * 2 - 1, 
        - ( event.clientY / window.innerHeight ) * 2 + 1 );

    DEMO.ms_Raycaster.setFromCamera( mouse, DEMO.ms_Camera );
    var intersects = DEMO.ms_Raycaster.intersectObjects( DEMO.ms_Clickable );
    var waterHeight = waterWidth;
    if (intersects.length > 0) {
        var point = intersects[0].point;
        var center = new THREE.Vector2((point.x + waterWidth / 2) / waterWidth, (-point.z + waterHeight / 2) / waterHeight); 
        for (var i = 0; i < 2; i++) {
            DEMO.addDrop(center, 0.1, (i & 1) ? - 0.2 : 0.2);
        }
    }
}

$(function() {
	WINDOW.initialize();
	document.addEventListener('click', onDocumentMouseDown, false);
	document.addEventListener('keydown', onDocumentKeyDown, false);

	var parameters = {
		width: waterWidth,
		height: waterWidth,
	};
	
	DEMO.initialize('canvas-3d', parameters);
	
	WINDOW.resizeCallback = function(inWidth, inHeight) { DEMO.resize(inWidth, inHeight); };
	DEMO.resize(WINDOW.ms_Width, WINDOW.ms_Height);
	
	mainLoop();
});