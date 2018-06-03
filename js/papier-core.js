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

/** @constructor 
 * @param {object}                   targetmesh - The mesh to flatten.
 * @property {Array.Pattern}           children - The array tht contain patterns.
 * @property {object}                targetMesh - The mesh to flatten.
 * @property {string}             		    guid - A global identifier.
 
 */ 
function Patterns (targetmesh)
{
	this.targetMesh = targetmesh;
	this.children = [];
	// GUID might always be useless ... or not
	this.guid = uuidv4();
}
/** @description
	Update the targeted mesh. That is needed when user load a new mesh.
	
	 @param {object} targetmesh - the new mesh to flatten.
 
 */

Patterns.prototype.updateTargetMesh = function (targetmesh)	
{
	this.targetMesh = targetmesh;
	this.guid = uuidv4();
}
/**
 * @description
 *	simply add a new pattern 
 *
 *	@param {object} pattern - the pattern to add
 *
 */
Patterns.prototype.addPattern = function (pattern)
{
	this.children.push(pattern);
}
/**
 * @description
 *	try to rebuild patterns. 
 * this method build pattern using freezd edges
 	
   step by step, it try to dispatch freezed egdes into patterns by looking if
   they are joined.
   When it cannot, it creat a new pattern.
   
   a temporary var is used, so, if sometings go wrong, it leave the pattern as they were
 
 
 *	@return {boolean=} true  If it succesed to dispatch every edges
 *	@return {boolean=} false  If something goes wrong.
 *
 */
Patterns.prototype.rebuild = function ()
{
	// back up patterns in case of fail
	var pbu = $.extend(true, [], this.children);

	// first of all, we erase patterns
	this.children.splice (0, this.children.length);
	//console.clear();
	// we need to create and fill freezed edges list
	var freezedlist = [];
	for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
		if (edgestate(this.targetMesh, i) == "freeze" ) freezedlist.push(i);

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
				add = this.children[j].addEdge (freezedlist[i] );
				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	
			var tmp = new Pattern (this.targetMesh);
			tmp.addEdge(freezedlist[0]);
			tmp.gentriangles();
			this.addPattern(tmp);
			freezedlist.splice(0, 1);	
		}
	}
	
	// precedent code produce patterns defs from freezed edges, by this way,
	// it cannot add single triangle patterns, the fallowing for loop process
	// those single triangles pattern
	
	for (var i = 0 ; i < this.targetMesh.triangles.length ; i++ )
		if ( this.findTriangleOwner(i) == -1 && shapestate(this.targetMesh, i) == "solid" )
		{
			var tmp = new Pattern (this.targetMesh);		
			tmp.addTriangle(i);
			tmp.genFrontiers ();
			this.addPattern(tmp);
		}
	// show some help to the user if no pattern has been created yet					
	if ( this.children.length > 0 )
		$('#scratch-message').fadeOut();
	else
		$('#scratch-message').fadeIn();
		  	
 	// At this point Patterns are correctly defined but they have not been flattened yet
  	
	fl(this.children);
 	for ( var i = 0 ; i < this.children.length ; i++ )
   {
	   if (!this.children[i].flatten())
	   {
		   
		   this.children = $.extend(true, [], pbu);
		   return false;
	   }
   }
	// Let's finally blank and refill the final document with our new computed
	// patterns
	
  	renderplane.innerHTML = "";
	for ( var i = 0 ; i < this.children.length ; i++ )
	{
		this.children[i].addToFinalDocument(renderplane);
	}
	fl(this.children);
	return true;
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
function Pattern (targetmesh)
{
	this.triangles = [];
	this.trianglesflatcoord = [];
	this.edges = [];
	this.nodes = [];
	this.frontier = [];
	this.guid = uuidv4();
	this.targetMesh = targetmesh;
}
/** @description
  Search for a triangle by it's id into pattern
  @param {number} t - The id of the triangle to look for
  @returns {number} The index of the triangle into member 
  triangles[] or -1 if the pattern doesn' own the triangle
  */
Pattern.prototype.owntriangle = function (t)
{
	for( var i = 0 ; i < this.triangles.length ; i++ )	
		if ( this.triangles[i] == t ) return i;
	return -1;
}
/** @description
	compute the frontier's nodes of the pattern, using the pattern's flattened triangles summits
	And order them to corectly define a shape frontier
 */
Pattern.prototype.genNodes = function ()
{	//console.clear();
	var tmp = [];
	for( var i = 0 ; i < this.trianglesflatcoord.length ; i++ )
	{
		for (var j = 0 ; j < this.trianglesflatcoord[i].length ; j++)
		{
			var duplicate = false;
			for ( var k = 0 ; k < tmp.length ; k++ )
			{
				if ( distance (tmp[k].c, this.trianglesflatcoord[i][j].c ) < 0.0001 &&
				 	  tmp[k].sid == this.trianglesflatcoord[i][j].sid )
				{
					duplicate = true;
					tmp[k].tid.push(this.triangles[i]);
				}
			}
			if ( duplicate == false )
				tmp.push(new Node ( this.trianglesflatcoord[i][j].sid, this.triangles[i],
					                 [ this.trianglesflatcoord[i][j].c[0],
					                   this.trianglesflatcoord[i][j].c[1],
					                   this.trianglesflatcoord[i][j].c[2] ] ) );
			 
		}
	}

	var cnt =0;

	for ( var k = 0 ; k < tmp.length-1 ; k++ )
	{
		var isok = false;

		if ( tmp[k].shareFlatTriangleWith( tmp[k+1] ) )
		{
			
			// good start, nodes are on the same flattened triangle
			
			// are they shariing a freezed edge ?
				
			var frz = false;
			var edg = getEdgeId (this.targetMesh, tmp[k+1].sid, tmp[k].sid);
			if ( edg > -1 )
				if ( edgestate (this.targetMesh, edg) == "freeze" ) frz = true;

			if ( frz == false )
			{
				isok = true;
			}
		}
		if (isok == false )
		{
			var tmp2 = $.extend(true, {}, tmp[k+1]);
			tmp.splice(k+1, 1);
			tmp.push (tmp2);
			k--;
		}
	}
	this.nodes = tmp;
	
}
/** @constructor */

function Node (sid, tid, coordinate )
{
	this.sid = sid;
	this.tid = [tid];
	
	this.c = coordinate;
	this.guid = uuidv4();
}
/** @description
	Indicates if the node and the one passed in parameter are located on the same
	flat triangle.
	
	@param {object} nde
	@returns {boolean=} true If they are.
	@returns {boolean=} false If they are not.
 */

Node.prototype.shareFlatTriangleWith = function (nde)
{
	for ( var i = 0 ; i < nde.tid.length ; i++ )
	{
		for( var j = 0 ; j < this.tid.length ; j++ )
			if (this.tid[j] == nde.tid[i] ) return true;
	}
	return false;
}
/** @description
	Find the pattern triangles using pattern edges
 */
Pattern.prototype.gentriangles = function ()
{
	
	for( var i = 0 ; i < this.edges.length ; i++ )
		for( var j = 0 ; j < this.targetMesh.edges[this.edges[i]].tri.length ; j++ )
			if ( this.owntriangle ( this.targetMesh.edges[this.edges[i]].tri[j] ) == -1 )
			{
				this.addTriangle(this.targetMesh.edges[this.edges[i]].tri[j]);
				setshapestate(this.targetMesh, this.targetMesh.edges[this.edges[i]].tri[j], "solid");
			}
	this.genFrontiers();
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
/** @description
	Try to ad an edges to the pattern, by looking for a triangle that is joined to it.
	@param {number} edge - the id of the edge to add.
	@return {number=} -2 when egde is already owned by the pattern 
	@return {number=} -1 when was not able to add the edge
 */
Pattern.prototype.addEdge = function (edge)
{
	
	if ( this.triangles.length == 0 && this.edges.length == 0)
	{
		this.edges.push (edge);
		return 0;
	}
	var t1 = this.targetMesh.edges[edge].tri[0];
	var t2 = this.targetMesh.edges[edge].tri[1];
	//l(pattern);
	for ( var i = 0 ; i < this.edges.length ; i++ )
		if ( this.edges[i] == edge )	return -2;
	for ( var i = 0 ; i < this.triangles.length ; i++ )
	{
		if (t1 == this.triangles[i] | t2 == this.triangles[i] )
		{
			this.edges.push(edge);
			this.gentriangles ();
			return 1;
		}
	}
	return -1;
}
/** @description
	retrive the index of the specified triangle into menber triangles[]
 */
Pattern.prototype.getTriangleIndex = function (t)
{
	for ( var i = 0 ; i < this.triangles.length ; i++ )
		if ( t == this.triangles[i] ) return i;
	return -1;
}
/** @description
	Update some stats
 */
Pattern.prototype.updateStats = function ()
{
	//TODO
	var nNod, nTri, nEdg, nFro;
	var maxX, minX, maxY, minY;
}
/** @description
	-
 */
Pattern.prototype.ownFrontier = function (f)
{
	for( var i = 0 ; i < this.frontier.length ; i++ )	
		if ( this.frontier[i] == f ) return i;
	return -1;
}
/** @description
	-
 */
Pattern.prototype.genFrontiers = function () // find fronier from junctions && triangles lists
{
	
	l('## PATTERNgenfrontier ##');
	for( var i = 0 ; i < this.triangles.length ; i++ )
	{
		var tmp = TRIANGLEgetedges (this.targetMesh, this.triangles[i]);
		for ( var j = 0 ; j < tmp.length ; j++ )
			if ( ( this.ownFrontier( tmp[j]) == -1 ) && ( edgestate(this.targetMesh, tmp[j]) != "freeze" ) )
			{
				this.frontier.push (tmp[j]);
				setedgestate (this.targetMesh, tmp[j], "visible");
			}
	}
}
/** @description
	-
 */
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
	
	var svgpolygon = this.nodes[this.nodes.length-1].c[0]+', '+this.nodes[this.nodes.length-1].c[1];
	for ( var i = 0 ; i < this.nodes.length ; i++ )
		svgpolygon +=  " "+this.nodes[i].c[0]+', '+this.nodes[i].c[1];
						
		var svg2 = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
		svg2.setAttribute('points', svgpolygon);
		svg2.setAttribute('class', 'nodeshape' );
		g.appendChild(svg2);
	
	
	
	renderplane.appendChild(g);
}
/** @description
	symply call flattenTrianglesCoord (), assembleFlattenedTriangles ()
	and genNodes (). In this order.
 */
Pattern.prototype.flatten = function ()
{

	this.flattenTrianglesCoord ();
	this.assembleFlattenedTriangles ();
	if ( ! this.checkFreezedEdges() ) return false;
	this.genNodes ();
	return true;
	
}
/** @description
	 calculate the flat coord of each triangle.
	 mistake was done earlyer, pattern triangles ids are store in an array of array
    instead of an array of (js) objects
 	 dont wand to rewrite this now, so flat coordinates will be store in a separate array
 	 of array - SO - P.triangles[x] & P.trianlesflatcoord[x] refer to the same triangle
 	 and will always be.
 	 the other reason why is that full OOP rewrite is planed

	 
 */

Pattern.prototype.flattenTrianglesCoord = function ()
{
	for ( var j = 0 ; j < this.triangles.length ; j++ )
	{
		var id = this.triangles[j];
		var n = this.targetMesh.trianglesnorm[id];

		var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
		var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
		// La,matrice de transformation peut etre construite
		var itpmat = geninterpmat (bullet, target);

		var w = $.extend( true, {}, this.targetMesh);
		
		for ( var i = 0 ; i < w.nv ; i++ )
			w.vertices[i] = applymatNscale(itpmat, w.vertices[i]);
		
		var tmptri = [ {c : [(w.vertices[w.triangles[id][0]][0]), 
							 (w.vertices[w.triangles[id][0]][1]), 0], sid : this.targetMesh.triangles[id][0] },

							{c : [(w.vertices[w.triangles[id][1]][0]), 
							 (w.vertices[w.triangles[id][1]][1]), 0], sid : this.targetMesh.triangles[id][1] },

						   {c : [(w.vertices[w.triangles[id][2]][0]), 
							 (w.vertices[w.triangles[id][2]][1]), 0], sid : this.targetMesh.triangles[id][2] }];

		this.trianglesflatcoord.push(tmptri);
	}
}
/** @description
	-
 */

Pattern.prototype.assembleFlattenedTriangles = function ()
{

	var done = new processedelements(); 		
	done.add ( this.triangles[0] );
	var k;
	for ( var j = 0 ; j < this.edges.length ; j++ )
	{
		// pattern cannot own single triangle edges, so we're safe with
		// fallowing code
		var vt1s, vt1e, vt2s, vt2e;
		var vs = this.targetMesh.edges[this.edges[j]].som[0];
		var ve = this.targetMesh.edges[this.edges[j]].som[1];

		for ( var m = 0 ; m < this.targetMesh.triangles[this.targetMesh.edges[this.edges[j]].tri[0] ].length ; m++)
		{
			if ( this.targetMesh.triangles[this.targetMesh.edges[this.edges[j]].tri[0] ][m] == vs )
				vt1s = m;
			if ( this.targetMesh.triangles[this.targetMesh.edges[this.edges[j]].tri[0] ][m] == ve )
				vt1e = m;
		}
		for ( var m = 0 ; m < this.targetMesh.triangles[this.targetMesh.edges[this.edges[j]].tri[1] ].length ; m++)
		{
			if ( this.targetMesh.triangles[this.targetMesh.edges[this.edges[j]].tri[1] ][m] == vs )
				vt2s = m;
			if ( this.targetMesh.triangles[this.targetMesh.edges[this.edges[j]].tri[1] ][m] == ve )
				vt2e = m;
		}
		var t = this.getTriangleIndex ( this.targetMesh.edges[this.edges[j]].tri[0] );
		var t2 = this.getTriangleIndex( this.targetMesh.edges[this.edges[j]].tri[1] );

		var target = vectfromvertices (this.trianglesflatcoord[t][vt1s].c,
												 this.trianglesflatcoord[t][vt1e].c);

		var bullet = vectfromvertices (this.trianglesflatcoord[t2][vt2s].c,
												 this.trianglesflatcoord[t2][vt2e].c);

		if ( done.is ( this.targetMesh.edges[this.edges[j]].tri[0] ) )
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
		done.add ( this.targetMesh.edges[ this.edges[j] ].tri[k] );
	}
	
	//TODO check if every freezed edge has two flat triangles
	
	
}
Pattern.prototype.getFlatTriangle = function (mtid)
{
	
	for (var i = 0 ; i < this.triangles.length ; i++)
		if (mtid == this.triangles[i] ) return this.trianglesflatcoord[i];
	return null;
}
Pattern.prototype.checkFreezedEdges = function ()
{
	var ww = 0;
	for ( var i = 0 ; i < this.edges.length ; i++ )	
	{
		var joined = this.areFlatTriangleJoined (  this.edges[i],
		                                     this.getFlatTriangle(this.targetMesh.edges[this.edges[i]].tri[0]),
		                                     this.getFlatTriangle(this.targetMesh.edges[this.edges[i]].tri[1]) );
		if (!joined) ww++;
	}
	if (ww == 0 ) return true;
	else return false;
}/**
	test if two triangles are joined, by checking the distance between shared summits.
		
*/
Pattern.prototype.areFlatTriangleJoined = function (eid, ft1, ft2 )
{
	// more test must be needed but, right now, this method only hasnone caller
	
	var joined = true;
	for ( var i = 0 ; i < ft1.length ; i++ )
	for ( var j = 0 ; j < ft2.length ; j++ )
		if ( ft1[i].sid == ft2[j].sid )
		{
			if ( distance ( ft1[i].c, ft2[j].c) > 0.0001 ) joined = false;
		}
	return joined;

}

