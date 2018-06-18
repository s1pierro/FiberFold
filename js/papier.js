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
function dl (s)
{
	console.log(s);
	s = '<p>'+s+'</p>'
	$('#logput').append(s);
}
var noError = true;

var pobj = {};
var patterns = {};
var dispatcher = {};
var camarm = [0, 0, 9999];//pobj.height*2 /2/ Math.tan(Math.PI * 50 / 360)];
var mouse = new THREE.Vector2(), mouserayid;
var container;
var camera, controls, scene, raycaster, renderer;
var objects = [];
var focus;
var materialVisible, material1, materialSoftEdge, materialHighlighted, materialSoftlighted, materialSolid, materialFrontier;
var activeshape1 = -1;
var activeshape1shadoweddstate;
var tolerance = 0.0001;
var hlpattern = -1;

var verbose = false;
var BUILDmode = "fast";
var scaleconst = 1;

var ledge = -1;
var ltriangle = -1;
var lpage = -1;
var lpattern = -1;
var rendererOffset = { x: 0, y : 0 };
var rendererSize = { w: 0, h : 0 };
var view = 'd-view';
var noError = true;
var mnu;
$(window).on("load",  init());
/** constructor */
function Menu ()
{
	var tmp =
	'<div id="menu" class="app-component d-view" >'+
	'	<i class="icon-mesh text-light app-component" id="toggle-d-view"></i>'+
	'	<i class="icon-print text-light" id="print-total"></i>'+
	'	<i class="icon-download text-light" id="download"></i>'+
	'	<i class="icon-menu text-light" id="toggle-settings"></i>'+
	'</div><!-- Button trigger modal -->';

	$('body').append(tmp);
}
/** constructor */
function FlatView ()
{		
	var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
	svg.setAttribute( 'id', 'svg7' );
	svg.setAttribute( 'class', 'app-component d-view' );
	svg.setAttribute( 'width', '210mm' );
	svg.setAttribute( 'height', '297mm' );
	svg.setAttribute( 'viewbox', '0 0 210 297' );
	var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
	g.setAttribute( 'id', 'renderplane' );

	svg.appendChild(g);
	document.body.appendChild(svg);
}
function application ()
{
		var a = true;	
}
function init() {
	dl(' # stuff loaded');

	$('#processing-fail-indicator').fadeOut( 1 );

	$('#processing-success-indicator').fadeOut( 1 );

	$('#processing-indicator').fadeOut(200);
	
	var g = '';
	g +='\nPapier 0.4.3', 'xl';
	g +='\n Copyright (C) 2018  Saint Pierre Thomas ( s1pierro@protonmail.fr )\n\n';
	g +='feel free to contact me at s1pierro@protonmail.com to contribute, in any way';
	fl(g);

	try {
		pobj = $.extend(true, {}, loadWavefrontFromHTLM('#example', 'example'));
		dl(' - load wavefront ex OK');
	}
	catch (err) 
	{ 
		noError = false;
		dl(' * load wavefront ex ERROR <br>'+err);
	}
	try
	{
		patterns = new Patterns(pobj);
		dl(' - create Patterns OK')
	}
	catch (err) 
	{ 
		noError = false;
		dl(' * create Pattern ERROR <br>'+err);
	}
	try
	{
		dispatcher = new Dispatcher (patterns)
		dl(' - create Dispatcher OK')
	}
	catch (err) 
	{ 
		noError = false;
		dl(' * create Dispatcher ERROR <br>'+err);
	}
		
	
	
	var menu = new Menu();
	var flatview = new FlatView();
	
	container = document.createElement( 'div' );
	container.id = 'renderbox';

	document.body.appendChild( container );
	$('#renderbox').addClass('app-component');
	
	try
	{
		camera = new THREE.PerspectiveCamera( 40, $('#renderbox').width() / $('#renderbox').height(), 0.1, 5000 );
		camera.position.x = camarm[0];
		camera.position.y = camarm[1];
		camera.position.z = camarm[2];
	}
	catch (err) 
	{ 
	noError = false;
		dl(' * create camera ERROR <br>'+err);
	}
	dl(' - create camera OK')
	try
	{
		controls = new THREE.TrackballControls( camera );
		controls.rotateSpeed = 3.5;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;
	}
	catch (err) 
	{ 
	noError = false;
		dl(' * create controls ERROR <br>'+err);
	}
	dl(' - create controls OK')


	try
	{
		scene = new THREE.Scene();
	}
	catch (err) 
	{ 
	noError = false;
		dl(' * create scene ERROR <br>'+err);
	}
	dl(' - create scene OK')
	try
	{
		scene.add( new THREE.AmbientLight( 0xffffff ) );
		var light = new THREE.SpotLight( 0xffffff, 0.9 );
		light.position.copy( camera.position );
		light.angle = Math.PI / 3;
		light.castShadow = false;
		scene.add( light );
	}
	catch (err) 
	{ 
	noError = false;
		dl(' * create lights ERROR <br>'+err);
	}
	dl(' - create lights OK')

	try
	{

		materialVisible = new THREE.MeshStandardMaterial(  { color: 0x999999, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;
		materialSoftlighted = new THREE.MeshStandardMaterial(  { color: 0xffaf5f, side: THREE.DoubleSide,  flatShading : true , roughness : 1.0} ) ;
		materialHighlighted = new THREE.MeshStandardMaterial(  { color: 0xff7f2a, side: THREE.DoubleSide,  flatShading : true , roughness : 1.0} ) ;
		materialSolid = new THREE.MeshStandardMaterial(  { color: 0xffffff, side: THREE.DoubleSide,  flatShading : true, roughness : 1.0 } ) ;

		materialSoftEdge = new THREE.LineBasicMaterial( { color: 0x666666, linewidth: 1} );
		materialFrontier = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 3} );
	}
	catch (err) 
	{ 
	noError = false;
		dl(' * create materials ERROR <br>'+err);
	}
	dl(' - create materials OK')
	
	try
	{
		feedscene ();
	}
	catch (err) 
	{ 
	noError = false;
		dl(' * feedscene () ERROR <br>'+err);
	}
	dl(' - feedscene () OK')
		
	if (pobj.prefreeze != undefined )
	{
		dl(' # saved patterns founded');
		for ( var i = 0 ; i < pobj.prefreeze.length ; i++)
			setedgestate (pobj, pobj.prefreeze[i], "frozen");
		patterns.rebuild();
	}
	else dl(' - no saved patterns founded');
	//printWavefront (pobj);
	raycaster = new THREE.Raycaster();		
	try {
		renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } );
		//var rrr = renderer.fghrtlk();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize(  $('#renderbox').width(), $('#renderbox').height() );
		renderer.setClearColor( 0x000000, 0 ); // the default
		renderer.shadowMap.enabled = false;
		renderer.shadowMap.type = THREE.PCFShadowMap;
	}
	catch (err)
	{
	noError = false;
		dl(' * create renderer ERROR'+err)
		$('#startapp').replaceWith( "<h3 id=\"cantstart\">Oups, something went wrong with three.js, WebGL does not seem to be supported on this browser</h3>" );
		fl(err);
		
	}
	dl(' * create renderer OK');
	if (noError)	$('#logput').fadeOut();
	$('#startapp').addClass("startable");



	// shut firefox up !
	var ctx = renderer.context;
	ctx.getShaderInfoLog = function () { return '' };
	
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'touchmove', onDocumentMouseMove, false );
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
	
	toggleDview ();
	rendererOffset.x = $('#renderbox').position().left;
	rendererOffset.y = $('#renderbox').position().top;
	rendererSize.w = $('#renderbox').width();
	rendererSize.h = $('#renderbox').height();//$(window).height() - $(window).height() * ( rendererOffset.y / $(window).height());
	mouse.x = -1;//  ( ( event.clientX - rendererOffset.x ) / ( rendererSize.w  ) ) * 2 - 1;	
	mouse.y = -1;// ( ( event.clientY - rendererOffset.y ) / ( rendererSize.h ) ) * 2 + 1;
}

function blankscene ()
{
	for (let i = scene.children.length - 1; i >= 2; i--) 
		scene.remove(scene.children[i]);
	for (let i = objects.length - 1; i >= 0; i--) 
		objects.splice(i, 1);
  	renderplane.innerHTML = "";

   if ( patterns != undefined )
		for (let i = patterns.children.length - 1; i >= 2; i--) 
			patterns.children.splice(i, 1);
	ledge = -1;
	ltriangle = -1;
	lpage = -1;
	lpattern = -1;

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
	camera.position.z = pobj.height / 2 / Math.tan(Math.PI * 40 / 360);
}
function onWindowResize() {

	rendererOffset.x = $('#renderbox').position().left;
	rendererOffset.y = $('#renderbox').position().top;
	rendererSize.w = $('#renderbox').width();
	rendererSize.h = $('#renderbox').height();//$(window).height() - $(window).height() * ( rendererOffset.y / $(window).height());

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
	
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects , true);

	if ( intersects.length > 0 )
		focus = $.extend(true, {}, intersects[ 0 ].object );
	else if ( focus != undefined ) focus = undefined;

	
	if (mouse.x*mouse.y == mouserayid && focus != undefined )
	{
		patterns.unHighlight();
		var tappedshapeid = focus.tid;

		ltriangle = tappedshapeid;

		if ( activeshape1 != -1 )
		{

			setshapestate(pobj, activeshape1, activeshape1shadoweddstate);
			var e = sharededge (pobj, activeshape1, tappedshapeid);
			if ( e > -1 )
			{			
	
					setshapestate(pobj, activeshape1, "solid" );	
					setshapestate(pobj, tappedshapeid, "solid" );
					activeshape1 = -1 ;
					if (edgestate (pobj, e) != "frozen")
						setedgestate (pobj, e, "frozen");
					else
						setedgestate (pobj, e, "hide");
					ledge = e;
					
					var test = patterns.rebuild(e);
					if (!test)
						setedgestate (pobj, e, "visible");

					activeshape1 = tappedshapeid;
					activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
					setshapestate(pobj, tappedshapeid, "highlight" );
					ltriangle = activeshape1;
				
			}
			else
			{
				activeshape1 = tappedshapeid;
				activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
				setshapestate(pobj, tappedshapeid, "highlight" );
				ltriangle = activeshape1;
				
			}
		}
		else
		{
			activeshape1 = tappedshapeid;
			activeshape1shadoweddstate = shapestate(pobj, tappedshapeid );
			setshapestate(pobj, tappedshapeid, "highlight" );		
			ltriangle = activeshape1;
		}
		if ( ltriangle > -1)
			lpattern = patterns.findTriangleOwner (ltriangle);
		if ( lpattern > -1 && ltriangle != -1 ) lpage = dispatcher.getPageIdxPatternIdx (lpattern);
		if ( lpattern > -1 )
		{
			if (hlpattern > -1 )
				patterns.children[lpattern].unHighlight();
			patterns.children[lpattern].highlight();
			hlpattern = lpattern;
			setshapestate(pobj, ltriangle, 'highlight');
		}
	}
	render();
}

function onDocumentMouseMove( event ) {

	mouse.x =   ( ( event.clientX - rendererOffset.x ) / ( rendererSize.w  ) ) * 2 - 1;	
	mouse.y = - ( ( event.clientY - rendererOffset.y ) / ( rendererSize.h ) ) * 2 + 1;
	
	controls.update();
	render();

}
function render() {
	
	if ( patterns.children.length > 0 )
	{
		var total = 0;
		var infos = '<span class="desc">  '+patterns.children.length+' pattern(s). ';

		if ( dispatcher.nSize('A0') > 0 ) 
		{
			total += dispatcher.nSize('A0')*16;
			infos += dispatcher.nSize('A0')+' x A0, ';
		}
		if ( dispatcher.nSize('A1') > 0 ) 
		{
			total += dispatcher.nSize('A1')*8;
			 infos += dispatcher.nSize('A1')+' x A1, ';
		}
		if ( dispatcher.nSize('A2') > 0 ) 
		{
			total += dispatcher.nSize('A2')*4;
			 infos += dispatcher.nSize('A2')+' x A2, ';
		}
		if ( dispatcher.nSize('A3') > 0 ) 
		{
			total += dispatcher.nSize('A3')*2;
			 infos += dispatcher.nSize('A3')+' x A3, ';
		}
		if ( dispatcher.nSize('A4') > 0 ) 
		{
			total += dispatcher.nSize('A4')*1;
			 infos += dispatcher.nSize('A4')+' x A4. </span>';
		}
		if ( total > 0 )
			$('#print-total').text(total);	
		

			infos = '<p>'+infos+'</p>';

			$('#main-app-dialog-info').html(infos);		
		//$('#scratch-mess').fadeOut();
	}	
	
	$('#main-app-dialog-title').text( pobj.nme );//+' body : '+$( window ).width()+' '+$( window ).height() );
 	if( lpattern > -1 && view == 'd-view') $('#dispatcher-dialog').html(patterns.children[lpattern].papersizereq.s );
 	if( view == 'pages-view')
   {
	   
	   $('#page-nav-crt').text('page '+(lpage+1)+'/'+dispatcher.pages.length );
	   if ( lpattern > -1 )
	   {
			var tmp_p = dispatcher.getPagepattern ( lpattern );
			$('#dispatcher-dialog').html( tmp_p.size );
	   }
	   if (lpattern != -1 )
			dispatcher.pages[lpage].out (renderplane, patterns.children[lpattern].guid, ltriangle);
			else
				dispatcher.pages[lpage].out (renderplane, 0);		
		
		
//	fl(dispatcher.getPagepattern ( lpattern ));
   }
	if ( view == 'print-view' && ltriangle > -1 ) dispatcher.outPageTriangle (ltriangle);
	if ( view == 'd-view')
	{		
		var tmp_p = dispatcher.getPagepattern ( lpattern );
		if ( lpattern > -1 )
			$('#dispatcher-dialog').html(patterns.children[lpattern].papersizereq.s);
		else
			$('#dispatcher-dialog').html('');
		dispatcher.outPattern (ltriangle);
	}
	if ( patterns.children.length == 0 && view != "settings-view" )
	{
			infos = 'There\'s no pattern yet. The way to do everything :'+
			'<ul><li class="text-light">create pattern</li>'+
				'<li class="text-light">extend pattern</li>'+
				'<li class="text-light">merge patterns</li>'+
				'<li class="text-light">split patterns</li>'+
			'</ul><strong>Hit two joined triangles</strong>';

			infos = '<p>'+infos+'</p>';

			$('#dispatcher-dialog').html(infos);		
		//$('#main-app-dialog-info').text('no pattern');		
	}	
	
	//$('#main-app-dialog-title').append('  '+lpattern+'|'+lpage+'|'+ltriangle);
	renderer.render( scene, camera );
}

document.getElementById('fileinput').addEventListener('change', readWavefrontFile, false);

$('body').on('click', '#go-prev-page', function()
{
	fl('page--');
	if ( lpage > 0 ) lpage --;
	$('#dispatcher-dialog').html(dispatcher.pages[lpage].size);
	render();
});
$('body').on('click', '#go-next-page', function()
{
	if ( lpage < dispatcher.pages.length-1 ) lpage ++;
	$('#dispatcher-dialog').html(dispatcher.pages[lpage].size);
	render();

});
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
$('body').on('click', '#ldfex-kgm', function()
{
	loadWavefrontExample('wavefronts/KongorillaMaskFlat.obj');
});

$('body').on('click', '#startapp', function()
{
	$("#startcontainer").fadeOut();

});
function updateRendererOffset ()
{
	camera.aspect =  $('#renderbox').width() / $('#renderbox').height();
	camera.updateProjectionMatrix();
	renderer.setSize( $('#renderbox').width(), $('#renderbox').height() );
	rendererOffset.x = $('#renderbox').position().left;
	rendererOffset.y = $('#renderbox').position().top;
	rendererSize.w = $('#renderbox').width();
	rendererSize.h = $('#renderbox').height();//$(window).height() - $(window).height() * ( rendererOffset.y / $(window).height());
}
function toggleSettingsView ()
{
	controls.enabled = false;
	view = 'settings-view';
	$(".app-component")
		.removeClass("print-view pages-view settings-view d-view")
			.addClass(view);
	updateRendererOffset ();
	render();
}
function togglePrintView ()
{
	controls.enabled = false;
	view = 'print-view';
	$(".app-component")
		.removeClass("print-view pages-view settings-view d-view")
			.addClass(view);
	updateRendererOffset ();
	render();
}
function toggleDview ()
{				
	controls.enabled = true;
	view = 'd-view';
	$(".app-component")
		.removeClass("print-view pages-view settings-view d-view")
			.addClass(view);
	updateRendererOffset ();
	render();
}
function togglePagesView ()
{
	controls.enabled = true;
	view = 'pages-view';
	$(".app-component")
		.removeClass("print-view pages-view settings-view d-view")
			.addClass(view);
	updateRendererOffset ();
	//lpage = dispatcher.getPageIdxPatternIdx (lpattern);
	render();

}

$('body').on('click', '#svg7', function()
{
	lpage = dispatcher.getPageIdxPatternIdx (lpattern);
	togglePagesView ();
});
$('body').on('click', '#print-total', function()
{
	togglePrintView ();

});
$('body').on('click', '#toggle-d-view', function()
{
	toggleDview ();

});
$('body').on('click', '#renderbox', function()
{
//	toggleDview ();

});
$('body').on('click', '#close-settings', function()
{
	toggleDview ();
		
		controls.enabled = true;
});
$('body').on('click', '#toggle-settings', function()
{
	fl('settings');

		toggleSettingsView ();
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
  var printSVG = function()
    {
        var popUpAndPrint = function()
        {
            var mySVG = $('#svg7');
            var width = parseFloat(mySVG.getAttribute("width"));
            var height = parseFloat(mySVG.getAttribute("height"));
            var printWindow = window.open('doc', 'PrintMap', 'width=' + width + ',height=' + height);
            
            printWindow.document.writeln($(cont).html());
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
        setTimeout(popUpAndPrint, 500);
    }
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
