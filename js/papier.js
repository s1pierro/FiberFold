/*
	This file is a part of "Papier" a paper-crafting tool
	
Copyright (C) 2018  Saint Pierre Thomas ( s1pierro@protonmail.fr )

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

$('#settings').hide();
$('#startapp').hide();

var pobj = $.extend(true, {}, loadWavefrontFromHTLM('#example', 'example'));

var mouse = new THREE.Vector2(), mouserayid;
var container;
var camera, controls, scene, raycaster, renderer;
var objects = [];
var focus;
var materialVisible, material1, materialSoftEdge, materialHighlighted, materialSolid, materialFrontier;
var activeshape1 = -1;
var activeshape1shadoweddstate;
var tolerance = 0.0001;

var patterns = new Patterns(pobj);
var dispatcher = new Dispatcher (patterns)
var verbose = false;
var BUILDmode = "safe";
var scaleconst = 1;

$(window).on("load",  init());

function init() {
	
	
	$('#processing-fail-indicator').fadeOut( 1 );

	$('#processing-success-indicator').fadeOut( 1 );

	$('#processing-indicator').fadeOut(200);
	
	$('#startapp').hide();
	
	fl('Papier 0.4.3', 'xl');
	
	fl('\n Copyright (C) 2018  Saint Pierre Thomas ( s1pierro@protonmail.fr )\n\n')

	fl('feel free to contact me at s1pierro@protonmail.com to contribute, in any way');
	


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

	console.log(controls);

	scene = new THREE.Scene();

	scene.add( new THREE.AmbientLight( 0xffffff ) );

	var light = new THREE.SpotLight( 0xffffff, 0.9 );
	light.position.copy( camera.position );
	light.angle = Math.PI / 3;
	light.castShadow = false;
	scene.add( light );


	materialVisible = new THREE.MeshStandardMaterial(  { color: 0xcccccc, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;
	materialHighlighted = new THREE.MeshStandardMaterial(  { color: 0x009075, side: THREE.DoubleSide,  flatShading : true , roughness : 1.0} ) ;
	materialSolid = new THREE.MeshStandardMaterial(  { color: 0xffffff, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;

	materialSoftEdge = new THREE.LineBasicMaterial( { color: 0x666666, linewidth: 1} );
	materialFrontier = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3} );
	
	feedscene ();
	if (pobj.prefreeze != undefined )
	{
		
		fl('prefreeze');
		for ( var i = 0 ; i < pobj.prefreeze.length ; i++)
		{
			
			setedgestate (pobj, pobj.prefreeze[i], "freeze");
		}
		patterns.rebuild();
	}
	
	else fl('no prefreeze');
	printWavefront (pobj);
	raycaster = new THREE.Raycaster();		
	fl(' Create Renderer :')
	try {
		renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } );
	
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize(  $('#renderbox').width(), $('#renderbox').height() );
		renderer.setClearColor( 0x000000, 0 ); // the default
		renderer.shadowMap.enabled = false;
		renderer.shadowMap.type = THREE.PCFShadowMap;
	}
	catch (err)
	{
		$('#startapp').replaceWith( "<h3 id=\"cantstart\">Oups, something went wrong with three.js, WebGL does not seem to be supported on this browser</h3>" );
		fl(err);
		
	}
	$('#startapp').fadeIn();



	// shut firefox up !
	var ctx = renderer.context;
	ctx.getShaderInfoLog = function () { return '' };
	
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
						$('#processing-indicator').fadeIn(1);
					setshapestate(pobj, activeshape1, "solid" );	
					setshapestate(pobj, tappedshapeid, "solid" );
					activeshape1 = -1 ;
					if (edgestate (pobj, e) != "freeze")
						setedgestate (pobj, e, "freeze");
					else
						setedgestate (pobj, e, "hide");
					//buildpatterns(pobj) ;
					var test = patterns.rebuild();
					if (!test)
					{
						setedgestate (pobj, e, "visible");
					}

				
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

	
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			
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

$('body').on('click', '#ldex-Knight', function()
{
	loadWavefrontExample('wavefronts/knight.obj');
});
$('body').on('click', '#ldex-ppce-frame', function()
{
	loadWavefrontExample('wavefronts/paperace-coque.obj');
});
$('body').on('click', '#ldex-ppce-body', function()
{
	loadWavefrontExample('wavefronts/paperace-carrosserie.obj');
});

$('body').on('click', '#ldfex-ppce-body', function()
{
	loadWavefrontExample('wavefronts/paperAce body flat.obj');
});
$('body').on('click', '#ldfex-ico-2', function()
{
	loadWavefrontExample('wavefronts/ico sphere flat-a.obj');
});

$('body').on('click', '#startapp', function()
{
	$("#startscreen").fadeOut();

});

$('body').on('click', '#close-settings', function()
{
	$('#settings').fadeOut(); 
	$('#credits').fadeIn();
		controls.enabled = true;
});
$('body').on('click', '#toggle-settings', function()
{
		$('#settings').fadeIn();
		$('#credits').fadeOut();
		controls.enabled = false;
});
$('body').on('click', '#patterns-safe-edit-mode', function()
{
		BUILDmode = "safe";
});
$('body').on('click', '#patterns-fast-edit-mode', function()
{
	BUILDmode = "fast";
});
$('body').on('click', '#apply-scale', function()
{	
	var sc = document.getElementById('user-scale-factor').value;
	var scale = parseFloat(sc);
	scaleWavefront (pobj, scale);
	//buildpatterns(pobj) ;
	patterns = new Patterns(pobj);
	patterns.rebuild();

});
$('body').on('click', '#download', function()
{	
	//TODO gen & enrich wavefront text format.
	var w = "";
	
	var d = new Date();
    var n = d.getFullYear()+''+d.getMonth()+''+d.getDate()+'-'+d.getHours()+d.getMinutes()+d.getSeconds();

	var saveas = pobj.nme+'-flat-'+n+'.obj'
	download(saveas, printWavefront (pobj));
});

/*	$('body').on('click', '#', function() {

	});
*/
/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@protonmail.fr
	Licenced under the termes of the GNU GPL v3
*/
