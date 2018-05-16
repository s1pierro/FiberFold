

function buildpatterns() {

	//TODO 

		console.log('## rebuild ##');
	patterns.splice (0, patterns.length);
	
	
	//create and fill freezed junctions list
	var freezedlist = [];
	for ( var i = 0 ; i < wavefront.ne ; i++ )
	{
		if (edgestate(i) == "freeze" ) freezedlist.push(i);
	}
	console.log('n freeze : '+freezedlist.length );
	while ( freezedlist.length > 0 )
	{

		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < freezedlist.length )
		{

			var j = 0;
			while ( add == -1 && j < patterns.length )
			{

				add = addjunctiontopattern ( patterns[j], freezedlist[i] );

				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	

			var tmp = { triangles : [], edges : [freezedlist[0]], frontier : [] };
			PATTERNgentriangles(tmp);
			patterns.push(tmp);
			freezedlist.splice(0, 1);	
		}
	}


	console.log(patterns);
	
	
	// at this point pattern's 2D vertices are safe to be generated
	//TODO

}

function addjunctiontopattern (pattern, edge)
{

	var t1 = wavefront.edges[edge].tri[0];
	var t2 = wavefront.edges[edge].tri[1];
	//l(pattern);
	for ( var i = 0 ; i < pattern.edges.length ; i++ )
		if ( pattern.edges[i] == edge )	return -2;
	for ( var i = 0 ; i < pattern.triangles.length ; i++ )
	{
		if (t1 == pattern.triangles[i] | t2 == pattern.triangles[i] )
		{
			pattern.edges.push(edge);
			PATTERNgentriangles (pattern);
			return 1;
		}
	}
	return -1;
}
function PATTERNgentriangles (p) // find triangle from junction list
{
	for( var i = 0 ; i < p.edges.length ; i++ )
		for( var j = 0 ; j < wavefront.edges[p.edges[i]].tri.length ; j++ )	
			if ( PATTERNgottriangle (p ,wavefront.edges[p.edges[i]].tri[j]) == -1 )
			{
				p.triangles.push(wavefront.edges[p.edges[i]].tri[j]);
				setshapestate(wavefront.edges[p.edges[i]].tri[j], "solid");
			}
	PATTERNgenfrontier (p);
}
function PATTERNgottriangle (p, t)
{
	for( var i = 0 ; i < p.triangles.length ; i++ )	
		if ( p.triangles[i] == t ) return i;
	return -1;
}
function PATTERNgotfrontier (p, f)
{
	for( var i = 0 ; i < p.frontier.length ; i++ )	
		if ( p.frontier[i] == f ) return i;
	return -1;
}
function PATTERNgenfrontier (p) // find fronier from junctions && triangles lists
{
	for( var i = 0 ; i < p.triangles.length ; i++ )
	{
		var tmp = TRIANGLEgetedges (p.triangles[i]);
		for ( var j = 0 ; j < tmp.length ; j++ )
			if ( ( PATTERNgotfrontier (p,  tmp[j]) == -1 ) && ( edgestate(tmp[j]) != "freeze" ) )
			{
				p.frontier.push (tmp[j]);
				setedgestate (tmp[j], "visible");
			}
	}
}
function TRIANGLEgetedges (t) // find fronier from edges && triangles lists
{
	var tmp = [];
	for( var i = 0 ; i < wavefront.edges.length ; i++ )
	{
		if ( JUNCTIONgottriangle (wavefront.edges[i], t) != -1 ) tmp.push(i);
	}
	return tmp;
}
function JUNCTIONgottriangle (j, t)
{

	for( var i = 0 ; i < j.tri.length ; i++ )	
		if ( j.tri[i] == t ) return i;
	return -1;
}

function edgestate (e)
{
	return wavefront.edges[e].state;
}
$
function setedgestate (e, s)
{	
	scene.children[(2+e)].visible = true;
	wavefront.edges[e].state = s;
	if( s == "visible")
	scene.children[(2+e)].material = material5;
	if( s == "freeze")
	{

		scene.children[(2+e)].visible = false;
	
	}

	if( s == "highlight")
	scene.children[(2+e)].material = material5;
	if( s == "hide")
	{
		scene.children[(2+e)].material = material5;
		scene.children[(2+e)].visible = false;
	
	}
}

function shapestate (t)
{
	return wavefront.triangles[t].state;
}
function setshapestate (t, s)
{
	l('tri:'+t);
	wavefront.triangles[t].state = s;
	if( s == "visible")
	{
		scene.children[(2+t+wavefront.ne)].material = material;
		scene.children[(2+t+wavefront.ne)].visible = true;
		
	}
	if( s == "solid")
	{scene.children[(2+t+wavefront.ne)].material = material4;}
	if( s == "highlight")
	{
		scene.children[(2+t+wavefront.ne)].visible = true;
		scene.children[(2+t+wavefront.ne)].material = material3;
	}
	
	
}
function aresharingedge ( triangle_1, triangle_2)
{
	if ( triangle_1 == triangle_2 ) return -2;
	if ( triangle_1 == -1 ) return -3;
	if ( -1 == triangle_2 ) return -3;
	for (var i = 0 ; i < wavefront.edges.length ; i++ )
	{
		if ( ( wavefront.edges[i].tri[0] == triangle_1 &&
				 wavefront.edges[i].tri[1] == triangle_2) |
			  ( wavefront.edges[i].tri[1] == triangle_1 &&
				 wavefront.edges[i].tri[0] == triangle_2) )
		{
			return i;
		}
	}
	return -1;
}
