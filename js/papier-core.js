/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@free.fr
	Licenced under the termes of the GNU GPL v3
*/

'use strict';


function buildpatterns(o)
{
	l('## rebuild patterns ##');
	patterns.splice (0, patterns.length);
	
	// first we need to create and fill freezed edges list
	var freezedlist = [];
	for ( var i = 0 ; i < o.ne ; i++ )
	{
		if (edgestate(o, i) == "freeze" ) freezedlist.push(i);
	}

	// Let's now dispatch those freezed edges into different patterns
	while ( freezedlist.length > 0 )
	{
		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < freezedlist.length )
		{
			var j = 0;
			while ( add == -1 && j < patterns.length )
			{
				add = patterns[j].addEdge (o, freezedlist[i] );
				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	
			//var tmp = { triangles : [], edges : [freezedlist[0]], frontier : [], id : patterns.length };
			var tmp = new Pattern ();
			tmp.addEdge(o, freezedlist[0]);
			tmp.gentriangles(o);
			patterns.push(tmp);
			freezedlist.splice(0, 1);	
		}
	}
	
	// precedent code prodce patterns defs from freezed edges, by this way,
	// it cannot add single triangle patterns, the fallowing for loop process
	// those singles triangles pattern
	
	for (var i = 0 ; i < o.triangles.length ; i++ )
		if ( getpattern(i) == -1 && shapestate(o, i) == "solid" )
		{
			var flatcoord = genflatcoord (o, i);
			var tmp = { triangles : [i], edges : [], frontier : [] };
			PATTERNgenfrontier (o, tmp);
			patterns.push(tmp);
			
		}
	// show some help to the user if no pattern has been created yet					
	if ( patterns.length > 0 )
		$('#scratch-message').fadeOut();
	else
		$('#scratch-message').fadeIn();
		  	
 	// At this point Patterns are correctly defined but they have not been flattened yet
  	
 	// let's calculate the flat coord of each triangle
 	//================================================
 	// mistake was done earlyer, pattern triangles ids are store in an array of array
 	// instead of an array of (js) objects
 	// dont wand to rewrite this now, so flat coordinates will be store in a separate array
 	// of array - SO - P.triangles[x] & P.trianlesflatcoord[x] refer to the same triangle
 	// and will always be
 	// the other reason why is that full OOP rewrite is planed
 	//================================================
 	
 	for ( var i = 0 ; i < patterns.length ; i++ )
 	{
 		patterns[i].trianglesflatcoord = [];
 		for ( var j = 0 ; j < patterns[i].triangles.length ; j++ )
 		{
 			patterns[i].trianglesflatcoord.push(genflatcoord (o, patterns[i].triangles[j] ));
			
 		}	
 	}
  	// lets assemble flat patterns using previous calculated coordinates
  	// and pattern definitions


	for ( var i = 0 ; i < patterns.length ; i++ )
 	{
 		var p = patterns[i];
 		var done = new processedelements(); 		
 	  	done.add ( p.triangles[0] );
 	  	var k;
		for ( var j = 0 ; j < p.edges.length ; j++ )
 		{
			// pattern cannot own single triangle edges, so we're safe with
			// fallowing code
			var vt1s, vt1e, vt2s, vt2e;
			var vs = o.edges[p.edges[j]].som[0];
			var ve = o.edges[p.edges[j]].som[1];

			for ( var m = 0 ; m < o.triangles[o.edges[p.edges[j]].tri[0] ].length ; m++)
			{
				if ( o.triangles[o.edges[p.edges[j]].tri[0] ][m] == vs )
					vt1s = m;
				if ( o.triangles[o.edges[p.edges[j]].tri[0] ][m] == ve )
					vt1e = m;
			}
			for ( var m = 0 ; m < o.triangles[o.edges[p.edges[j]].tri[1] ].length ; m++)
			{
				if ( o.triangles[o.edges[p.edges[j]].tri[1] ][m] == vs )
					vt2s = m;
				if ( o.triangles[o.edges[p.edges[j]].tri[1] ][m] == ve )
					vt2e = m;
			}
			var t = p.getTriangleIndex ( o.edges[p.edges[j]].tri[0] );
			var t2 = p.getTriangleIndex( o.edges[p.edges[j]].tri[1] );

			var target = vectfromvertices (p.trianglesflatcoord[t][vt1s].c,
													 p.trianglesflatcoord[t][vt1e].c);

			var bullet = vectfromvertices (p.trianglesflatcoord[t2][vt2s].c,
													 p.trianglesflatcoord[t2][vt2e].c);
	
			if ( done.is ( o.edges[p.edges[j]].tri[0] ) )
			{
				var itpmat = geninterpmat (bullet, target);
			   var pp = $.extend( true, [], p.trianglesflatcoord[t2]);
				for ( var ii = 0 ; ii < 3 ; ii++ )
					p.trianglesflatcoord[t2][ii].c = applymat(itpmat, pp[ii].c);
				k = 1;
			}
			else
			{
				var itpmat = geninterpmat (target, bullet);
				var pp = $.extend(true, [], p.trianglesflatcoord[t]);
				for ( var ii = 0 ; ii < 3 ; ii++ )
					p.trianglesflatcoord[t][ii].c = applymat(itpmat, pp[ii].c);
				k = 0;			
			}
			done.add ( o.edges[ p.edges[j] ].tri[k] );
 		}		
 	}
	
	// Let's finally blank and refill the final document with our new computed
	// patterns
	
  	renderplane.innerHTML = "";
	for ( var i = 0 ; i < patterns.length ; i++ )
	{

		addpatterntofinaldoc (renderplane, patterns[i]);
	}
}
function  distance (c1, c2)
{
	var d = Math.sqrt( (c2[0]-c1[0])*(c2[0]-c1[0])+
							 (c2[1]-c1[1])*(c2[1]-c1[1])+
							 (c2[2]-c1[2])*(c2[2]-c1[2]) );
	return d;

}

function patternstats (p)
{
	var nNod, nTri, nEdg, nFro;
	var maxX, minX, maxY, minY;
}

function PATTERNgotfrontier (p, f)
{
	for( var i = 0 ; i < p.frontier.length ; i++ )	
		if ( p.frontier[i] == f ) return i;
	return -1;
}
function PATTERNgenfrontier (o, p) // find fronier from junctions && triangles lists
{
	l('## PATTERNgenfrontier ##');
	for( var i = 0 ; i < p.triangles.length ; i++ )
	{
		var tmp = TRIANGLEgetedges (o, p.triangles[i]);
		for ( var j = 0 ; j < tmp.length ; j++ )
			if ( ( PATTERNgotfrontier (p,  tmp[j]) == -1 ) && ( edgestate(o, tmp[j]) != "freeze" ) )
			{
				p.frontier.push (tmp[j]);
				setedgestate (o, tmp[j], "visible");
			}
	}
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
function getpattern(triangle)
{
	for (var i = 0 ; i < patterns.length ; i++ )
		for ( var j = 0 ; j < patterns[i].triangles.length ; j ++ )	
			if ( patterns[i].triangles[j] == triangle )
				return i;
	return -1;
}
function sharededge ( o, triangle_1, triangle_2)
{
	if ( triangle_1 == triangle_2 ) return -2;
	if ( triangle_1 == -1 ) return -3;
	if ( -1 == triangle_2 ) return -3;
	for (var i = 0 ; i < o.edges.length ; i++ )
	{
		if ( ( o.edges[i].tri[0] == triangle_1 &&
				 o.edges[i].tri[1] == triangle_2) |
			  ( o.edges[i].tri[1] == triangle_1 &&
				 o.edges[i].tri[0] == triangle_2) )
		{
			return i;
		}
	}
	return -1;
}
function genflatcoord (o, t)
{
var id = t;

	var n = o.trianglesnorm[id];

	var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
	var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
	// La,matrice de transformation peut etre construite
	var itpmat = geninterpmat (bullet, target);

	var w = $.extend(true, {}, o);
	
	for ( var i = 0 ; i < w.nv ; i++ )
		w.vertices[i] = applymatNscale(itpmat, w.vertices[i]);
	
	var tmptri = [ {c : [(w.vertices[w.triangles[id][0]][0]), 
						 (w.vertices[w.triangles[id][0]][1]), 0], sid : o.triangles[t][0] },

					   {c : [(w.vertices[w.triangles[id][1]][0]), 
						 (w.vertices[w.triangles[id][1]][1]), 0], sid : o.triangles[t][1] },

				      {c : [(w.vertices[w.triangles[id][2]][0]), 
						 (w.vertices[w.triangles[id][2]][1]), 0], sid : o.triangles[t][2] }];
	fl(tmptri);

	return tmptri;

}
function addpatterntofinaldoc (renderplane, p)
{
	var g = document.createElementNS("http://www.w3.org/2000/svg",'g');
	g.setAttribute('id', 'pattern-'+p.id);
	
	for ( var i = 0 ; i < p.triangles.length ; i++ )
	{
		var tmptri = p.trianglesflatcoord[i];
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
function getpidt (p, t)
{
	for ( var i = 0 ; i < p.triangles.length ; i++ )
		if ( t == p.triangles[i] ) return i;
	fl( 'ERROR', 'xlr' );
}

// here is some OOP training ...

function processedelements ()
{
	this.pe = [];
}
processedelements.prototype.add = function ( id )
{
	this.pe.push(id);
}
processedelements.prototype.is = function (id)
{
	for ( var i = 0 ; i < this.pe.length ; i++ )
		if ( this.pe[i] == id )
			return true;
	return false;
}


// Pattern OOP define

function Pattern (id)
{
	this.triangles = [];
	this.edges = [];
	this.frontier = [];
	this.id = patterns.length;
}
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
				this.triangles.push(o.edges[this.edges[i]].tri[j]);
				setshapestate(o, o.edges[this.edges[i]].tri[j], "solid");
			}
	
	PATTERNgenfrontier (o, this);
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
	fl( 'ERROR', 'xlr' );
}
/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@protonmail.fr
	Licenced under the termes of the GNU GPL v3
*/
