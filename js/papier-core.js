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

			var tmp = new Pattern ();		
			tmp.addTriangle(i);
			tmp.genFrontiers (o);
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
	fl(patterns);
}

function getpattern(triangle)
{
	for (var i = 0 ; i < patterns.length ; i++ )
		for ( var j = 0 ; j < patterns[i].triangles.length ; j ++ )	
			if ( patterns[i].triangles[j] == triangle )
				return i;
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



// Pattern OOP define

function Pattern ()
{
	this.triangles = [];
	this.edges = [];
	this.frontier = [];
	this.guid = uuidv4();
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
				this.addTriangle(o.edges[this.edges[i]].tri[j]);
				setshapestate(o, o.edges[this.edges[i]].tri[j], "solid");
			}
	this.genFrontiers(o);
}
Pattern.prototype.addTriangle = function (t)
{
	this.triangles.push(t);
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
/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@protonmail.fr
	Licenced under the termes of the GNU GPL v3
*/
