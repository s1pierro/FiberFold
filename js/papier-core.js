

function buildpatterns(o) {

	//TODO 

		l('## rebuild ##');
	patterns.splice (0, patterns.length);
	//create and fill freezed junctions list
	var freezedlist = [];
	for ( var i = 0 ; i < o.ne ; i++ )
	{
		if (edgestate(o, i) == "freeze" ) freezedlist.push(i);
	}
	l('n freeze : '+freezedlist.length );
	while ( freezedlist.length > 0 )
	{

		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < freezedlist.length )
		{

			var j = 0;
			while ( add == -1 && j < patterns.length )
			{

				add = addjunctiontopattern (o,  patterns[j], freezedlist[i] );

				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	

			var tmp = { triangles : [], edges : [freezedlist[0]], frontier : [] };
			PATTERNgentriangles(o, tmp);
			patterns.push(tmp);
			freezedlist.splice(0, 1);	
		}
	}



	
	
	// at this point pattern's 2D vertices are safe to be generated
	//TODO

}

function addjunctiontopattern (o, pattern, edge)
{
	l('## addjunctiontopattern ##');
	var t1 = o.edges[edge].tri[0];
	var t2 = o.edges[edge].tri[1];
	//l(pattern);
	for ( var i = 0 ; i < pattern.edges.length ; i++ )
		if ( pattern.edges[i] == edge )	return -2;
	for ( var i = 0 ; i < pattern.triangles.length ; i++ )
	{
		if (t1 == pattern.triangles[i] | t2 == pattern.triangles[i] )
		{
			pattern.edges.push(edge);
			PATTERNgentriangles (o, pattern);
			return 1;
		}
	}
	return -1;
}
function PATTERNgentriangles (o, p) // find triangle from junction list
{
	l('## PATTERNgentriangles ##');
	for( var i = 0 ; i < p.edges.length ; i++ )
		for( var j = 0 ; j < o.edges[p.edges[i]].tri.length ; j++ )	
			if ( PATTERNgottriangle (p ,o.edges[p.edges[i]].tri[j]) == -1 )
			{
				p.triangles.push(o.edges[p.edges[i]].tri[j]);
				setshapestate(o, o.edges[p.edges[i]].tri[j], "solid");
			}
	PATTERNgenfrontier (o, p);
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
function TRIANGLEgetedges (o, t) // find fronier from edges && triangles lists
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
$
function setedgestate (o, e, s)
{	
	scene.children[(2+e)].visible = true;
	o.edges[e].state = s;
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

function shapestate (o, t)
{
	l('## shapestate ##');
	l('tri:'+t);
	return o.triangles[t].state;
}
function setshapestate (o, t, s)
{
	l('## setshapestate ##');
	l('tri:'+t);

	o.triangles[t].state = s;
	if( s == "visible")
	{
		scene.children[(2+t+o.ne)].material = material;
		scene.children[(2+t+o.ne)].visible = true;
		
	}
	if( s == "solid")
	{scene.children[(2+t+o.ne)].material = material4;}
	if( s == "highlight")
	{
		scene.children[(2+t+o.ne)].visible = true;
		scene.children[(2+t+o.ne)].material = material3;
	}
	
	
}
function aresharingedge ( o, triangle_1, triangle_2)
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

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

