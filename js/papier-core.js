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
	this.desc = 'page '+(parseInt(((dispatcher.pages.length)+1), 10));
	this.size = pattern.papersizereq.s;
	this.height = pattern.papersizereq.h;
	this.width = pattern.papersizereq.w;
}
/** @constructor */

function Frontiersegment ()
{
	this.vidx = [];
	this.eidx = [];
	this.ownerguid = '';
	this.targetguid = '';
	this.type = '';
}
/** @description


 */
Frontiersegment.prototype.set = function ( ownerguid, targetguid )
{
	this.vidx = [];
	this.eidx = [];
	this.ownerguid = ownerguid;
	this.targetguid = targetguid;
	this.type = '';		//	open/close
	return true;
}
/** @description print page to dest_container;
	@param {Object} dest_container
	@param {string} pguid the guid of the pattern to highlight

 */
Page.prototype.out = function ( dest_container, pguid, tid )
{ 
	

		$('#svg7').attr('viewBox', '0 0 '+this.width+' '+this.height);


	renderplane.innerHTML = "";



	for ( var ig = 0 ; ig < this.patterns.length ; ig++)
	{
		var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
		g.setAttribute( 'id', this.patterns[ig].guid );
		g.setAttribute( 'transform', 'translate('+this.patterns[ig].position.x+', '+this.patterns[ig].position.y+')' );

		var style = 'fill: ccc; stroke: none;';
		if ( this.patterns[ig].guid == pguid ) style = 'fill: #ccc; stroke: #000; stroke-width: 0.5px;';
		var pp = this.patterns[ig];
		var svgpolygon = pp.tabnodes[pp.tabnodes.length-1][0]+', '+pp.tabnodes[pp.tabnodes.length-1][1];
		for ( var i = 0 ; i < pp.tabnodes.length ; i++ )
			svgpolygon +=  " "+pp.tabnodes[i][0]+', '+pp.tabnodes[i][1];
							
		var svg2 = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
		svg2.setAttribute('points', svgpolygon);
		svg2.setAttribute('style', style );
		g.appendChild(svg2);

		var style = 'fill: #ccc; stroke: #444; stroke-width: 0.1px;';
		for ( var i = 0 ; i < this.patterns[ig].triangles.length ; i++ )
		{
			if ( this.patterns[ig].guid == pguid ) style = 'fill: #fb6; stroke: #aaa; stroke-width: 0.1px;';
			if ( tid > -1 )
				if ( this.patterns[ig].triangles[i] == tid ) style = 'fill: #f94; stroke: #aaa; stroke-width: 0.1px;';
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
/*		var style = 'fill: none; stroke: none;';
		if ( this.patterns[ig].guid == pguid ) style = 'fill: none; stroke: #000; stroke-width: 0.5px;';
		var pp = this.patterns[ig];
		var svgpolygon = pp.nodes[pp.nodes.length-1].c[0]+', '+pp.nodes[pp.nodes.length-1].c[1];
		for ( var i = 0 ; i < pp.nodes.length ; i++ )
			svgpolygon +=  " "+pp.nodes[i].c[0]+', '+pp.nodes[i].c[1];
							
			var svg2 = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg2.setAttribute('points', svgpolygon);
			svg2.setAttribute('style', style );
			g.appendChild(svg2);
	*/	
		
		
		
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
/** @constructor 
 * @param {number}                   sid - som index
 * @param {number}                   tid - ti index
 * @param {Array}            coordinate  - node coordinate
 * @property {number}         sid - sid
 * @property {Array}         tid - tid
 * @property {Array}    coordinate - The array tht contain patterns.
 * @property {string}       		   guid - A global identifier.
 */
function Node (sid, tid, coordinate )
{
	this.sid = sid;
	this.tid = [tid];
	
	this.c = coordinate;
	this.guid = uuidv4();
}
Node.prototype.set = function (sid, tid, coordinate )
{
	this.sid = sid;
	this.tid = [tid];
	
	this.c = coordinate;
	this.guid = uuidv4();
}

/** @description
	Indicates if the node and the one passed in parameter are located on the same
	flat triangle.
	
	@param {Object} nde
	@returns {boolean}
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
	this.tabnodes = [];
	this.frontier = [];
	this.guid = uuidv4();
	this.targetMesh = targetmesh;
	this.height = 0;
	this.width = 0;
	this.position = { x:0, y:0 };

}
/** @constructor 
 * @param {Object}                   targetmesh - The mesh to flatten.
 * @property {Array.Pattern}           children - The array tht contain patterns.
 * @property {Object}                targetMesh - The mesh to flatten.
 * @property {string}             		    guid - A global identifier.
 
 */
function Patterns (targetmesh)
{
	this.targetMesh = targetmesh;
	this.children = [];
	// GUID might always be useless ... or not
	this.guid = uuidv4();
	this.freezedEdgeHistory = [];
	this.history = [];
}
/** @description
	Update the targeted mesh. That is needed when user load a new mesh.
	
	 @param {Object} targetmesh - the new mesh to flatten.
 
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
 *	@param {Object} pattern - the pattern to add
 *
 */
Patterns.prototype.addPattern = function (pattern)
{
	this.children.push(pattern);
}
/**
 * @description
 *	simply add a new pattern 
 *
 *	@param {Object} pattern - the pattern to add
 *
 */
Patterns.prototype.removePattern = function (guid)
{
	for ( var i = 0 ; i < this.children.length ; i++ )
		if ( this.children[i].guid == guid )
		{
			this.children.splice(i, 1);
		
			//this.rebuild ();
		}
}

Patterns.prototype.flFreezed = function ()
{
	var tmp = '\nfreezed :';
	for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
		if (edgestate(this.targetMesh, i) == "frozen" ) tmp+=' '+i;
		fl(tmp);

}

function roughSizeOfObject( hy ) {
	
	var n = 0;
	for ( var i = 0 ; i < hy.length ; i++ )
		n += hy[i].length;
	return 8*n;
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
	var t0 = new Date();
	fl(' # rebuild '+feid+' c ');
	
	$('#processing-indicator').fadeIn(20);
	$('#main-app-dialog-title').text("Rebuild patterns");
	// back up patterns in case of fail
	var pbu = $.extend(true, [], this.children);


	if ( feid != undefined  )
	if ( edgestate(pobj, feid) == "frozen" )
		this.history.push( { date : t, action : 'freeze', edges : [feid] } );
			else
				this.history.push( { date : t, action : 'unfreeze', edges : [feid] } );
	var t = new Date();
	
	this.history.push( { date : t, action : 'freeze', edges : [feid] } );

	
	// we need to create and fill frozen edges list
	var frozenlist = [];

	if ( feid != undefined )
	{
		
		
		var tpp = this.getFrontierOwnerChildren(feid);
		
		if (tpp[0] != undefined )
		{

				for ( var j = 0 ; j < tpp.length ; j++ )
				{
					for ( var i = 0 ; i < tpp[j].edges.length ; i++ )
						frozenlist.push (tpp[j].edges[i]);
					this.removePattern(tpp[j].guid);
				}
				if ( edgestate(pobj, feid) == "frozen" )
					frozenlist.push (feid);
				this.removePattern(tpp[0].guid);
				
		}
		else {
			var p = this.getEdgeOwnerChildren(feid);
			if ( p.guid != undefined )
			{
					for ( var i = 0 ; i < p.edges.length ; i++ )
						if ( p.edges[i] != feid )
							frozenlist.push ( p.edges[i] );
					this.removePattern(p.guid);
			}
			else frozenlist.push (feid);
		}
	}
	else
	{
		// first of all, we erase patterns
		this.children.splice (0, this.children.length);
		for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
			if (edgestate(this.targetMesh, i) == "frozen" ) frozenlist.push(i);
	
	}
	

	// Let's now dispatch those freezed edges into different patterns
	var newpatterns = [];
	
	var freezestate = [];
	for ( var i = 0 ; i < this.targetMesh.edges.length ; i++ )
		if (edgestate(this.targetMesh, i) == "frozen" ) freezestate.push(i);
	this.freezedEdgeHistory.push($.extend(true, [], freezestate));
	fl('history size : '+roughSizeOfObject(this.freezedEdgeHistory)+' bytes');
	
	fl(this.freezedEdgeHistory);
	
	
	var ref = frozenlist.length;
	while ( frozenlist.length > 0 )
	{
		fl('dispatch frozen edges '+(ref + 1 - frozenlist.length)+' / '+ref)
		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < frozenlist.length )
		{
			var j = 0;
			while ( add == -1 && j < this.children.length )
			{
				add = this.children[j].addEdge (frozenlist[i] );
				if ( add != -1 )
					frozenlist.splice(i, 1);
				j++;
			}
			i++;
		}
		if ( add == -1 )
		{	
			var tmp = new Pattern (this.targetMesh);
			tmp.addEdge(frozenlist[0]);
			tmp.gentriangles(-1);
			this.addPattern(tmp);
			frozenlist.splice(0, 1);
			newpatterns.push(tmp);
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
			newpatterns.push(tmp);
		}

	ref = newpatterns.length;
	fl(ref+' island(s) founded');
	for ( var i = 0 ; i < newpatterns.length ; i++ )
   {

		fl('processing '+(1+i)+' / '+ref)
	   //fl( newpatterns[i].guid+'|'+this.children[i].guid )
	   if (!newpatterns[i].flatten())
	   {  
		   this.children = $.extend(true, [], pbu);  
		   $('#processing-indicator').fadeOut(200);
			$('#processing-fail-indicator').fadeIn( 1 ).delay( 300 ).fadeOut( 400 );
			fl('# rebuild error')
		   return false;
	   }
   }
	// Let's finally blank and refill the final document with our new computed
	// patterns
	
   dispatcher.updatePatterns (this);
	dispatcher.fullDispatch();
	
	$('#processing-indicator').fadeOut(200);
	$('#processing-success-indicator').fadeIn( 100 ).delay( 200 ).fadeOut( 400 );

	var t1 = new Date();
	fl(' total rebuild '+(t1.getTime()-t0.getTime())+'ms');

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
// TOdo need remname
Patterns.prototype.getFrontierOwnerChildren = function (feid)
{
	var tmp = [];
	for (var i = 0 ; i < this.children.length ; i++ )
		for ( var j = 0 ; j < this.children[i].frontier.length ; j ++ )	
			if ( this.children[i].frontier[j] == feid )
				tmp.push( this.children[i] );
	return tmp;
}
Patterns.prototype.getEdgeOwnerChildren = function (eid)
{
	var tmp = {};
	for (var i = 0 ; i < this.children.length ; i++ )
		for ( var j = 0 ; j < this.children[i].edges.length ; j ++ )	
			if ( this.children[i].edges[j] == eid )
				tmp = this.children[i];
	return tmp;
}
Patterns.prototype.unHighlight = function ()
{
	for( var i = 0 ; i < this.children.length ; i++ )
		this.children[i].unHighlight ();
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
 -

 */
Pattern.prototype.highlight = function ()
{
	for( var i = 0 ; i < this.triangles.length ; i++ )
	{
		setshapestate (pobj, this.triangles[i], "softlight");

	}
}
Pattern.prototype.unHighlight = function ()
{
	for( var i = 0 ; i < this.triangles.length ; i++ )
		setshapestate (pobj, this.triangles[i], "solid" );
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
			{
				var tmpnode = new Node ( this.trianglesflatcoord[i][j].sid, this.triangles[i],
					             		    [ this.trianglesflatcoord[i][j].c[0],
					                		   this.trianglesflatcoord[i][j].c[1],
					              		      this.trianglesflatcoord[i][j].c[2] ] );
				tmp.push(tmpnode);
			}
			 
		}
	}

	var cnt =0;

	for ( var k = 0 ; k < tmp.length-1 ; k++ )
	{
		var isok = false;

		if ( tmp[k].shareFlatTriangleWith( tmp[k+1] ) )
		{				
			var frz = false;
			var edg = getEdgeId (this.targetMesh, tmp[k+1].sid, tmp[k].sid);
			if ( edg > -1 )
				if ( edgestate (this.targetMesh, edg) == "frozen" ) frz = true;

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
	var sameorder = false;
	var tmp2 = 	this.getTrianglesOwners ( tmp[0].sid, tmp[1].sid);
		for ( var k = 0 ; k < 3 ; k++ )
			if ( k < 2 )
			{
				if (tmp[0].sid == tmp2[k] && tmp[1].sid == tmp2[k+1])	sameorder = true;
			}
			else
			{
				if (tmp[0].sid == tmp2[k] && tmp[1].sid == tmp2[0])	sameorder = true;	
			}
			fl(sameorder);
	fl(tmp2.length);
	
	if ( !sameorder ) tmp.reverse();
	
	this.nodes = tmp;

	
}
/** @description
 -

 */
Pattern.prototype.genTabNodes = function ()
{		
	for( var i = 0 ; i < this.nodes.length ; i++ )
	{
		var nl = 2;
		var swtc = 1;
	
		var j = 0;
		if ( i == (this.nodes.length - 1) ) j = 0;
		else j = i + 1;

		var c0 = $.extend( true, [], this.nodes[i].c );
		var c1 = $.extend( true, [], this.nodes[j].c );
		var v = vectfromvertices (c0, c1);
		
		var pas = v.n/nl; //TODO
		
		for ( var k = 0 ; k < nl ; k++ )
		if ( swtc == 1 )
		{
			var c9 = [v.o[0]+v.s[0]*pas*k, v.o[1]+v.s[1]*pas*k, 0];
			this.tabnodes.push(c9);		

			
			var v1 = [ c9[0]+(tongueheight*v.s[0]) , c9[1]+(tongueheight*v.s[1])  , 0  ];
			var v11 = [ c9[0]+(tongueheight/3*v.s[0]) , c9[1]+(tongueheight/3*v.s[1])  , 0  ];
			
			var cnt = gentmat ( -c9[0], -c9[1], 0 );
			var rz = genrmat ( 0.0, 0.0, 90.0 );
			var rz11 = genrmat ( 0.0, 0.0, clip+90.0 );
			var ucnt = gentmat ( c9[0], c9[1], 0 );

			
			var m = multiplymatrix ( cnt, genimat() );
			var m2 = multiplymatrix ( rz, m );
			var m3 = multiplymatrix ( ucnt, m2 );		
			var v2 = applymat(m3, v1);
			
			m = multiplymatrix ( cnt, genimat() );
			m2 = multiplymatrix ( rz11, m );
			m3 = multiplymatrix ( ucnt, m2 );		
			var v22 = applymat(m3, v11);
			
			
			this.tabnodes.push(v22);
			this.tabnodes.push(v2);
					
			var v3 = [ v2[0]+(pas*v.s[0]) , v2[1]+(pas*v.s[1])  , 0  ];
			this.tabnodes.push(v3);
			
			var c7 = [v.o[0]+v.s[0]*pas*(k+1), v.o[1]+v.s[1]*pas*(k+1), 0];
			var v33 = [ c7[0]+(tongueheight/3*v.s[0]) , c7[1]+(tongueheight/3*v.s[1])  , 0  ];
			
			cnt = gentmat ( -c7[0], -c7[1], 0 );
			ucnt = gentmat ( c7[0], c7[1], 0 );
			var rz33 = genrmat ( 0.0, 0.0, clip );
			m = multiplymatrix ( cnt, genimat() );
			m2 = multiplymatrix ( rz33, m );
			m3 = multiplymatrix ( ucnt, m2 );		
			var v44 = applymat(m3, v33);
			this.tabnodes.push(v44);		
			
			
			swtc = swtc * -1;
		
		}
		else
		{
			var c9 = [v.o[0]+v.s[0]*pas*k, v.o[1]+v.s[1]*pas*k, 0];
			this.tabnodes.push(c9);		
			
			swtc = swtc * -1;

		}
	}

}

/** @description
	Find the pattern triangles using pattern edges
 */
Pattern.prototype.gentriangles = function (e)
{
	if ( e > -1 )
	{			
		for( var j = 0 ; j < this.targetMesh.edges[e].tri.length ; j++ )
			this.addTriangle (this.targetMesh.edges[e].tri[j]);
	}
	else
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
			this.gentriangles (-1);
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
	for ( var i = 0 ; i < this.tabnodes.length ; i++ )
		this.tabnodes[i] = applymat(tmptxymat, this.tabnodes[i]);
	for ( var i = 0 ; i < this.trianglesflatcoord.length ; i++ )
		for ( var j = 0 ; j < this.trianglesflatcoord[i].length ; j++)
			this.trianglesflatcoord[i][j].c = applymat(tmptxymat, this.trianglesflatcoord[i][j].c);

}
Pattern.prototype.rotate = function (rz)
{
	var tmprzmat = genrmat(0.0, 0.0, rz );
	for ( var i = 0 ; i < this.nodes.length ; i++ )
		this.nodes[i].c = applymat(tmprzmat, this.nodes[i].c);
	for ( var i = 0 ; i < this.tabnodes.length ; i++ )
		this.tabnodes[i] = applymat(tmprzmat, this.tabnodes[i]);
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
			if ( ( this.ownFrontier( tmp[j]) == -1 ) && ( edgestate(this.targetMesh, tmp[j]) != "frozen" ) )
			{
				this.frontier.push (tmp[j]);
				setedgestate (this.targetMesh, tmp[j], "visible");
			}
	}
}

/** @description
	symply call genFlattenedTrianglesCoordinates (), assembleFlattenedTriangles ()
	and genNodes (). In this order.
 */
Pattern.prototype.flatten = function ()
{
	//fl(' # flatten triangle '+this.guid);
	var t0 = new Date();
	//fl(t0.getTime());
	this.genFlattenedTrianglesCoordinates ();
	var t1 = new Date();
	fl(' * flattening '+(t1.getTime() - t0.getTime())+' ms');

	this.assembleFlattenedTriangles ();
	var t2 = new Date();
	fl(' * assembling '+(t2.getTime() - t1.getTime())+' ms');

	if ( ! this.checkFreezedEdges() ) return false;
	var t3 = new Date();
	fl(' * checking'+(t3.getTime() - t2.getTime())+' ms');

	this.genNodes ();
	var t4 = new Date();
	fl(' * gen nodes '+(t4.getTime() - t3.getTime())+' ms');
	
	this.genTabNodes ();

	this.smartPositioning();
	var t5 = new Date();
	fl(' * positioning '+(t5.getTime() - t4.getTime())+' ms');
	fl(' total : '+(t5.getTime() - t0.getTime())+' ms');
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
Pattern.prototype.genFlattenedTrianglesCoordinates = function ()
{
	for ( var j = 0 ; j < this.triangles.length ; j++ )
	{
		var id = this.triangles[j];
		var n = this.targetMesh.trianglesnorm[id];

		var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
		var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
		// La,matrice de transformation peut etre construite
		var itpmat = geninterpmat (bullet, target);
	
		var tmptri = [ {c : [(applymatNscale(itpmat, pobj.vertices[pobj.triangles[id][0]])[0]),
									(applymatNscale(itpmat, pobj.vertices[pobj.triangles[id][0]])[1]), 0],
									sid : this.targetMesh.triangles[id][0] },
		    
							{c : [(applymatNscale(itpmat, pobj.vertices[pobj.triangles[id][1]])[0]),
									(applymatNscale(itpmat, pobj.vertices[pobj.triangles[id][1]])[1]), 0],
									sid : this.targetMesh.triangles[id][1]  },
		    
							{c : [(applymatNscale(itpmat, pobj.vertices[pobj.triangles[id][2]])[0]),
									(applymatNscale(itpmat, pobj.vertices[pobj.triangles[id][2]])[1]), 0],
									sid : this.targetMesh.triangles[id][2]  } ];
									
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
	@returns {Object} flattened triangle

 */
Pattern.prototype.getFlatTriangle = function (mtid)
{
	
	for (var i = 0 ; i < this.triangles.length ; i++)
		if (mtid == this.triangles[i] ) return this.trianglesflatcoord[i];
	return null;
}
Pattern.prototype.getTrianglesOwners = function (sid1, sid2)
{
	var tmp = [];
	var mtc = 0;
	for ( var i = 0 ; i < this.triangles.length ; i++ )
	{
		var mtc = 0;
		
		for (var j = 0 ; j < 3 ; j++)
		{
			if ( sid1 == this.targetMesh.triangles[this.triangles[i]][j] ) mtc++;
			if ( sid2 == this.targetMesh.triangles[this.triangles[i]][j] ) mtc++;
		}
		if ( mtc > 1 ) tmp.push(this.triangles[i]);//this.targetMesh.triangles[i]);
		
		fl('mtc '+mtc+' : id '+this.triangles[i]);
		
	}
	fl('tmp:');
	fl(tmp);
	for ( var i = 0 ; i < tmp.length ; i++ )
	{
		if ( this.owntriangle(tmp[i]) > -1 )
			return this.targetMesh.triangles[tmp[i]];
	}

	
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
	// TODO more test must be needed
	
	var joined = true;
	for ( var i = 0 ; i < ft1.length ; i++ )
	for ( var j = 0 ; j < ft2.length ; j++ )
		if ( ft1[i].sid == ft2[j].sid )
		{
			if ( distance ( ft1[i].c, ft2[j].c) > tolerance ) joined = false;
		}
	return joined;

}

