

$('#settings').hide();

var pobj = {};
pobj = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'logo'));

var mouse = new THREE.Vector2(), mousein;
var container;
var camera, controls, scene, raycaster, renderer;
var objects = [];
var focus, focusshadowmaterial;
var material, material1, material2, material3, material4, material5;
var activeshape0, activeshape1 = -1, activeshape2;
var activeshape1shadoweddstate, activeshape2shadoweddstate;
var patterns = [];
var landscape = true;


$(window).on("load",  init());


function init() {

	container = document.createElement( 'div' );
	container.id = 'svg8';
	document.body.appendChild( container );
	
	camera = new THREE.PerspectiveCamera( 70, $('#svg8').width() / $('#svg8').height(), 0.1, 5000 );
	camera.position.z = pobj.height / 2 / Math.tan(Math.PI * 70 / 360);

	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 3.5;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xc0c0c0 );

	scene.add( new THREE.AmbientLight( 0xffffff ) );

	var light = new THREE.SpotLight( 0xffffff, 0.9 );
	light.position.set( 0, 500, 2000 );
	light.angle = Math.PI / 3;

	light.castShadow = false;
	light.shadow.camera.near = 1000;
	light.shadow.camera.far = 4000;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	scene.add( light );

//	var geometry = new THREE.BoxBufferGeometry( 40, 40, 40 );
	material1 = new THREE.MeshStandardMaterial(  { color: 0xd1ecf1, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;
	material3 = new THREE.MeshStandardMaterial(  { color: 0x52b7ca, side: THREE.DoubleSide,  flatShading : true , roughness : 1.0} ) ;
	material4 = new THREE.MeshStandardMaterial(  { color: 0xffffff, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;
	material2 = new THREE.LineBasicMaterial( { color: 0xaaaaaa, linewidth: 1} );
	material5 = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3} );
	material6 = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1} );
	
	material = new THREE.MeshStandardMaterial(  { color: 0xcccccc, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;
feedscene ();

	raycaster = new THREE.Raycaster();				
	raycaster.linePrecision = 3;
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(  $('#svg8').width(), $('#svg8').height() );

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'wheel', onDocumentMouseMove, false );
	controls.addEventListener( 'change', light_update );

	function light_update()
	{
		 light.position.copy( camera.position );
	}
	light.position.copy( camera.position );
	renderer.render( scene, camera );
	
}
function blankscene ()
{
	for (let i = scene.children.length - 1; i >= 2; i--) 
		scene.remove(scene.children[i]);
	for (let i = objects.length - 1; i >= 0; i--) 
		objects.splice(i, 1);

}
function feedscene ()
{

	
		camera.position.z = pobj.height / 2 / Math.tan(Math.PI * 70 / 360);
var xmax = pobj.vertices[0][0];
var xmin = pobj.vertices[0][0];
var ymax = pobj.vertices[0][1];
var ymin = pobj.vertices[0][1];
var zmax = pobj.vertices[0][2];
var zmin = pobj.vertices[0][2];

for ( var i = 0 ; i < pobj.vertices.length ; i++)
{
	if ( pobj.vertices[i][0] > xmax ) xmax =  pobj.vertices[i][0]
	if ( pobj.vertices[i][0] < xmin ) xmin =  pobj.vertices[i][0]
	if ( pobj.vertices[i][1] > ymax ) ymax =  pobj.vertices[i][1]
	if ( pobj.vertices[i][1] < ymin ) ymin =  pobj.vertices[i][1]
	if ( pobj.vertices[i][2] > zmax ) zmax =  pobj.vertices[i][2]
	if ( pobj.vertices[i][2] < zmin ) zmin =  pobj.vertices[i][2]
}

var sx = (xmax-xmin);
var sy = (ymax-ymin);
var sz = (zmax-zmin);
var mx = xmax-sx/2;
var my = ymax-sy/2;
var mz = zmax-sz/2;

var height = sx;
if ( height < sy ) height = sy;
if ( height < sz ) height = sz;
pobj.height = height*1.2;

translateWavefront (pobj, -mx, -my, -mz);
		camera.position.z = pobj.height / 2 / Math.tan(Math.PI * 70 / 360);
	
	for ( var i = 0; i < pobj.edges.length ; i ++ )
	{
		var geometry2 = new THREE.Geometry();
	
		geometry2.vertices.push(
		new THREE.Vector3( pobj.vertices[pobj.edges[i].som[0]][0],
		 						 pobj.vertices[pobj.edges[i].som[0]][1],
		  						 pobj.vertices[pobj.edges[i].som[0]][2] ),
		new THREE.Vector3( pobj.vertices[pobj.edges[i].som[1]][0],
		 						 pobj.vertices[pobj.edges[i].som[1]][1],
		  						 pobj.vertices[pobj.edges[i].som[1]][2] ));
	
		var line = new THREE.Line( geometry2, material2 );
		//line.type="edge";
		scene.add( line );
	}
	for ( var i = 0; i < pobj.triangles.length ; i ++ ) {

		var geometry = new THREE.Geometry();

		geometry.vertices.push(
		new THREE.Vector3( pobj.vertices[pobj.triangles[i][0]][0],
		 						 pobj.vertices[pobj.triangles[i][0]][1],
		  						 pobj.vertices[pobj.triangles[i][0]][2] ),
		new THREE.Vector3( pobj.vertices[pobj.triangles[i][1]][0],
		 						 pobj.vertices[pobj.triangles[i][1]][1],
		  						 pobj.vertices[pobj.triangles[i][1]][2] ),
		new THREE.Vector3( pobj.vertices[pobj.triangles[i][2]][0],
		 						 pobj.vertices[pobj.triangles[i][2]][1],
		  						 pobj.vertices[pobj.triangles[i][2]][2] ) );
	
		geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

		var object = new THREE.Mesh( geometry, material);
		object.tid = i;
//		object.type = "shape";

		object.castShadow = false;
		object.receiveShadow = false;

		scene.add( object );


		objects.push( object );

	}
	camera.position.z = pobj.height / 2 / Math.tan(Math.PI * 70 / 360);
	l (scene);


}					

document.addEventListener( 'mouseup', mouseup, false );
document.addEventListener( 'mousedown', mousedown, false );
function mousedown ( event ) { mouserayid = mouse.x*mouse.y; }
function mouseup ( event )
{
	if (mouse.x*mouse.y == mouserayid && focus != undefined )

	// TAP
	{
	
		l(' TAP SHAPE '+focus.tid,"lr");
		l('###############','lr');
		l('**************#','lr');
	l (focus);	
	l (scene);	
	
		var connected = false;
		l('focus.tid '+focus.tid);
		var tappedshapeid = focus.tid;
		l('active shape '+activeshape1);
		
		
		if ( activeshape1 != -1 )
		{
			setshapestate(pobj, activeshape1, activeshape1shadoweddstate);
			var e = aresharingedge (pobj, activeshape1, tappedshapeid);
			if ( e > -1 )
			{
					setshapestate(pobj, activeshape1, "solid" );	
					setshapestate(pobj, tappedshapeid, "solid" );
					activeshape1 = -1 ;
					if (edgestate (pobj, e) != "freeze")
					setedgestate (pobj, e, "freeze");
					else setedgestate (pobj, e, "hide");
					buildpatterns(pobj) ;
					connected = true;					
			}
			else
			{
				activeshape1 = tappedshapeid;
				activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
				setshapestate(pobj, tappedshapeid, "highlight" );
			}
		}
		else
		{
			activeshape1 = tappedshapeid;
				activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
				setshapestate(pobj, tappedshapeid, "highlight" );
		
			
		}
	
	}
	renderer.render( scene, camera );
}
function onWindowResize() {

	camera.aspect =  $('#svg8').width() / $('#svg8').height();
	camera.updateProjectionMatrix();

	renderer.setSize( $('#svg8').width(), $('#svg8').height() );
	renderer.render( scene, camera );
}
function animate() {

  requestAnimationFrame( animate );
  render();
  controls.update();
}

function onDocumentMouseMove( event ) {
	if ( window.innerWidth > window.innerHeight)
	{
		if ( event.clientX > 0.707*window.innerHeight )
		{
			mouse.x = ( (event.clientX-0.707*window.innerHeight) / (window.innerWidth-0.707*window.innerHeight )) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		}
	}
	else
	{
		if ( event.clientY < 0.707*window.innerHeight )
		{
			mouse.x =  ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / (window.innerHeight - window.innerWidth*0.707) ) * 2 + 1;
		}
	}
	controls.update();
	
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects , true);
	if ( intersects.length > 0 )
	{

		
		focus = $.extend(true, {}, intersects[ 0 ].object );
	}
	else if ( focus != undefined ) focus = undefined;


	renderer.render( scene, camera );
}
function render() {

}
document.getElementById('fileinput').addEventListener('change', readWavefrontFile, false);
	$('body').on('click', '#close-settings', function() {
		$('#settings').fadeOut(); 
		$('#credits').fadeIn();

	 });
	$('body').on('click', '#toggle-settings', function() {

		$('#settings').fadeIn();
		$('#credits').fadeOut(); 

	});

