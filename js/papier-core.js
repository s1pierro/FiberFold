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

function Page (pattern)
{
	this.patterns = [pattern];
	this.desc = 'page '+(parseInt(dispatcher.pages.length)+1);
	this.size = pattern.papersizereq.s;
	this.height = pattern.papersizereq.h;
	this.width = pattern.papersizereq.w;
}
/** @description

	print page to dest_container;
	@param {object} dest_container
	@param {text} guid the guid of the pattern to highlight

 */
Page.prototype.out = function ( dest_container, pguid )
{ 
	

		$('#svg7').attr('viewBox', '0 0 '+this.width+' '+this.height);


	renderplane.innerHTML = "";


	for ( var ig = 0 ; ig < this.patterns.length ; ig++)
	{
		var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
		g.setAttribute( 'id', this.patterns[ig].guid );
		g.setAttribute( 'transform', 'translate('+this.patterns[ig].position.x+', '+this.patterns[ig].position.y+')' );
		var style = 'fill: #ccc; stroke: #ddd; stroke-width: 0.1px;';
		for ( var i = 0 ; i < this.patterns[ig].triangles.length ; i++ )
		{
			if ( this.patterns[ig].guid == pguid ) style = 'fill: #eee; stroke: #aaa; stroke-width: 0.1px;';
			var tmptri = this.patterns[ig].trianglesflatcoord[i];
			var svgtrigon =  tmptri[0].c[0]+', '+tmptri[0].c[1]+
							 ' '+tmptri[1].c[0]+', '+tmptri[1].c[1]+
							 ' '+tmptri[2].c[0]+', '+tmptri[2].c[1];
			var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg.setAttribute('points', svgtrigon);
			//svg.setAttribute('class', 'flatshape' );
			svg.setAttribute('style', style );

			g.appendChild(svg);
			g.appendChild(svg);
		}
		var style = 'fill: none; stroke: none;';
			if ( this.patterns[ig].guid == pguid ) style = 'fill: none; stroke: #000; stroke-width: 0.5px;';
		var pp = this.patterns[ig];
		var svgpolygon = pp.nodes[pp.nodes.length-1].c[0]+', '+pp.nodes[pp.nodes.length-1].c[1];
		for ( var i = 0 ; i < pp.nodes.length ; i++ )
			svgpolygon +=  " "+pp.nodes[i].c[0]+', '+pp.nodes[i].c[1];
							
			var svg2 = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg2.setAttribute('points', svgpolygon);
			svg2.setAttribute('style', style );
			g.appendChild(svg2);
		
		
		
		renderplane.appendChild(g);
		
			
		
	}
}
/** @description

	check collision between pattern and stuff already on the page
*/
Page.prototype.collisionTest = function ( pattern )
{
	var x = pattern.position.x;
	var y = pattern.position.y;
	var w = pattern.width;
	var h = pattern.height;
	
	for ( var i = 0 ; i < this.patterns.length ; i++ )
	{
		var x1 = this.patterns[i].position.x;
		var y1 = this.patterns[i].position.y;
		var w1 = this.patterns[i].width;
		var h1 = this.patterns[i].height;
		//fl(x+' '+y+' | '+w+' '+h+' - '+x1+' '+y1+' | '+w1+' '+h1)
		
		var cx = false;
		var cy = false;
		if ( x < ( x1 + w1 ) && ( x + w ) > x1 ) cx = true;
		if ( y < ( y1 + h1 ) && ( y + h ) > y1 ) cy = true;

		if ( cx && cy ) return true;
		if (x < 5 | y < 5 ) return true;
	}
	return false;
}
/** @description

	add pattern to the page
*/

Page.prototype.addPattern = function ( pattern )
{/** @description

	add pattern to the page
*/

	pattern.position.x = this.width - pattern.width;
	pattern.position.y = this.height - pattern.height;

	var c = this.collisionTest ( pattern );


	var add = false;
	while ( c == false ) 
	{	
		add = true;
		

			pattern.position.x -= 0;
			pattern.position.y -= 10;
			
			c = this.collisionTest ( pattern );
			if (c)
				pattern.position.y += 10;

		
	}
			c = this.collisionTest ( pattern );
	while ( c == false ) 
	{	
		add = true;
		

			pattern.position.x -= 10;

			
			c = this.collisionTest ( pattern );
			if (c)
				pattern.position.x += 10;

	}
		if ( add == true )
		{
			this.patterns.push(pattern);
			return 0;
		}
	return -1;
}

/** @constructor */

function Dispatcher (patterns)
{
	this.pages = [];
	this.p = patterns;
}
/** @description

	indicate the number of specified page size
*/

Dispatcher.prototype.nSize = function ( size )
{
	var tmp = 0;
	for ( var i = 0 ; i < this.pages.length ; i++ )
	{
		if ( this.pages[i].size == size ) tmp++;
	}
	return tmp;
}
/** @description

	update patternn ref
*/
Dispatcher.prototype.updatePatterns = function ( patterns )
{
	this.p = patterns;
}
/** @description

	-
*/
Dispatcher.prototype.queryPages = function ( size )
{
	//TODO return bigger sized
	var tmp = [];
	for ( var i = 0 ; i < this.pages.length ; i++ )
	{
		var nn = size.replace(/A/i, '');

		var tn = this.pages[i].size.replace(/A/i, '');
		if ( nn >= tn ) tmp.push( this.pages[i] );
	}
	return tmp;
}
/** @description

	-
*/

Dispatcher.prototype.outPageTriangle = function ( tid, container )
{
	for ( var i = 0 ; i < this.pages.length ; i++ )
		for ( var j = 0 ; j < this.pages[i].patterns.length ; j++ )
			for ( var k = 0 ; k < this.pages[i].patterns[j].triangles.length ; k++ )
			if ( this.pages[i].patterns[j].triangles[k] == tid )
				this.pages[i].out(container, this.pages[i].patterns[j].guid )
				

}
/** @description

	-
*/
Dispatcher.prototype.getPagepattern = function ( pid )
{
	if ( pid == -1 ) return undefined;
	for ( var i = 0 ; i < this.pages.length ; i++ )
		for ( var j = 0 ; j < this.pages[i].patterns.length ; j++ )
			if ( this.pages[i].patterns[j].guid == patterns.children[pid].guid )
				return  this.pages[i];
				

}
/** @description

	-
*/
Dispatcher.prototype.getPageIdxPatternIdx = function ( pidx )
{
	if ( pidx == -1 ) return -1;		
	for ( var i = 0 ; i < this.pages.length ; i++ )
		for ( var j = 0 ; j < this.pages[i].patterns.length ; j++ )
			if ( this.pages[i].patterns[j].guid == patterns.children[pidx].guid )
				return i;
	return -1;		
}
/** @description

	-
*/
Dispatcher.prototype.outPattern = function ( tid, container )
{
	renderplane.innerHTML = "";
	if ( tid == -1 ) return;
	var idx = patterns.findTriangleOwner (tid);
	if ( idx > -1 )
	{
	var pat =  patterns.children[idx];
				

		$('#svg7').attr('viewBox', '0 0 '+(pat.width+10)+' '+(pat.height+10));

	



		var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
		g.setAttribute( 'id', pat.guid );
		g.setAttribute( 'transform', 'translate(0, 0)' );
		
		for ( var i = 0 ; i < pat.triangles.length ; i++ )
		{
			
			var tmptri = pat.trianglesflatcoord[i];
			var svgtrigon =  tmptri[0].c[0]+', '+tmptri[0].c[1]+
							 ' '+tmptri[1].c[0]+', '+tmptri[1].c[1]+
							 ' '+tmptri[2].c[0]+', '+tmptri[2].c[1];
			var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg.setAttribute('points', svgtrigon);
			//svg.setAttribute('class', 'flatshape' );
			if ( pat.triangles[i] == tid )
				svg.setAttribute('style', 'fill: #f94; stroke: #aaa;' );
			else
				svg.setAttribute('style', 'fill: #ddd; stroke: #aaa;' );
			g.appendChild(svg);
		}
		var pp = pat;
		var svgpolygon = pp.nodes[pp.nodes.length-1].c[0]+', '+pp.nodes[pp.nodes.length-1].c[1];
		for ( var i = 0 ; i < pp.nodes.length ; i++ )
			svgpolygon +=  " "+pp.nodes[i].c[0]+', '+pp.nodes[i].c[1];
							
			var svg2 = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg2.setAttribute('points', svgpolygon);
		//	svg2.setAttribute('class', 'nodeshape' );
			svg2.setAttribute('style', 'fill: #ccc0; stroke: #000; stroke-width: 2px;' );		
			g.appendChild(svg2);
		
		
		
		renderplane.appendChild(g);
		
			
		
			
				
				
				
	}
				
			
}
/** @description

	-
*/

Dispatcher.prototype.fullDispatch = function (  )
{
/*
	//console.clear();
	this.pages.splice( 0, this.pages.length );
	 for ( var i = 0 ; i < this.p.children.length ; i++ )
	 {
		 dispatcher.dispatch(this.p.children[i]);
	 }
	// fl(this.pages);
	*/
	
	this.pages.splice( 0, this.pages.length );
	var cnt = 0;
	var target = this.p.children.length;
	var dnl = new processedelements();

	
	for ( var j = 0 ; j < this.p.children.length ; j++ )
	{
		var mx = 0;	
		var mxidx = 0;	
		for ( var i = 0 ; i < this.p.children.length ; i++ )
		{
			if ( mx < this.p.children[i].height && dnl.is(i) == false )
			{
				mx = this.p.children[i].height;
			 	mxidx = i;
			}
		}
		dispatcher.dispatch(this.p.children[mxidx]);
		dnl.add(mxidx);
	}
}
/** @description

	-
*/
Dispatcher.prototype.dispatch = function ( p )
{

		var pgs = this.queryPages (p.papersizereq.s);

		if ( pgs.length < 1 )
		{
			this.pages.push( new Page (p) );
			return 0;
		}	
		pgs = this.queryPages (p.papersizereq.s);

		
		
			
		for ( var i = 0 ; i < pgs.length ; i++ )
			if ( pgs[i].addPattern (p) != -1 )
			{
				return 0;
			}
		p.position.x = 0;
		p.position.y = 0;
		this.pages.push( new Page (p) );
		return 0;
}
/** @description

	-
*/
Dispatcher.prototype.sortChildren = function ()
{
	var a = 0;
	return a;
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
	this.height = 0;
	this.width = 0;
	this.position = { x:0, y:0 };

}
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

Patterns.prototype.flFreezed = function ()
{
	var tmp = '\nfreezed :';
	for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
		if (edgestate(this.targetMesh, i) == "freeze" ) tmp+=' '+i;
		fl(tmp);

}

/*
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
Patterns.prototype.rebuild = function (feid)
{		
	$('#main-app-dialog-title').text("Rebuild patterns");
	// back up patterns in case of fail
	var pbu = $.extend(true, [], this.children);

	// we need to create and fill freezed edges list
	var freezedlist = [];
/*/
	if ( feid != undefined )
	{
		fl('feid : '+feid);
		
		var tpp = this.getFrontierOwnerChildren(feid);
		fl(tpp);
		if (tpp.length = 1 )
		{
		for ( var i = 0 ; i < tpp[0].edges.length ; i++ )
			freezedlist.push (tpp[0].edges[i]);
			
		}
		if (tpp.length = 2 )
		{
			
			
		}
		
	}
	else
	{
		// first of all, we erase patterns
		this.children.splice (0, this.children.length);
		for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
			if (edgestate(this.targetMesh, i) == "freeze" ) freezedlist.push(i);
	
	}
	
	/*/

			// first of all, we erase patterns
		this.children.splice (0, this.children.length);
		for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
			if (edgestate(this.targetMesh, i) == "freeze" ) freezedlist.push(i);
	
	/**/

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

	//fl('dispatch freezed edge ok');
//	fl(this.children);
 	for ( var i = 0 ; i < this.children.length ; i++ )
   {
	   if (!this.children[i].flatten())
	   {
		   
		   this.children = $.extend(true, [], pbu);
		   
		   $('#processing-indicator').fadeOut(200);
			$('#processing-fail-indicator').fadeIn( 1 ).delay( 3600 ).fadeOut( 400 );
			fl('############### rebuil error ##################')
		   return false;
	   }
   }
	//fl('flattening ok');
	// Let's finally blank and refill the final document with our new computed
	// patterns
   dispatcher.updatePatterns (this);
	dispatcher.fullDispatch();
	
	//fl('dispatch patterns ok');


 	//$('#main-app-dialog-info').text('no pattern');		
  
   /*
	for ( var i = 0 ; i < this.children.length ; i++ )
	{
		this.children[i].addToFinalDocument(renderplane);
	}*/
//	fl(this.children);
	$('#processing-indicator').fadeOut(200);
	$('#processing-success-indicator').fadeIn( 100 ).delay( 200 ).fadeOut( 400 );

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
Patterns.prototype.getFrontierOwnerChildren = function (feid)
{
	var tmp = [];
	for (var i = 0 ; i < this.children.length ; i++ )
		for ( var j = 0 ; j < this.children[i].frontier.length ; j ++ )	
			if ( this.children[i].frontier[j] == feid )
				tmp.push( this.children[i] );
	return tmp;
}

Pattern.prototype.tryToReachRatio = function ( r )
{
	var tmp = this;
	
	var diff = 1000;
	var trystep =$.extend(true, {}, tmp);
	
	
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
				if ( distance (tmp[k].c, this.trianglesflatcoord[i][j].c ) < tolerance &&
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
	indicate the index of the specified triangle into menber triangles[]
	@param {number} tid - the id of the wanted triangle
	@returns {number} the index of the wanted triangle in member "triangles[]"
	-1 if cannot be founded
 */
Pattern.prototype.getTriangleIndex = function (tid)
{
	for ( var i = 0 ; i < this.triangles.length ; i++ )
		if ( tid == this.triangles[i] ) return i;
	return -1;
}
/** @description
	Update some stats
 */
Pattern.prototype.smartPositioning = function ()
{
	//TODO
	var nNod, nTri, nEdg, nFro, maxX, minX, maxY, minY, w, h;
	var n = this.nodes;
//	fl(n);
	maxX = -1000;
	minX = 1000;
	maxY = -1000;
	minY = 1000;
	for ( var i = 0 ; i < n.length ; i++ )
	{
		if ( maxX < n[i].c[0] ) maxX = n[i].c[0];
		if ( minX > n[i].c[0] ) minX = n[i].c[0];
		if ( maxY < n[i].c[1] ) maxY = n[i].c[1];
		if ( minY > n[i].c[1] ) minY = n[i].c[1];
	}

	this.translate ((0 - minX), (0 - minY));
	maxX = -1000;
	minX = 1000;
	maxY = -1000;
	minY = 1000;
	for ( var i = 0 ; i < n.length ; i++ )
	{
		if ( maxX < n[i].c[0] ) maxX = n[i].c[0];
		if ( minX > n[i].c[0] ) minX = n[i].c[0];
		if ( maxY < n[i].c[1] ) maxY = n[i].c[1];
		if ( minY > n[i].c[1] ) minY = n[i].c[1];
	}
	h = maxY - minY;
	w = maxX - minX;
	
//	fl('range : x['+minX.toFixed(2)+' - '+maxX.toFixed(2)+']\n y['+minY.toFixed(2)+' - '+maxY.toFixed(2)+'] ');
//	fl('size (w, h) : '+w+', '+h);

	this.height = h;
	this.width = w;
//	fl('rr: '+rr);
	var a4 = 'A4';
	var a3 = 'A3';
	var a2 = 'A2';
	var a1 = 'A1';
	var a0 = 'A0';
	
	//fl('\n # requierements : '+this.papersizereq.s+' '+this.papersizereq.w+' x '+this.papersizereq.h);
	//this.rotate(11);
	//TODO smart rotate
	
	var _this = $.extend( true, {}, this);
	var r = w/h;
	var scrs = [];
	var score = r;
	
	var inc = 1;
	var range = 360;
	for ( var a = 0 ; a < range ; a++ )
	{
		this.rotate (inc);
		
	maxX = -1000;
	minX = 1000;
	maxY = -1000;
	minY = 1000;
		for ( var i = 0 ; i < n.length ; i++ )
		{
			if ( maxX < n[i].c[0] ) maxX = n[i].c[0];
			if ( minX > n[i].c[0] ) minX = n[i].c[0];
			if ( maxY < n[i].c[1] ) maxY = n[i].c[1];
			if ( minY > n[i].c[1] ) minY = n[i].c[1];
		}
		h = maxY - minY;
		w = maxX - minX;
		
		r = w/h;
		scrs.push(r);
	}
	var sc = 10000;
	var iscr = -1;
	for (var i = 0 ; i < scrs.length ; i++ )
	{
		if ( scrs[i] < sc )
		{
			iscr = i;
			sc =scrs[i];
		} 
		
	}

	var srot = (iscr+1) * inc;
	this.rotate (srot);	

	maxX = -1000;
	minX = 1000;
	maxY = -1000;
	minY = 1000;
	for ( var i = 0 ; i < n.length ; i++ )
	{
		if ( maxX < n[i].c[0] ) maxX = n[i].c[0];
		if ( minX > n[i].c[0] ) minX = n[i].c[0];
		if ( maxY < n[i].c[1] ) maxY = n[i].c[1];
		if ( minY > n[i].c[1] ) minY = n[i].c[1];
	}
	h = maxY - minY;
	w = maxX - minX;
		
	
	this.height = h;
	this.width = w;
	this.translate ((0 - minX), (0 - minY));
		var rr = w / h;
	if ( rr > 0.7070 )
	{
		this.papersizereq = { s: a4, w : 210, h : 297};
		if ( w > 210) this.papersizereq = {s: a3, w : 297, h : 420};
		if ( w > 297) this.papersizereq = {s: a2, w : 420, h : 594};
		if ( w > 420) this.papersizereq = {s: a1, w : 594, h : 840};
		if ( w > 594) this.papersizereq = {s: a0, w : 840, h :1188 };
	}
	else
	{
		this.papersizereq = {s: a4, w : 210, h : 297};
		if ( h > 297) this.papersizereq = {s: a3, w : 297, h : 420};
		if ( h > 420) this.papersizereq = {s: a2, w : 420, h : 594};
		if ( h > 594) this.papersizereq = {s: a1, w : 594, h : 840};
		if ( h > 840) this.papersizereq = {s: a0, w : 840, h :1188 };
	}

	
}
Pattern.prototype.translate = function (x, y)
{
	var tmptxymat = gentmat( x, y, 0.0 );
	for ( var i = 0 ; i < this.nodes.length ; i++ )
		this.nodes[i].c = applymat(tmptxymat, this.nodes[i].c);
	for ( var i = 0 ; i < this.trianglesflatcoord.length ; i++ )
		for ( var j = 0 ; j < this.trianglesflatcoord[i].length ; j++)
			this.trianglesflatcoord[i][j].c = applymat(tmptxymat, this.trianglesflatcoord[i][j].c);

}
Pattern.prototype.rotate = function (rz)
{
	var tmprzmat = genrmat(0.0, 0.0, rz );
	for ( var i = 0 ; i < this.nodes.length ; i++ )
		this.nodes[i].c = applymat(tmprzmat, this.nodes[i].c);
	for ( var i = 0 ; i < this.trianglesflatcoord.length ; i++ )
		for ( var j = 0 ; j < this.trianglesflatcoord[i].length ; j++)
			this.trianglesflatcoord[i][j].c = applymat(tmprzmat, this.trianglesflatcoord[i][j].c);

}

Pattern.prototype.ownFrontier = function (f)
{
	for( var i = 0 ; i < this.frontier.length ; i++ )	
		if ( this.frontier[i] == f ) return i;
	return -1;
}




/** @description
	find edges id witch are frontier of the pattern.
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
	symply call flattenTrianglesCoord (), assembleFlattenedTriangles ()
	and genNodes (). In this order.
 */
Pattern.prototype.flatten = function ()
{
	//fl(' # flatten triangle '+this.guid);
	this.flattenTrianglesCoord ();
	//fl(' # asm triangle');
	this.assembleFlattenedTriangles ();
	//fl(' # check freezed edges');
	if ( ! this.checkFreezedEdges() ) return false;
	//fl(' # gen nodes');
	this.genNodes ();
	//fl(' # smart positioning');
	this.smartPositioning();
	//dispatcher.updateChildren();
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
	
	Assemble the pattern, must not be called until the triangles have been flattened
*/
Pattern.prototype.assembleFlattenedTriangles = function ()
{

	var done = new processedelements(); 		
	done.add ( this.triangles[0] );
	var k;
	var mesh = this.targetMesh;
	for ( var j = 0 ; j < this.edges.length ; j++ )
	{
		// pattern cannot own single triangle edges, so we're safe with
		// fallowing code
		var vt1s, vt1e, vt2s, vt2e;
		var vs = mesh.edges[this.edges[j]].som[0];
		var ve = mesh.edges[this.edges[j]].som[1];

		for ( var m = 0 ; m < mesh.triangles[mesh.edges[this.edges[j]].tri[0] ].length ; m++)
		{
			if ( mesh.triangles[mesh.edges[this.edges[j]].tri[0] ][m] == vs )
				vt1s = m;
			if ( mesh.triangles[mesh.edges[this.edges[j]].tri[0] ][m] == ve )
				vt1e = m;
		}
		for ( var m = 0 ; m < mesh.triangles[mesh.edges[this.edges[j]].tri[1] ].length ; m++)
		{
			if ( mesh.triangles[mesh.edges[this.edges[j]].tri[1] ][m] == vs )
				vt2s = m;
			if ( mesh.triangles[mesh.edges[this.edges[j]].tri[1] ][m] == ve )
				vt2e = m;
		}
		var t = this.getTriangleIndex ( mesh.edges[this.edges[j]].tri[0] );
		var t2 = this.getTriangleIndex( mesh.edges[this.edges[j]].tri[1] );

		var target = vectfromvertices (this.trianglesflatcoord[t][vt1s].c,
												 this.trianglesflatcoord[t][vt1e].c);

		var bullet = vectfromvertices (this.trianglesflatcoord[t2][vt2s].c,
												 this.trianglesflatcoord[t2][vt2e].c);

		if ( done.is ( mesh.edges[this.edges[j]].tri[0] ) )
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
		done.add ( mesh.edges[ this.edges[j] ].tri[k] );
	}
}
/** @description
	
	returns the flattened triangle object that matches the triangle of the mesh
	of which the id is Mtid

	@param {number} mtid - mesh triangle's id
	@returns {object} flattened triangle

 */
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
			if ( distance ( ft1[i].c, ft2[j].c) > tolerance ) joined = false;
		}
	return joined;

}

