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

/** @constructor */
function Patterns ()
{
	this.children = [];
	// GUID might always be useless ... or not
	this.guid = uuidv4();
}
Patterns.prototype.addPattern = function (pattern)
{
	this.children.push(pattern);
}
Patterns.prototype.rebuild = function (o)
{
	// first of all, we erase patterns
	this.children.splice (0, this.children.length);
	//console.clear();
	// we need to create and fill freezed edges list
	var freezedlist = [];
	for ( var i = 0 ; i < o.edges.length ; i++ )
		if (edgestate(o, i) == "freeze" ) freezedlist.push(i);

	// Let's now dispatch those freezed edges into different patterns
	
	while ( freezedlist.length > 0 )
	{
		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < freezedlist.length )
		{
			var j = 0;
			while ( add == -1 && j < this.children.length )
			{
				add = this.children[j].addEdge (o, freezedlist[i] );
				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	
			var tmp = new Pattern ();
			tmp.addEdge(o, freezedlist[0]);
			tmp.gentriangles(o);
			this.addPattern(tmp);
			freezedlist.splice(0, 1);	
		}
	}
	
	// precedent code produce patterns defs from freezed edges, by this way,
	// it cannot add single triangle patterns, the fallowing for loop process
	// those single triangles pattern
	
	for (var i = 0 ; i < o.triangles.length ; i++ )
		if ( this.findTriangleOwner(i) == -1 && shapestate(o, i) == "solid" )
		{
			var tmp = new Pattern ();		
			tmp.addTriangle(i);
			tmp.genFrontiers (o);
			this.addPattern(tmp);
		}
	// show some help to the user if no pattern has been created yet					
	if ( this.children.length > 0 )
		$('#scratch-message').fadeOut();
	else
		$('#scratch-message').fadeIn();
		  	
 	// At this point Patterns are correctly defined but they have not been flattened yet
  	
 	for ( var i = 0 ; i < this.children.length ; i++ ) this.children[i].flatten(o);
 	
	// Let's finally blank and refill the final document with our new computed
	// patterns
	
  	renderplane.innerHTML = "";
	for ( var i = 0 ; i < this.children.length ; i++ )
	{
		this.children[i].addToFinalDocument(renderplane);
	}
	//fl(this.children);
}
Patterns.prototype.findTriangleOwner = function (triangle)
{
	for (var i = 0 ; i < this.children.length ; i++ )
		for ( var j = 0 ; j < this.children[i].triangles.length ; j ++ )	
			if ( this.children[i].triangles[j] == triangle )
				return i;
	return -1;
}


/** @constructor */
function Pattern ()
{
	this.triangles = [];
	this.trianglesflatcoord = [];
	this.edges = [];
	this.frontier = [];
	this.guid = uuidv4();
}
/**
  Search for a triangle by it's id into pattern
  @param {number} t - The id of the triangle to look find
  @returns {number} The index of the triangle into member 
  triangles[] or -1 if the pattern doesn' own the triangle
  */
Pattern.prototype.owntriangle = function (t)
{
	for( var i = 0 ; i < this.triangles.length ; i++ )	
		if ( this.triangles[i] == t ) return i;
	return -1;
}
Pattern.prototype.gentriangles = function (o)
{

	for( var i = 0 ; i < this.edges.length ; i++ )
		for( var j = 0 ; j < o.edges[this.edges[i]].tri.length ; j++ )
			if ( this.owntriangle ( o.edges[this.edges[i]].tri[j] ) == -1 )
			{
				this.addTriangle(o.edges[this.edges[i]].tri[j]);
				setshapestate(o, o.edges[this.edges[i]].tri[j], "solid");
			}
	this.genFrontiers(o);
}
/**
  Add triangle id to the member triangles[]
  @param {number} t - The id of the triangle to add
  @returns {number} 0 if succesful, -1 if triangle is already owned
  */
Pattern.prototype.addTriangle = function (t)
{
	for ( var i = 0 ; i < this.triangles.length ; i++ )
	{
		if ( this.triangles[i] == t ) return -1;
	}
	this.triangles.push(t);
	return 0;
}
Pattern.prototype.addEdge = function (o, edge)
{

	if ( this.triangles.length == 0 && this.edges.length == 0)
	{
		this.edges.push (edge);
		return 0;
	}
	var t1 = o.edges[edge].tri[0];
	var t2 = o.edges[edge].tri[1];
	//l(pattern);
	for ( var i = 0 ; i < this.edges.length ; i++ )
		if ( this.edges[i] == edge )	return -2;
	for ( var i = 0 ; i < this.triangles.length ; i++ )
	{
		if (t1 == this.triangles[i] | t2 == this.triangles[i] )
		{
			this.edges.push(edge);
			this.gentriangles (o);
			return 1;
		}
	}
	return -1;
}
Pattern.prototype.getTriangleIndex = function (t)
{
	for ( var i = 0 ; i < this.triangles.length ; i++ )
		if ( t == this.triangles[i] ) return i;
	return -1;
}
Pattern.prototype.updateStats = function ()
{
	//TODO
	var nNod, nTri, nEdg, nFro;
	var maxX, minX, maxY, minY;
}
Pattern.prototype.ownFrontier = function (f)
{
	for( var i = 0 ; i < this.frontier.length ; i++ )	
		if ( this.frontier[i] == f ) return i;
	return -1;
}
Pattern.prototype.genFrontiers = function (o) // find fronier from junctions && triangles lists
{
	l('## PATTERNgenfrontier ##');
	for( var i = 0 ; i < this.triangles.length ; i++ )
	{
		var tmp = TRIANGLEgetedges (o, this.triangles[i]);
		for ( var j = 0 ; j < tmp.length ; j++ )
			if ( ( this.ownFrontier( tmp[j]) == -1 ) && ( edgestate(o, tmp[j]) != "freeze" ) )
			{
				this.frontier.push (tmp[j]);
				setedgestate (o, tmp[j], "visible");
			}
	}
}
Pattern.prototype.addToFinalDocument = function (renderplane)
{
	var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
	g.setAttribute( 'id', this.guid );
	
	for ( var i = 0 ; i < this.triangles.length ; i++ )
	{
		var tmptri = this.trianglesflatcoord[i];
		var svgtrigon =  tmptri[0].c[0]+', '+tmptri[0].c[1]+
						 ' '+tmptri[1].c[0]+', '+tmptri[1].c[1]+
						 ' '+tmptri[2].c[0]+', '+tmptri[2].c[1];
		var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
		svg.setAttribute('points', svgtrigon);
		svg.setAttribute('class', 'flatshape' );
		g.appendChild(svg);
	}
	renderplane.appendChild(g);
}
Pattern.prototype.flatten = function (o)
{
	this.flattenTrianglesCoord (o);
	this.assembleFlattenedTriangles (o);
}

Pattern.prototype.flattenTrianglesCoord = function (o)
{
 	// let's calculate the flat coord of each triangle
 	//================================================
 	// mistake was done earlyer, pattern triangles ids are store in an array of array
 	// instead of an array of (js) objects
 	// dont wand to rewrite this now, so flat coordinates will be store in a separate array
 	// of array - SO - P.triangles[x] & P.trianlesflatcoord[x] refer to the same triangle
 	// and will always be
 	// the other reason why is that full OOP rewrite is planed
 	//================================================


	for ( var j = 0 ; j < this.triangles.length ; j++ )
	{
		var id = this.triangles[j];
		var n = o.trianglesnorm[id];

		var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
		var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
		// La,matrice de transformation peut etre construite
		var itpmat = geninterpmat (bullet, target);

		var w = $.extend(true, {}, o);
		
		for ( var i = 0 ; i < w.nv ; i++ )
			w.vertices[i] = applymatNscale(itpmat, w.vertices[i]);
		
		var tmptri = [ {c : [(w.vertices[w.triangles[id][0]][0]), 
							 (w.vertices[w.triangles[id][0]][1]), 0], sid : o.triangles[id][0] },

							{c : [(w.vertices[w.triangles[id][1]][0]), 
							 (w.vertices[w.triangles[id][1]][1]), 0], sid : o.triangles[id][1] },

						   {c : [(w.vertices[w.triangles[id][2]][0]), 
							 (w.vertices[w.triangles[id][2]][1]), 0], sid : o.triangles[id][2] }];

		this.trianglesflatcoord.push(tmptri);
	}
}

Pattern.prototype.assembleFlattenedTriangles = function (o)
{
	var done = new processedelements(); 		
	done.add ( this.triangles[0] );
	var k;
	for ( var j = 0 ; j < this.edges.length ; j++ )
	{
		// pattern cannot own single triangle edges, so we're safe with
		// fallowing code
		var vt1s, vt1e, vt2s, vt2e;
		var vs = o.edges[this.edges[j]].som[0];
		var ve = o.edges[this.edges[j]].som[1];

		for ( var m = 0 ; m < o.triangles[o.edges[this.edges[j]].tri[0] ].length ; m++)
		{
			if ( o.triangles[o.edges[this.edges[j]].tri[0] ][m] == vs )
				vt1s = m;
			if ( o.triangles[o.edges[this.edges[j]].tri[0] ][m] == ve )
				vt1e = m;
		}
		for ( var m = 0 ; m < o.triangles[o.edges[this.edges[j]].tri[1] ].length ; m++)
		{
			if ( o.triangles[o.edges[this.edges[j]].tri[1] ][m] == vs )
				vt2s = m;
			if ( o.triangles[o.edges[this.edges[j]].tri[1] ][m] == ve )
				vt2e = m;
		}
		var t = this.getTriangleIndex ( o.edges[this.edges[j]].tri[0] );
		var t2 = this.getTriangleIndex( o.edges[this.edges[j]].tri[1] );

		var target = vectfromvertices (this.trianglesflatcoord[t][vt1s].c,
												 this.trianglesflatcoord[t][vt1e].c);

		var bullet = vectfromvertices (this.trianglesflatcoord[t2][vt2s].c,
												 this.trianglesflatcoord[t2][vt2e].c);

		if ( done.is ( o.edges[this.edges[j]].tri[0] ) )
		{
			var itpmat = geninterpmat (bullet, target);
		   var pp = $.extend( true, [], this.trianglesflatcoord[t2]);
			for ( var ii = 0 ; ii < 3 ; ii++ )
				this.trianglesflatcoord[t2][ii].c = applymat(itpmat, pp[ii].c);
			k = 1;
		}
		else
		{
			var itpmat = geninterpmat (target, bullet);
			var pp = $.extend(true, [], this.trianglesflatcoord[t]);
			for ( var ii = 0 ; ii < 3 ; ii++ )
				this.trianglesflatcoord[t][ii].c = applymat(itpmat, pp[ii].c);
			k = 0;			
		}
		done.add ( o.edges[ this.edges[j] ].tri[k] );
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
