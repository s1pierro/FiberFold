/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@free.fr
	Licenced under the termes of the GNU GPL v3
*/
'use strict';

$('#settings').hide();

var pobj = $.extend(true, {}, loadWavefrontFromHTLM('#example', 'example'));

var mouse = new THREE.Vector2(), mouserayid;
var container;
var camera, controls, scene, raycaster, renderer;
var objects = [];
var focus;
var materialVisible, material1, materialSoftEdge, materialHighlighted, materialSolid, materialFrontier;
var activeshape1 = -1;
var activeshape1shadoweddstate;

var patterns = [];
var verbose = false;
var BUILDmode = "safe";
var scaleconst = 1;

$(window).on("load",  init());

function init() {


	container = document.createElement( 'div' );
	container.id = 'renderbox';
	document.body.appendChild( container );
	
	camera = new THREE.PerspectiveCamera( 70, $('#renderbox').width() / $('#renderbox').height(), 0.1, 5000 );
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

	scene.add( new THREE.AmbientLight( 0xffffff ) );

	var light = new THREE.SpotLight( 0xffffff, 0.9 );
	light.position.copy( camera.position );
	light.angle = Math.PI / 3;
	light.castShadow = false;
	scene.add( light );


	materialVisible = new THREE.MeshStandardMaterial(  { color: 0xcccccc, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;
	materialHighlighted = new THREE.MeshStandardMaterial(  { color: 0x52b7ca, side: THREE.DoubleSide,  flatShading : true , roughness : 1.0} ) ;
	materialSolid = new THREE.MeshStandardMaterial(  { color: 0xffffff, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;

	materialSoftEdge = new THREE.LineBasicMaterial( { color: 0x666666, linewidth: 1} );
	materialFrontier = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3} );
	
	feedscene ();

	raycaster = new THREE.Raycaster();				
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(  $('#renderbox').width(), $('#renderbox').height() );
	renderer.setClearColor( 0x000000, 0 ); // the default
	renderer.shadowMap.enabled = false;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'wheel', onDocumentMouseMove, false );
	controls.addEventListener( 'change', light_update );
	controls.update();

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
  	renderplane.innerHTML = "";
}
function feedscene ()
{

	for ( var i = 0; i < pobj.edges.length ; i ++ )
	{
		var geometry2 = new THREE.Geometry();
		geometry2.vertices
		.push(
			new THREE.Vector3( pobj.vertices[pobj.edges[i].som[0]][0],
									 pobj.vertices[pobj.edges[i].som[0]][1],
									 pobj.vertices[pobj.edges[i].som[0]][2] ),
			new THREE.Vector3( pobj.vertices[pobj.edges[i].som[1]][0],
									 pobj.vertices[pobj.edges[i].som[1]][1],
									 pobj.vertices[pobj.edges[i].som[1]][2] )
		);
		var line = new THREE.Line( geometry2, materialSoftEdge );
		scene.add( line );
	}
	for ( var i = 0; i < pobj.triangles.length ; i ++ )
	{
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

		var object = new THREE.Mesh( geometry, materialVisible);
		object.tid = i;
		
		object.castShadow = false;
		object.receiveShadow = false;
		scene.add( object );
		objects.push( object );

	}
	camera.position.z = pobj.height / 2 / Math.tan(Math.PI * 70 / 360);
}
function onWindowResize() {

	camera.aspect =  $('#renderbox').width() / $('#renderbox').height();
	camera.updateProjectionMatrix();
	renderer.setSize( $('#renderbox').width(), $('#renderbox').height() );
	render();
}
document.addEventListener( 'mouseup', mouseup, false );
document.addEventListener( 'mousedown', mousedown, false );
function mousedown ( event ) { mouserayid = mouse.x*mouse.y; }
function mouseup ( event )
{
	if ( controls.enabled == false ) return;
	if (mouse.x*mouse.y == mouserayid && focus != undefined ) // SHAPE TAPPED
	{

		var tappedshapeid = focus.tid;
		
		if ( activeshape1 != -1 )
		{
			setshapestate(pobj, activeshape1, activeshape1shadoweddstate);
			var e = sharededge (pobj, activeshape1, tappedshapeid);
			if ( e > -1 )
			{
					setshapestate(pobj, activeshape1, "solid" );	
					setshapestate(pobj, tappedshapeid, "solid" );
					activeshape1 = -1 ;
					if (edgestate (pobj, e) != "freeze")
						setedgestate (pobj, e, "freeze");
					else
						setedgestate (pobj, e, "hide");
					buildpatterns(pobj) ;

					if ( BUILDmode == "fast" )
					{
						activeshape1 = tappedshapeid;
						activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
						setshapestate(pobj, tappedshapeid, "highlight" );
					}
					else if ( BUILDmode == "safe" )
					{
						activeshape1 = -1 ;
						activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
					}
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
	render();
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
		focus = $.extend(true, {}, intersects[ 0 ].object );
	else if ( focus != undefined ) focus = undefined;
	render();
}
function render() {
	renderer.render( scene, camera );
}

document.getElementById('fileinput').addEventListener('change', readWavefrontFile, false);

$('body').on('click', '#close-settings', function() {
	$('#settings').fadeOut(); 
	$('#credits').fadeIn();
		controls.enabled = true;
});
$('body').on('click', '#toggle-settings', function() {
		$('#settings').fadeIn();
		$('#credits').fadeOut();
		controls.enabled = false;
});
$('body').on('click', '#patterns-safe-edit-mode', function() {
		BUILDmode = "safe";
});
$('body').on('click', '#patterns-fast-edit-mode', function() {
	BUILDmode = "fast";
});
$('body').on('click', '#apply-scale', function() {
	
	var sc = document.getElementById('user-scale-factor').value;
	var scale = parseFloat(sc);
	scaleWavefront (pobj, scale);
	fl(scale);
	fl(pobj);
	buildpatterns(pobj) ;

});
/*	$('body').on('click', '#', function() {

	});
*/
