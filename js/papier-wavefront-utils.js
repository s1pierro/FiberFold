/*
	this file is a part of 
	paperseed 0.0.1
		
	Author : Saint Pierre Thomas
	feel free to contact me at spierro@free.fr
	Licenced under the termes of the GNU GPL v3
*/
'use strict';
function l (s, format)
{
	if (!verbose) return;
	if ( format == 'xlb')
	{
		s = '%c'+s;
		console.log(s, 'color: blue; font-size: x-large');
	}
	else if ( format == 'lb')
	{
		s = '%c'+s;
		console.log(s, 'color: blue; font-size: large');
	}
	else if ( format == 'lg')
	{
		s = '%c'+s;
		console.log(s, 'color: green; font-size: large');
	}
	else if ( format == 'xl')
	{
		s = '%c'+s;
		console.log(s, 'color: black; font-size: x-large');
	}
	else if ( format == 'l')
	{
		s = '%c'+s;
		console.log(s, 'color: black; font-size: large');
	}
	else if ( format == 'blr')
	{
		s = '%c'+s;
		console.log(s, 'color: red; font-size: large; font-weight: 700');
	}
	else	console.log(s);
}
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
				obj.triangles[ng].state="visible";
				obj.triangles[ng].mat = mat;
				ng++;
			}
		});
	}
	for (var i = 0 ; i < obj.triangles.length ; i++ )
		obj.triangles[i].id  = id;
	obj.edges = [];
	genEdge (obj );
	
	genNormales(obj);
	obj.nv = nv;
	obj.nt = nt;
	obj.ng = ng;
	return obj;
}
window['parsewavefront'] = parsewavefront;

function genEdge (obj )
{
 console.log ('### nt'+obj.triangles.length);
	for ( var i = 0 ; i < 	obj.triangles.length ; i++)
	{
		addEdge (obj, obj.triangles[i][obj.triangles[i].length-1], obj.triangles[i][0], i );		
		for ( var  j = 0 ; j < obj.triangles[i].length-1 ; j++ )
			addEdge (obj, obj.triangles[i][j], obj.triangles[i][j+1], i );
	}
		obj.ne = obj.edges.length;
}
window['genEdge'] = genEdge;
function addEdge (obj, es1, es2, t)
{
	var e = gotEdge (obj, es1, es2 );
	if (e == -1)
	{
		var tmp = { som : [es1, es2], tri : [t], state : "hide", id : obj.edges.length };
		obj.edges.push (tmp);
	//	console.log ('## tri '+t+' ## add edge : ');
	//	console.log (tmp);
	}
	else
	{
		if( gotTriangleEdge (obj, es1, es2, t ) == -1 )
		{
			obj.edges[e].tri.push (t);
//			console.log ('## tri '+t+' ## update edge : '+obj.edges[e]);
		}
	//	else console.log ('## tri '+t+' ## already exist');
			
	}
}
window.addEdge = addEdge;
function gotEdge (obj, es1, es2 )
{
	for ( var i = 0 ; i < 	obj.edges.length ; i++)
	{

		if ( ( obj.edges[i].som[0] == es1 && obj.edges[i].som[1] == es2 ) |
			  ( obj.edges[i].som[0] == es2 && obj.edges[i].som[1] == es1 ) )
		{
		//	console.log ('edge found : '+i+' es1 '+es1+', es2 '+es2);
			return i;
		}
	//	console.log ('edge not found : '+i+' es1 '+es1+', es2 '+es2);
	
	
	}
	return -1;
}

function gotTriangleEdge (obj, es1, es2, t )
{

		var e = gotEdge (obj, es1, es2 );
		if ( e != -1 )
		{
			for ( var j = 0 ; j < obj.edges[e].tri.length ; j++ )
			{
				if ( obj.edges[e].tri[j] == t )
					return e;
			}
		}
	return -1;
}

function loadWavefrontFromHTLM(object, id) {
	
	var contents = $(object).text();
	var obj = parsewavefront(contents, id);
	return obj;
}
window['loadWavefrontFromHTLM'] = loadWavefrontFromHTLM;

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
function readWavefrontFile(evt) {
blankscene ();
	var f = evt.target.files[0];
	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			var obj = parsewavefront(e.target.result, 0);
			pobj = $.extend(true, {}, obj);
			//l(wavefront);
			feedscene();
		$('#settings').fadeOut(); 
		$('#credits').fadeIn();
		activeshape1 = -1;
			renderer.render( scene, camera );
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}

