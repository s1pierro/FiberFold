/*
	this file is a part of 
	paperseed 0.0.1
		
	Author : Saint Pierre Thomas
	feel fre to contact me at spierro@free.fr
	Licenced under the termes oftrhe GNU GPL v3
*/
'use strict';
		$('#settings').hide();

////////////////////////////////////////////////////////////////////////////////
//	paperseed core functions
////////////////////////////////////////////////////////////////////////////////

var buffer = {};

var zoom = 100;
var viewangle = 140;
var scaleconst = 50;
var ZlockANGx = 190;
var ZlockANGy = 230;
var ZlockANGz = 0;
var fmat = genimat();
var rmat = genimat();
var tmat = genimat();
var pmat = genimat();
var yAMAX = 160;
var yAMIN = 70;

function initView(x, y, z, zm)
{
	zoom = zm;
	pmat = gentmat(0, 0, 0);
	tmat = gentmat(0, 0, zoom);
	ZlockANGx = x;
	ZlockANGy = y;
	ZlockANGz = z;
	rmat = genrmat( x, y, z);
	genfmat();
}
window['initView'] = initView;
function rotateView(x, y, z)
{
	var tmp = genrmat( x, y, z);
	rmat = multiplymatrix (tmp, rmat);
	genfmat();
}
window['rotateView'] = rotateView;
function rotateViewZlock(x, y)
{
	ZlockANGy -= y;
	ZlockANGx += x;
/*	if ( ZlockANGx < 180 ) ZlockANGx = 180;
	if ( ZlockANGx > 190 ) ZlockANGx = 190;
	if ( ZlockANGy < yAMIN ) ZlockANGy = yAMIN;
	if ( ZlockANGy > yAMAX ) ZlockANGy = yAMAX;*/
//	console.log ('ZlockANGy '+ZlockANGy);
	rmat = genrmat( ZlockANGx, ZlockANGy, ZlockANGz);
}
window['rotateViewZlock'] = rotateViewZlock;
function translateView(x, y, z)
{
	var tmp = gentmat( x, y, z);
	tmat = multiplymatrix (tmp, tmat);

}
window['translateView'] = translateView;
function genfmat() {
	var mat = multiplymatrix(rmat, pmat);
	fmat = multiplymatrix(tmat, mat);
}
window['genfmat'] = genfmat;




function drawScene(container) {  //optimised speed ( cut in lightening acuracy )

  	container.innerHTML = "";
	//$("#arp").attr('transform', 'translate('+(273.44049+ZlockANGy*2)+',-'+(ZlockANGx-50)+')');
	//drawenv(container);
	var mat = multiplymatrix(rmat, pmat);
	fmat = multiplymatrix(tmat, mat);
	genItemszmap(paperseed.Items);
	for ( var v = 0 ; v < paperseed.Items.zmap.length ; v++ )
	{

		var buffer = $.extend(true, {}, paperseed.Items[paperseed.Items.zmap[v][0]].w);
		var origin = $.extend(true, {}, buffer);
		for (var i = 0; i < origin.vertices.length; i++)
			buffer.vertices[i] = applymatNpersp(fmat, origin.vertices[i]);
		for (var i = 0; i < origin.triangles.length; i++)
			buffer.trianglesnorm[i] = applymat(rmat, origin.trianglesnorm[i]);
		genzmap(buffer);
		for (var i = 0; i < buffer.zmap.length ; i++)
		{
			var j = buffer.zmap[i][0];


			var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			var n = buffer.trianglesnorm[ j ][2];

			buffer.triangles[ j ].trigon = buffer.vertices[origin.triangles[j][0]][0]+','+buffer.vertices[origin.triangles[j][0] ][1];
			
			for ( var k = 1 ; k < origin.triangles[j].length ; k++)
				buffer.triangles[ j ].trigon += ' '+buffer.vertices[origin.triangles[j][k]][0]+','+buffer.vertices[origin.triangles[j][k] ][1];

			svg.setAttribute('points',buffer.triangles[j].trigon);
			svg.setAttribute('class', 'ID'+j+'ID shape solid solid-step-'+Math.floor(n*16) );
			
			container.appendChild(svg);
		}
	}
}
window['drawScene'] = drawScene;

function parsewavefront(objText, id) {

	var nv = 0;
	var nt = 0;
	var ng = 0;
	var obj = {};
	var vertexMatches = objText.match(/^v( -?\d+(\.\d+)?){3}$/gm);
//	var triMatches = objText.match(/^f( \d+){3}$/gm);
	var triMatches = objText.match(/^f( \d+){3,4}$/gm);
	var gMatches = objText.match(/^f( \d+){3,4}$|^usemtl (.+)$/gm);

	var positionMatches = objText.match(/^position( -?\d+(\.\d+)?){3}$/gm);
	
	if (vertexMatches) {
		obj.vertices = vertexMatches.map(function(vertex) {
			nv++;
			var vertices = vertex.split(" ");
			vertices.shift(); 
			return Float32Array.from(vertices);;
		});
	}
	if (positionMatches) {

		console.log (positionMatches );
	}

	if (triMatches) {
		obj.triangles = triMatches.map(function(tri) {
			nt++;
			var triangle = tri.split(" ");
			triangle.shift();
//			l(triangles);
			var t = Uint16Array.from(triangle);
			t[0] = t[0]-1;
			t[1] = t[1]-1;
			t[2] = t[2]-1;
			

		//	l(t);
			return t;
		});
	}

	var mat = 'mat';
	if (gMatches) {
		gMatches.map(function(g) {
			var inc = true;
			var gMatch = g.split(" ");
			if (gMatch[0] === 'usemtl')
			{
				gMatch.shift();
				inc = false;
				mat = gMatch[0];
			} else if (gMatch[0] === 'f')
			{	
				obj.triangles[ng].mat = mat;
				ng++;
			}
		});
	}
	for (var i = 0 ; i < obj.triangles.length ; i++ )
		obj.triangles[i].id  = id;
	obj.nv = nv;
	obj.nt = nt;
	obj.ng = ng;
	return obj;
}
window['parsewavefront'] = parsewavefront;
function loadWavefrontFromHTLM(object, id) {
	
	var contents = $(object).text();
	var obj = parsewavefront(contents, id);
	genNormales(obj);	
	p(obj);	
	genzmap(obj);
	return obj;
}
window['loadWavefrontFromHTLM'] = loadWavefrontFromHTLM;
function p(s)
{
console.log(s);
}
function genzmap(obj) {
	var tmp = new Array();

	for (var i = 0; i < obj.triangles.length; i++)
	{
		
		var somme = 0;
		for (var l = 0; l < obj.triangles[i].length ; l++ )
			somme += obj.vertices[obj.triangles[i][l]][2];
		somme = somme/obj.triangles[i].length;
		//p('Triangle['+i+'].somme = '+somme);
		//p('Triangle['+i+'].n.z = '+obj.triangles[ i ].n[2]);
		var n = obj.trianglesnorm[ i ][2];

		if ( n>0)
		{
			var tmp2 = new Array(i, somme);
			tmp.push(tmp2);
		}
	}

	var tmp2 = $.extend(true, [], tmp);
//	console.log('#? '+obj.triangles.length+' - '+tmp.length);
	obj.zmap = tmp;
	obj.zmap.sort(function(a, b) {
		return b[1] - a[1];
	});	

}
window['genzmap'] = genzmap;
function genItemszmap(pcs) {
	if ( typeof genItemszmap.init == 'undefined' ) {
		genItemszmap.init = true;
		
		
	}
	var tmp = new Array();

	for (var i = 0; i < paperseed.Items.length; i++)
		buffer.vertices[i] = applymat(fmat, paperseed.Items[i].w.vertices[0]);

	for (var i = 0; i < paperseed.Items.length; i++) {
		var tmp2 = new Array(i, buffer.vertices[i][2]);
		tmp.push(tmp2);
	}
	pcs.zmap = tmp;
	pcs.zmap.sort(function(a, b) {
		return b[1] - a[1];
	});
}
window['genItemszmap'] = genItemszmap;

function setWavefrontId(w, id) {

	for ( var j = 0 ; j < w.nt  ; j++)
		w.triangles[ j ].id = id;
}
window['setWavefrontId'] = setWavefrontId;


function genNormales(obj) {
		obj.trianglesnorm = [];
	for (var i = 0; i < obj.triangles.length ; i += 1) {
		var norm = normalisevertex(
										vectorproduct(
											vectfromvertices(
												obj.vertices[obj.triangles[i][0]],
												obj.vertices[obj.triangles[i][2]] ).s,
											vectfromvertices(
												obj.vertices[obj.triangles[i][0]],
												obj.vertices[obj.triangles[i][1]] ).s	
										)
									);
		obj.trianglesnorm.push (norm);
		
	}
}
window['genNormales'] = genNormales;

function translateWavefront (wavefront, x, y, z)
{

	for ( var i = 0 ; i < wavefront.vertices.length ; i ++ )
	{

		wavefront.vertices[i][0] =  parseFloat(wavefront.vertices[i][0])+x;
		wavefront.vertices[i][1] =  parseFloat(wavefront.vertices[i][1])+y;
		wavefront.vertices[i][2] =  parseFloat(wavefront.vertices[i][2])+z;

	}	
}
window['translateWavefront'] = translateWavefront;

function rotateWavefront (wavefront, x, y, z)
{
	var tmpmat = genrmat(x, y, z);
	var tmp = wavefront;
	for (var i = 0; i < wavefront.vertices.length; i++)
		wavefront.vertices[i] = applymat(tmpmat, wavefront.vertices[i]);
	genNormales(wavefront); 

}
window['rotateWavefront'] = rotateWavefront;


function initScene()
{

	var zoom = 10;
	var ratio = $("#svg8").width()/$("#svg8").height();
	initView(270, 0, 0, 40);
	$("#svg8").attr('viewBox', '-'+((zoom*ratio)/2)+' -'+(zoom/2)+' '+(zoom*ratio)+' '+zoom);
}
window['initScene'] = initScene;
function buildScene()
{
	var Logo = {};
	var TMPwvft = {};
	Logo = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'logo'));
	paperseed.Items.splice (0, paperseed.Items.length );
	var tmpWvft2 = {};
	
	var vpos = [0, 0, 0];
	var u = 0;
	var v = 0;
	var square = 'a0';
	tmpWvft2 = $.extend(true, {}, Logo);
	var altItem = {id: paperseed.Items.length, pos: vpos,  x: u, y: v, index: 0, w: {}};
	setWavefrontId(tmpWvft2, paperseed.Items.length);			
	altItem.w = $.extend(true, {},tmpWvft2 );
	paperseed.Items.push(altItem);
}
window['buildScene'] = buildScene;
function getFaceId(f) {
	var tmp = $(f).attr('class');
	var tmp2 = tmp.match(/ID.+ID/) + '';
	if (tmp2.includes('ID')) tmp2=tmp2.slice(2, tmp2.length-2);
	return tmp2;
}
window['getFaceId'] = getFaceId;


function add_to_renderplane (renderplane, t)
{
			var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg.setAttribute('points', t);
			svg.setAttribute('class', 'solid' );
			renderplane.appendChild(svg);

}

function buildjunctionsItem (item)
{
			for( var i = 0; i < paperseed.Items[item].w.triangles.length ; i++ )
			{
				addjunction (paperseed.Items[item].w.triangles[i][0], paperseed.Items[item].w.triangles[i][1], i);
				addjunction (paperseed.Items[item].w.triangles[i][1], paperseed.Items[item].w.triangles[i][2], i);
				addjunction (paperseed.Items[item].w.triangles[i][2], paperseed.Items[item].w.triangles[i][0], i);
			}
}



function addjunction (s1, s2, tri) {

	var mrg = false;

	if ( checkjunction (s1, s2, tri) == false )
	{
		for( var i = 0; i < paperseed.Items[0].junctions.length ; i++ )
		{
			if ( ( paperseed.Items[0].junctions[i].som[0] == s1 && paperseed.Items[0].junctions[i].som[1] == s2) |
				  ( paperseed.Items[0].junctions[i].som[1] == s1 && paperseed.Items[0].junctions[i].som[0] == s2) )
				  {	
			  			paperseed.Items[0].junctions[i].tri.push(tri);
					  	mrg = true;
				  }
		}
	}
	else mrg = true;
		
	if ( mrg == false )
	{
		 paperseed.Items[0].junctions.push({ som : [s1, s2], tri : [tri]});
		 }

}
function checkjunction (s1, s2, tri)
{
	for( var i = 0; i < paperseed.Items[0].junctions.length ; i++ )
	{			 

		if ( ( paperseed.Items[0].junctions[i].som[0] == s1 && paperseed.Items[0].junctions[i].som[1] == s2) |
			  ( paperseed.Items[0].junctions[i].som[1] == s1 && paperseed.Items[0].junctions[i].som[0] == s2) )
			  {

			  		for( var j = 0; j < paperseed.Items[0].junctions[i].tri.length ; j++ )
			  			if ( paperseed.Items[0].junctions[i].som[j] == tri )
			  			{
			  				return true;
			  			}
			  }
	}
	return false;
}

function paperseed () {
	var mode = (eval("var __temp = null"), (typeof __temp === "undefined")) ? 
	    "strict": 
	    "non-strict";
	    if (mode == "strict")
	    	l('interprete js : '+mode, 'lg');
		else
	    	l('interprete js : '+mode, 'blr');


	/*======================================================================
	
		Initialisations
		
	----------------------------------------------------------------------*/

	var container = document.getElementById("renderbox");
	var renderplane = document.getElementById("renderplane");
	
	
	if ( typeof paperseed.init == 'undefined' ) {
		
		paperseed.init = true;
		
		paperseed.Items = [];
		paperseed.impression = {printsize: 'A4', npages : 0, printmode : 'desktop', patterns : [] };
		
		
		buildScene ();
		paperseed.Items[0].junctions = [];
		buildjunctionsItem (0);
		

		buffer = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'buffer'));


		for ( var i = 0 ; i < paperseed.Items[0].w.triangles.length ; i++ )
		{
		
		
			var pattern = { triangles : [i], junctions : [] };
			paperseed.impression.patterns.push(pattern);

		}
		
		l(paperseed.impression);
		l(paperseed.Items[0]);
		initScene();	
		drawScene(container);
	}
	var activeshape = 0; 

	// configuration hammerJS

	var myElement = document.getElementById('svg8');
	var mc = new Hammer(myElement);
	mc.get('pan').set({
		direction: Hammer.DIRECTION_ALL
	});
	
	// Évenements fenetre
		
	$(window).on('resize', function() {

		initScene();
		drawScene(container);
	});
	
	// interactions vue
	mc.on("pan", function(ev) {
		if (paperseed.view != 'mobile') {
			rotateView(ev.velocityY * 15, ev.velocityX * 15, 0);
			drawScene(container);
		}
		else {
			window.scrollBy(0,-ev.velocityY*20);
		}
	});
//	$('html, .shape').on('mouseup', function() {
	mc.on("panend", function(ev) 
	{
		var ut = '.ID'+activeshape+'ID';
		$(ut).addClass ('active');
	});


	$('#svg8').on('mousewheel', function(event)
	{
		translateView (0, 0,event.deltaY*event.deltaFactor );
		drawScene(container);
	});
	$('body').on('click', '#close-settings', function() { $('#settings').fadeOut(); });
	$('body').on('click', '#toggle-settings', function() { $('#settings').fadeIn(); });

	$('body').on('click', '.shape', function() {
	
		///////////////////////////////////////////////////////////////////////
		// Dirty implementation trying, will be replace by separate explicit //
		// functions
		///////////////////////////////////////////////////////////////////////


		// on recupere l'id tu triangle selectionné. Cela correspond a sa place
		// dans le tableau Item[activeitem].w.triangles[]
		var id = getFaceId (this);
		activeshape = id;
		// Coloration du triaangl selectionné dans la vue 3D
		$('.active').removeClass('active');
		$(this).addClass ('active');
		// on recupere la normale du triangle
		var n = paperseed.Items[0].w.trianglesnorm[id];
		// on construit deux vecteurs pour l'interpolation
		// - target corespond au plan du document final. Celui qui contient les patrons
		// - bullet, dont le sens est confondu avec l'axe normal a la face selectionnée.
		var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
		var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
		// La,matrice de transformation peut etre construite
		var itpmat = geninterpmat (bullet, target);

		//un peu de bavardage avec la console
		l('bullet', 'l');
		logVector(bullet);
		l('target', 'l');
		logVector(target);
		l('interpolation matrix', 'l');
		logMatrix(itpmat);
	
		var w = $.extend(true, {}, paperseed.Items[0].w);
		
		for ( var i = 0 ; i < w.nv ; i++ )
			w.vertices[i] = applymatNscale(itpmat, w.vertices[i]);
		
		var tmptri = [ [ (w.vertices[w.triangles[id][0]][0]), 
				 (w.vertices[w.triangles[id][0]][1]), 
				 (w.vertices[w.triangles[id][0]][2])  ],
				     
			       [ (w.vertices[w.triangles[id][1]][0]), 
				 (w.vertices[w.triangles[id][1]][1]), 
				 (w.vertices[w.triangles[id][1]][2])  ],
				
			       [ (w.vertices[w.triangles[id][2]][0]), 
				 (w.vertices[w.triangles[id][2]][1]), 
				 (w.vertices[w.triangles[id][2]][2])  ] ];

		

		var svgtrigon = tmptri[0][0]+', '+tmptri[0][1]+
			    ' '+tmptri[1][0]+', '+tmptri[1][1]+
			    ' '+tmptri[2][0]+', '+tmptri[2][1];
		add_to_renderplane (renderplane, svgtrigon);
		var flatmat = gentmat (234.0, 143.0, 0.0);
		
		var trsltri = $.extend(true, [], tmptri);

		for ( var i = 0 ; i < 3 ; i++ )
			trsltri[i] = applymatNscale(flatmat, tmptri[i]);

		
	});	
}
		
window['paperseed'] = paperseed;


$(window).on("load", paperseed ());




