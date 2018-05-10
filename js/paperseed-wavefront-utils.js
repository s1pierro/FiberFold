/*
	this file is a part of 
	paperseed 0.0.1
		
	Author : Saint Pierre Thomas
	feel fre to contact me at spierro@free.fr
	Licenced under the termes oftrhe GNU GPL v3
*/
'use strict';
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


