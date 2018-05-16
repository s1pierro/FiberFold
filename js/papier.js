



var Logo = {};
Logo = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'logo'));

var xmax = Logo.vertices[0][0];
var xmin = Logo.vertices[0][0];
var ymax = Logo.vertices[0][1];
var ymin = Logo.vertices[0][1];
var zmax = Logo.vertices[0][2];
var zmin = Logo.vertices[0][2];

for ( var i = 0 ; i < Logo.vertices.length ; i++)
{
	if ( Logo.vertices[i][0] > xmax ) xmax =  Logo.vertices[i][0]
	if ( Logo.vertices[i][0] < xmin ) xmin =  Logo.vertices[i][0]
	if ( Logo.vertices[i][1] > ymax ) ymax =  Logo.vertices[i][1]
	if ( Logo.vertices[i][1] < ymin ) ymin =  Logo.vertices[i][1]
	if ( Logo.vertices[i][2] > zmax ) zmax =  Logo.vertices[i][2]
	if ( Logo.vertices[i][2] < zmin ) zmin =  Logo.vertices[i][2]
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
Logo.height = height;

translateWavefront (Logo, -mx, -my, -mz);

//	var pobj = loadWavefrontFromHTLM("logo", 0);
console.log(Logo);	

var mouse = new THREE.Vector2(), mousein;
var container;
var camera, controls, scene, raycaster, renderer;
var objects = [];
var focus, focusshadowmaterial;
var material, material1, material2, material3, material4, material5;
var activeshape0, activeshape1 = -1, activeshape2;
var activeshape1shadoweddstate, activeshape2shadoweddstate;
var patterns = [];
init();
animate();



function init() {

	var w = $(window).width();
	var h = $(window).height();
	var viewW = w-0.707*h;
	var viewH = h;

	container = document.createElement( 'div' );
	container.style.position = 'fixed';
	container.style.top = '0px';
	container.style.left = (0.707*h)+'px';
	container.style.width = viewW+'px';
	container.style.height = viewH+'px';
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 70, viewW / viewH, 0.1, 5000 );
	camera.position.z = Logo.height / 2 / Math.tan(Math.PI * 70 / 360);

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
	material5 = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 5} );
	material6 = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1} );
	
	material = new THREE.MeshStandardMaterial(  { color: 0xcccccc, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;


	for ( var i = 0; i < Logo.edges.length ; i ++ )
	{
		var geometry2 = new THREE.Geometry();
	
		geometry2.vertices.push(
		new THREE.Vector3( Logo.vertices[Logo.edges[i].som[0]][0],
		 						 Logo.vertices[Logo.edges[i].som[0]][1],
		  						 Logo.vertices[Logo.edges[i].som[0]][2] ),
		new THREE.Vector3( Logo.vertices[Logo.edges[i].som[1]][0],
		 						 Logo.vertices[Logo.edges[i].som[1]][1],
		  						 Logo.vertices[Logo.edges[i].som[1]][2] ));
	
		var line = new THREE.Line( geometry2, material2 );
		//line.type="edge";
		scene.add( line );
		
		
	}
	for ( var i = 0; i < Logo.triangles.length ; i ++ ) {

		var geometry = new THREE.Geometry();

		
		geometry.vertices.push(
		new THREE.Vector3( Logo.vertices[Logo.triangles[i][0]][0],
		 						 Logo.vertices[Logo.triangles[i][0]][1],
		  						 Logo.vertices[Logo.triangles[i][0]][2] ),
		new THREE.Vector3( Logo.vertices[Logo.triangles[i][1]][0],
		 						 Logo.vertices[Logo.triangles[i][1]][1],
		  						 Logo.vertices[Logo.triangles[i][1]][2] ),
		new THREE.Vector3( Logo.vertices[Logo.triangles[i][2]][0],
		 						 Logo.vertices[Logo.triangles[i][2]][1],
		  						 Logo.vertices[Logo.triangles[i][2]][2] ) );
	
		geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

		var object = new THREE.Mesh( geometry, material);
		object.tid = i;
//		object.type = "shape";




		object.castShadow = false;
		object.receiveShadow = false;

		scene.add( object );


		objects.push( object );

	}
			console.log (scene);
	raycaster = new THREE.Raycaster();				
	raycaster.linePrecision = 3;
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( viewW, viewH );

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	container.appendChild( renderer.domElement );

/*

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - draggable cubes';
	container.appendChild( info );
*/


	//"mousewheel",

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

document.addEventListener( 'mouseup', mouseup, false );
document.addEventListener( 'mousedown', mousedown, false );
function mousedown ( event ) { mouserayid = mouse.x*mouse.y; }
function mouseup ( event )
{
	if (mouse.x*mouse.y == mouserayid && focus != undefined )

	// TAP
	{
		var connected = false;
		console.log('focus.tid '+focus.tid);
		var tappedshapeid = focus.tid;
		
		if ( activeshape1 != -1 )
		{
			setshapestate(activeshape1, activeshape1shadoweddstate);
			var e = aresharingedge (activeshape1, tappedshapeid);
			if ( e > -1 )
			{
					setshapestate(activeshape1, "solid" );	
					setshapestate(tappedshapeid, "solid" );
					activeshape1 = -1 ;
					if (edgestate (e) != "freeze")
					setedgestate (e, "freeze");
					else setedgestate (e, "hide");
					buildpatterns() ;
					connected = true;					
			}
		}
		if ( connected == false )
		{
			activeshape1 = tappedshapeid;
			activeshape1shadoweddstate = shapestate( tappedshapeid );
			setshapestate(tappedshapeid, "highlight" );
		}		
	}
	renderer.render( scene, camera );
}
function buildpatterns() {
		console.log('## rebuild ##');
	patterns.splice (0, patterns.length);
	//create and fill freezed junctions list
	var freezedlist = [];
	for ( var i = 0 ; i < Logo.ne ; i++ )
	{
		if (edgestate(i) == "freeze" ) freezedlist.push(i);
	}
	console.log('n freeze : '+freezedlist.length );
	while ( freezedlist.length > 0 )
	{
		l('frz list length : '+freezedlist.length);
		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < freezedlist.length )
		{
			l('freezedlist['+i+'] : (add '+add+')');
			var j = 0;
			while ( add == -1 && j < patterns.length )
			{
				l('paperseed.print.patterns['+j+'] :');
				add = addjunctiontopattern ( patterns[j], freezedlist[i] );
				l('add : '+freezedlist[i]);
				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	
			l('junctions do not match with any pattern; Create new pattern : ');
			var tmp = { triangles : [], edges : [freezedlist[0]], frontier : [] };
			PATTERNgentriangles(tmp);
			patterns.push(tmp);
			freezedlist.splice(0, 1);	
		}
	}
	console.log(patterns);
	
	
	// at this point pattern's 2D vertices are safe to be generated
	//TODO

}

function addjunctiontopattern (pattern, edge)
{
	var t1 = Logo.edges[edge].tri[0];
	var t2 = Logo.edges[edge].tri[1];
	//l(pattern);
	for ( var i = 0 ; i < pattern.edges.length ; i++ )
		if ( pattern.edges[i] == edge )	return -2;
	for ( var i = 0 ; i < pattern.triangles.length ; i++ )
	{
		if (t1 == pattern.triangles[i] | t2 == pattern.triangles[i] )
		{
			pattern.edges.push(edge);
			PATTERNgentriangles (pattern);
			return 1;
		}
	}
	return -1;
}
function PATTERNgentriangles (p) // find triangle from junction list
{
	for( var i = 0 ; i < p.edges.length ; i++ )
		for( var j = 0 ; j < Logo.edges[p.edges[i]].tri.length ; j++ )	
			if ( PATTERNgottriangle (p ,Logo.edges[p.edges[i]].tri[j]) == -1 )
			{
				p.triangles.push(Logo.edges[p.edges[i]].tri[j]);
				setshapestate(Logo.edges[p.edges[i]].tri[j], "solid");
			}
	PATTERNgenfrontier (p);
}
function PATTERNgottriangle (p, t)
{
	for( var i = 0 ; i < p.triangles.length ; i++ )	
		if ( p.triangles[i] == t ) return i;
	return -1;
}
function PATTERNgotfrontier (p, f)
{
	for( var i = 0 ; i < p.frontier.length ; i++ )	
		if ( p.frontier[i] == f ) return i;
	return -1;
}
function PATTERNgenfrontier (p) // find fronier from junctions && triangles lists
{
	for( var i = 0 ; i < p.triangles.length ; i++ )
	{
		var tmp = TRIANGLEgetedges (p.triangles[i]);
		for ( var j = 0 ; j < tmp.length ; j++ )
			if ( ( PATTERNgotfrontier (p,  tmp[j]) == -1 ) && ( edgestate(tmp[j]) != "freeze" ) )
			{
				p.frontier.push (tmp[j]);
				setedgestate (tmp[j], "visible");
				l('add');
			} else l('not add');
	}
}
function TRIANGLEgetedges (t) // find fronier from edges && triangles lists
{
	var tmp = [];
	for( var i = 0 ; i < Logo.edges.length ; i++ )
	{
		if ( JUNCTIONgottriangle (Logo.edges[i], t) != -1 ) tmp.push(i);
	}
	return tmp;
}
function JUNCTIONgottriangle (j, t)
{
	for( var i = 0 ; i < j.tri.length ; i++ )	
		if ( j.tri[i] == t ) return i;
	return -1;
}


function onWindowResize() {

	camera.aspect =  viewW/ viewH;
	camera.updateProjectionMatrix();

	renderer.setSize( viewW, viewH );

}

//

function animate() {

	requestAnimationFrame( animate );
	render();
}
function onDocumentMouseMove( event ) {

	if ( event.clientX > 0.707*window.innerHeight )
	{
		mouse.x = ( (event.clientX-0.707*window.innerHeight) / (window.innerWidth-0.707*window.innerHeight )) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}
	controls.update();
	
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects , true);
	if ( intersects.length > 0 )
		focus = intersects[ 0 ].object;
	else if ( focus != undefined ) focus = undefined;

	renderer.render( scene, camera );

}
function render() {


}
function edgestate (e)
{
	return Logo.edges[e].state;
}
$
function setedgestate (e, s)
{
	Logo.edges[e].state = s;
	if( s == "visible")
	scene.children[(2+e)].material = material5;
	if( s == "freeze")
	scene.children[(2+e)].material = material6;
	if( s == "highlight")
	scene.children[(2+e)].material = material5;
	if( s == "hide")
	scene.children[(2+e)].material = material5;
}

function shapestate (t)
{
	return Logo.triangles[t].state;
}
function setshapestate (t, s)
{
	Logo.triangles[t].state = s;
	if( s == "visible")
	{scene.children[(2+t+Logo.ne)].material = material;}
	if( s == "solid")
	{scene.children[(2+t+Logo.ne)].material = material4;}
	if( s == "highlight")
	{scene.children[(2+t+Logo.ne)].material = material3;}
	
	
}


function aresharingedge ( triangle_1, triangle_2)
{
	if ( triangle_1 == triangle_2 ) return -2;
	if ( triangle_1 == -1 ) return -3;
	if ( -1 == triangle_2 ) return -3;
	for (var i = 0 ; i < Logo.edges.length ; i++ )
	{
		if ( ( Logo.edges[i].tri[0] == triangle_1 &&
				 Logo.edges[i].tri[1] == triangle_2) |
			  ( Logo.edges[i].tri[1] == triangle_1 &&
				 Logo.edges[i].tri[0] == triangle_2) )
		{
			return i;
		}
	}
	return -1;
}
