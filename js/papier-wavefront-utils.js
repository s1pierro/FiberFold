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

/**
	@function getwavefrontproperties 
	@param {object} o - the mesh to analisys
*/
function getwavefrontproperties (o)
{
	var xmax = obj.vertices[0][0];
	var xmin = obj.vertices[0][0];
	var ymax = obj.vertices[0][1];
	var ymin = obj.vertices[0][1];
	var zmax = obj.vertices[0][2];
	var zmin = obj.vertices[0][2];

	for ( var i = 0 ; i < obj.vertices.length ; i++)
	{
		if ( obj.vertices[i][0] > xmax ) xmax =  obj.vertices[i][0]
		if ( obj.vertices[i][0] < xmin ) xmin =  obj.vertices[i][0]
		if ( obj.vertices[i][1] > ymax ) ymax =  obj.vertices[i][1]
		if ( obj.vertices[i][1] < ymin ) ymin =  obj.vertices[i][1]
		if ( obj.vertices[i][2] > zmax ) zmax =  obj.vertices[i][2]
		if ( obj.vertices[i][2] < zmin ) zmin =  obj.vertices[i][2]
	}

	o.sx = xmax-xmin;
	o.sy = ymax-ymin;
	o.sz = zmax-zmin;
	
}
/**
	@function  parsewavefront
	@param {object} objText - a string containing the mesh defined
	@param {text} id - the id to attibute to the created mesh object
	@returns {object} an object that store mesh define in a format
	suitable to the app
*/
function parsewavefront(objText, id) {
	var frzlist = false;
	var nv = 0;
	var nt = 0;
	var ng = 0;
	var obj = {};
	var freeze;
	var vertexMatches = objText.match(/^v( -?\d+(\.\d+)?){3}$/gm);
//	var triMatches = objText.match(/^f( \d+){3}$/gm);
	var triMatches = objText.match(/^f( \d+){3,4}$/gm);
	var gMatches = objText.match(/^f( \d+){3,4}$|^usemtl (.+)$/gm);

	var positionMatches = objText.match(/^position( -?\d+(\.\d+)?){3}$/gm);
	var frzMatches = objText.match(/^#frz( \d+){1,}$/gm);
	
	if (vertexMatches) {
		obj.vertices = vertexMatches.map(function(vertex) {
			nv++;
			var vertices = vertex.split(" ");
			vertices.shift(); 
			return Float64Array.from(vertices);;
		});
	}
	if (positionMatches) {

		console.log (positionMatches );
	}
	if (frzMatches) {
		fl(frzMatches);
			var freezed = frzMatches[0];//.map(function(frz) {

				freeze = freezed.split(" ");
				freeze.shift();	
			var freeze = Uint16Array.from(freeze);
	//	});
	}
	fl(freeze);

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
	rotateWavefront (obj, 21.4, 43.3, 66.3);
/*
	rotateWavefront (obj, getRandomArbitrary(0, 1),
								 getRandomArbitrary(0, 1),
								 getRandomArbitrary(0, 1));	
**/

	syncTriangleSomOrder (obj);
	genNormales(obj);
	obj.nv = nv;
	obj.nt = nt;
	obj.ng = ng;
	
	var xmax = obj.vertices[0][0];
	var xmin = obj.vertices[0][0];
	var ymax = obj.vertices[0][1];
	var ymin = obj.vertices[0][1];
	var zmax = obj.vertices[0][2];
	var zmin = obj.vertices[0][2];

	for ( var i = 0 ; i < obj.vertices.length ; i++)
	{
		if ( obj.vertices[i][0] > xmax ) xmax =  obj.vertices[i][0]
		if ( obj.vertices[i][0] < xmin ) xmin =  obj.vertices[i][0]
		if ( obj.vertices[i][1] > ymax ) ymax =  obj.vertices[i][1]
		if ( obj.vertices[i][1] < ymin ) ymin =  obj.vertices[i][1]
		if ( obj.vertices[i][2] > zmax ) zmax =  obj.vertices[i][2]
		if ( obj.vertices[i][2] < zmin ) zmin =  obj.vertices[i][2]
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
	obj.height = height*1.5;

	translateWavefront (obj, -mx, -my, -mz);
	obj.sx = xmax-xmin;
	obj.sy = ymax-ymin;
	obj.sz = zmax-zmin;
	$('#sizeX').text((obj.sx/10).toFixed(2));
	$('#sizeY').text((obj.sy/10).toFixed(2));
	$('#sizeZ').text((obj.sz/10).toFixed(2));
	//
	if (frzlist)
	{
		for ( var i = 0 ; i < freeze.length ; i++)
		{
			
			setedgestate (obj, freeze[i], 'freeze');
		}
	}
	fl(obj);
	return obj;
}
window['parsewavefront'] = parsewavefront;

function genEdge (obj )
{
	var edgeOverBurdedError = false;
	
	for ( var i = 0 ; i < 	obj.triangles.length ; i++)
	{
		addEdge (obj, obj.triangles[i][obj.triangles[i].length-1], obj.triangles[i][0], i );		
		for ( var  j = 0 ; j < obj.triangles[i].length-1 ; j++ )
			addEdge (obj, obj.triangles[i][j], obj.triangles[i][j+1], i );
	}
	obj.ne = obj.edges.length;	
	
	for ( var i = 0 ; i < obj.edges.length ; i++)
		if ( obj.edges[i].tri.length > 2 )
			edgeOverBurdedError = true;
	if (edgeOverBurdedError)
		alert ( 'Error, the mesh contains edges that are shared by more than'+
				 ' two triangles. Some pattern flattening will be corrupted');

}
window['genEdge'] = genEdge;
function addEdge (obj, es1, es2, t)
{
	var e = gotEdge (obj, es1, es2 );
	if (e == -1)
	{
		var tmp = { som : [es1, es2], tri : [t], state : "hide", id : obj.edges.length };
		obj.edges.push (tmp);
	}
	else
	{
		if( gotTriangleEdge (obj, es1, es2, t ) == -1 ) obj.edges[e].tri.push (t);
	}
}
window.addEdge = addEdge;
function gotEdge (obj, es1, es2 )
{
	for ( var i = 0 ; i < 	obj.edges.length ; i++)
if ( ( obj.edges[i].som[0] == es1 && obj.edges[i].som[1] == es2 ) |
			  ( obj.edges[i].som[0] == es2 && obj.edges[i].som[1] == es1 ) )
			return i;
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
function scaleWavefront (wavefront, scale)
{
	fl( 'scaling '+scale);
	for ( var i = 0 ; i < wavefront.vertices.length ; i ++ )
	{

		wavefront.vertices[i][0] =  parseFloat(wavefront.vertices[i][0])*scale;
		wavefront.vertices[i][1] =  parseFloat(wavefront.vertices[i][1])*scale;
		wavefront.vertices[i][2] =  parseFloat(wavefront.vertices[i][2])*scale;

	}	
	var xmax = wavefront.vertices[0][0];
	var xmin = wavefront.vertices[0][0];
	var ymax = wavefront.vertices[0][1];
	var ymin = wavefront.vertices[0][1];
	var zmax = wavefront.vertices[0][2];
	var zmin = wavefront.vertices[0][2];

	for ( var i = 0 ; i < wavefront.vertices.length ; i++)
	{
		if ( wavefront.vertices[i][0] > xmax ) xmax =  wavefront.vertices[i][0]
		if ( wavefront.vertices[i][0] < xmin ) xmin =  wavefront.vertices[i][0]
		if ( wavefront.vertices[i][1] > ymax ) ymax =  wavefront.vertices[i][1]
		if ( wavefront.vertices[i][1] < ymin ) ymin =  wavefront.vertices[i][1]
		if ( wavefront.vertices[i][2] > zmax ) zmax =  wavefront.vertices[i][2]
		if ( wavefront.vertices[i][2] < zmin ) zmin =  wavefront.vertices[i][2]
	}

	wavefront.sx = xmax-xmin;
	wavefront.sy = ymax-ymin;
	wavefront.sz = zmax-zmin;
	$('#sizeX').text((wavefront.sx/10).toFixed(2));
	$('#sizeY').text((wavefront.sy/10).toFixed(2));
	$('#sizeZ').text((wavefront.sz/10).toFixed(2));


	
	
	
}

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
			patterns = new Patterns(pobj);
			feedscene();
		$('#settings').fadeOut(); 
		$('#credits').fadeIn();
		activeshape1 = -1;
		controls.enabled = true;
			renderer.render( scene, camera );
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}
function loadWavefrontExample(file) {
	
	jQuery.get(file, function(data) {

		var obj = parsewavefront(data, 0);
		pobj = $.extend(true, {}, obj);
		//l(wavefront);
		patterns = new Patterns(pobj);
		blankscene ();
		feedscene();
		$('#settings').fadeOut(); 
		$('#credits').fadeIn();
		activeshape1 = -1;
		controls.enabled = true;
		renderer.render( scene, camera );

	});
}/*
	fl(file);
	var f = file;
	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
			fl('contents')
			var obj = parsewavefront(e.target.result, 0);
			pobj = $.extend(true, {}, obj);
			//l(wavefront);
			patterns = new Patterns(pobj);
			blankscene ();
			feedscene();
		$('#settings').fadeOut(); 
		$('#credits').fadeIn();
		activeshape1 = -1;
		controls.enabled = true;
			renderer.render( scene, camera );
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}*/
function getEdgeId (o, s1, s2)
{
	if ( s1 == s2 ) return -2;
	if ( s1 == -1 | -1 == s2 ) return -3;
	for (var i = 0 ; i < o.edges.length ; i++ )
	{
		var ok1 = false;
		var ok2 = false;
		for ( var j = 0 ; j < o.edges[i].som.length ; j++ )
		{
			if ( o.edges[i].som[j] == s1 ) ok1 = true;
			if ( o.edges[i].som[j] == s2 ) ok2 = true;	
		}
		if ( ok1 && ok2 ) return i;
	}
	return -1;
}
function sharededge ( o, triangle_1, triangle_2)
{
	if ( triangle_1 == triangle_2 ) return -2;
	if ( triangle_1 == -1 | -1 == triangle_2 ) return -3;
	for (var i = 0 ; i < o.edges.length ; i++ )
	{
		var ok1 = false;
		var ok2 = false;
		for ( var j = 0 ; j < o.edges[i].tri.length ; j++ )
		{
			if ( o.edges[i].tri[j] == triangle_1 ) ok1 = true;
			if ( o.edges[i].tri[j] == triangle_2 ) ok2 = true;	
		}
		if ( ok1 && ok2 ) return i;
	}
	return -1;
}
function syncTriangleSomOrder (o) 
{

	var td = new ToDo ();
	td.add(0);
	
	var flipCnt = 0;

	var dnl = new processedelements ();

	var cnt = 0;
	while (td.isEmpty() == false)
	{		
			var crtTri = td.next();
		//	fl('\nLoop ('+cnt+') start, triangle : '+crtTri+'\n##################');
			dnl.add (crtTri);
			var tmp = findJoinedTriangles (o, crtTri );
			// we need to elimanate triangles that have already by checked
			for (let i = tmp.length - 1; i >= 0; i--) 			
				if (true == dnl.is(tmp[i]))
					tmp.splice(i, 1);
		//	fl(tmp.length+' triangle to check');
		//	fl(tmp);
					
			for (var i = 0 ; i < tmp.length ; i++)
			{
				//TODO test each triange with crtTri
				//fl('is done '+tmp[i]+' : '+dnl.is(tmp[i]));
				if (dnl.is(tmp[i]) == false )
				{
					if ( doesTrianleNeedFlip (o, tmp[i], crtTri) == true )
					{
						
						flipTriangle (o, tmp[i]);
						flipCnt++;
					}
					td.add(tmp[i]);
					dnl.add (tmp[i]);
				}
			}
			td.done(crtTri);
			cnt++;
	}
	if ( cnt != o.triangles.length ) alert('WARNING,the mesh is not monobloc, flattening errors could occur.')
//	fl (dnl.pe);
	//fl(flipCnt+' triangle(s) fliped')
	
	//if ( dnl.is(tmp[i]) == false ) td.add(tmp[i]);	
}

function doesTrianleNeedFlip (o, t, ref) 
{
//TODO Emergency, Very important.

	var s1 = o.edges[sharededge ( o, t, ref )].som[0];
	var s2 = o.edges[sharededge ( o, t, ref )].som[1];
	
	var st1 = -1;
	var st2 = -1;
	
	if ( o.triangles[t][0] == s1 && o.triangles[t][1] == s2 ) st1 = 1;
	if ( o.triangles[t][1] == s1 && o.triangles[t][2] == s2 ) st1 = 1;
	if ( o.triangles[t][2] == s1 && o.triangles[t][0] == s2 ) st1 = 1;
						
	if ( o.triangles[ref][0] == s1 && o.triangles[ref][1] == s2 ) st2 = 1;
	if ( o.triangles[ref][1] == s1 && o.triangles[ref][2] == s2 ) st2 = 1;
	if ( o.triangles[ref][2] == s1 && o.triangles[ref][0] == s2 ) st2 = 1;
	
	if (st1 == st2 )
		return true;
	return false;
}
function findJoinedTriangles (o, t)
{
	var tmp = TRIANGLEgetedges (o, t);
	var tmp2 = [];
	for ( var i = 0 ; i < tmp.length ; i ++ )
		for ( var j = 0 ; j < o.edges[tmp[i]].tri.length ; j++ )
			if ( o.edges[tmp[i]].tri[j] != t )
				tmp2.push(o.edges[tmp[i]].tri[j])
	return tmp2;
}
function flipTriangle (o, t) 
{
	var tmp = $.extend(true, {}, o.triangles[t]);
	o.triangles[t][0] = tmp[1];
	o.triangles[t][1] = tmp[0];
}

function TRIANGLEgetedges (o, t) 
{
	var tmp = [];
	for( var i = 0 ; i < o.edges.length ; i++ )
	{
		if ( JUNCTIONgottriangle (o.edges[i], t) != -1 ) tmp.push(i);
	}
	return tmp;
}
function JUNCTIONgottriangle (j, t)
{
	for( var i = 0 ; i < j.tri.length ; i++ )
		if ( j.tri[i] == t ) return i;
	return -1;
}
function edgestate (o, e)
{
	return o.edges[e].state;
}
function setedgestate (o, e, s)
{	
	scene.children[(2+e)].visible = true;
	o.edges[e].state = s;
	if( s == "visible")
	scene.children[(2+e)].material = materialFrontier;
	if( s == "freeze")
	{
		scene.children[(2+e)].visible = false;
	}
	if( s == "highlight")
	scene.children[(2+e)].material = materialFrontier;
	if( s == "hide")
	{
		scene.children[(2+e)].visible = false;
	}
}
function shapestate (o, t)
{
	l('## shape('+t+').state : '+o.triangles[t].state);
	return o.triangles[t].state;
}
function setshapestate (o, t, s)
{
	if ( s == undefined )
	fl('-#- ERROR unable to set shape ( '+t+' ) state to '+s+' leaving function "setshapestate"', 'lr');

	o.triangles[t].state = s;
	if( s == "visible")
	{
		scene.children[(2+t+o.ne)].material = materialVisible;
		scene.children[(2+t+o.ne)].visible = true;
	}
	if( s == "solid")
	{
		scene.children[(2+t+o.ne)].material = materialSolid;
		scene.children[(2+t+o.ne)].visible = true;
	}
	if( s == "highlight")
	{
		scene.children[(2+t+o.ne)].visible = true;
		scene.children[(2+t+o.ne)].material = materialHighlighted;
	}
}
/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@protonmail.fr
	Licenced under the termes of the GNU GPL v3
*/
