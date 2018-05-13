/*
	this file is a part of 
	paperseed 0.0.1
		
	Author : Saint Pierre Thomas
	feel fre to contact me at spierro@free.fr
	Licenced under the termes oftrhe GNU GPL v3
*/
'use strict';

var buffer = {};

var zoom = 100;
var viewangle = 30;
var scaleconst = 50;
var fmat = genimat();
var rmat = genimat();
var tmat = genimat();
var pmat = genimat();


function initView(x, y, z, zm)
{
	zoom = zm;
	pmat = gentmat(0, 0, 0);
	tmat = gentmat(0, 0, zoom);
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

			if ( buffer.triangles[j].length == 2)
			{
				var svg = document.createElementNS("http://www.w3.org/2000/svg",'line');
				svg.setAttribute('x1',buffer.vertices[origin.triangles[j][0]][0]);
				svg.setAttribute('y1',buffer.vertices[origin.triangles[j][0]][1]);
				svg.setAttribute('x2',buffer.vertices[origin.triangles[j][1]][0]);
				svg.setAttribute('y2',buffer.vertices[origin.triangles[j][1]][1]);

				svg.setAttribute('class', 'junction '+origin.triangles[j].state);
				svg.setAttribute('id', origin.triangles[j].id);
			}
			else
			{
				var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
				var n = buffer.trianglesnorm[ j ][2];

				buffer.triangles[ j ].trigon = buffer.vertices[origin.triangles[j][0]][0]+','+buffer.vertices[origin.triangles[j][0] ][1];
				
				for ( var k = 1 ; k < origin.triangles[j].length ; k++)
					buffer.triangles[ j ].trigon += ' '+buffer.vertices[origin.triangles[j][k]][0]+','+buffer.vertices[origin.triangles[j][k] ][1];

				svg.setAttribute('points',buffer.triangles[j].trigon);
				svg.setAttribute('class', 'shape '+origin.triangles[j].state+' solid step-'+Math.floor(n*16) );
				svg.setAttribute('id', j);
			}
			container.appendChild(svg);
		}
	}
}
window['drawScene'] = drawScene;


function p(s)
{
	if ( silent == true ) return;
	console.log(s);
}
function genzmap(obj)
{
	var tmp = new Array();

	for (var i = 0; i < obj.triangles.length; i++)
	{
		var somme = 0;
		for (var l = 0; l < obj.triangles[i].length ; l++ )
			somme += obj.vertices[obj.triangles[i][l]][2];
		somme = somme/obj.triangles[i].length;
		if (obj.triangles[i].length == 2) somme-=0.21;
		var n = obj.trianglesnorm[ i ][2];
		var tmp2 = new Array(i, somme);
		tmp.push(tmp2);
	}
	var tmp2 = $.extend(true, [], tmp);
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

