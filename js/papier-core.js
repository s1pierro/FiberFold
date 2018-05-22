var BUILDmode = "safe";
//var BUILDmode = "safe";
var scaleconst = 50;


function genflatcoord (o, t)
{
var id = t;
	// on recupere la normale du triangle
	var n = o.trianglesnorm[id];
	// on construit deux vecteurs pour l'interpolation
	// - target corespond au plan du document final. Celui qui contient les patrons
	// - bullet, dont le sens est confondu avec l'axe normal a la face selectionnée.
	var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
	var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
	// La,matrice de transformation peut etre construite
	var itpmat = geninterpmat (bullet, target);

	var w = $.extend(true, {}, o);
	
	for ( var i = 0 ; i < w.nv ; i++ )
		w.vertices[i] = applymatNscale(itpmat, w.vertices[i]);
	
	var tmptri = [ [(w.vertices[w.triangles[id][0]][0]), 
						 (w.vertices[w.triangles[id][0]][1]), 
						 (w.vertices[w.triangles[id][0]][2])],

					   [(w.vertices[w.triangles[id][1]][0]), 
						 (w.vertices[w.triangles[id][1]][1]), 
						 (w.vertices[w.triangles[id][1]][2])],

				      [(w.vertices[w.triangles[id][2]][0]), 
						 (w.vertices[w.triangles[id][2]][1]), 
						 (w.vertices[w.triangles[id][2]][2])] ];

	return tmptri;

}
function add_to_renderplane (renderplane, t)
{

	var tmptri = genflatcoord (pobj, t);
	var svgtrigon =  tmptri[0][0]+', '+tmptri[0][1]+
					 ' '+tmptri[1][0]+', '+tmptri[1][1]+
					 ' '+tmptri[2][0]+', '+tmptri[2][1];
	var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
	svg.setAttribute('points', svgtrigon);
	svg.setAttribute('class', 'solid' );
	renderplane.appendChild(svg);
}
function buildpatterns(o)
{
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
	
	// precedent code prodce patterns defs from freezed edges, by this way,
	//  it cannot add single triangle patterns, the fallowing for loop process
	// those singles triangles pattern
	
	for (var i = 0 ; i < o.triangles.length ; i++ )
		if ( getpattern(i) == -1 && shapestate(o, i) == "solid" )
		{
			var flatcoord = genflatcoord (o, i);
			var tmp = { triangles : [i], edges : [], frontier : [] };
			PATTERNgenfrontier (o, tmp);
			patterns.push(tmp);
			patterns[patterns.length-1].triangles[0].flatcoord = flatcoord;
			l(flatcoord);
		}									
	if ( patterns.length > 0 ) $('#scratch-message').fadeOut();
	else $('#scratch-message').fadeIn();
  	renderplane.innerHTML = "";
  	
  	// At this point Patterns have correct define
  	
 	for ( var i = 0 ; i < patterns.length ; i++ )
 	{
 		patterns[i].trianglesflatcoord = [];
 		for ( var j = 0 ; j < patterns[i].triangles.length ; j++ )
 		{
 			patterns[i].trianglesflatcoord.push(genflatcoord (o, patterns[i].triangles[j] ));
 		}	
 	}
 	
   
  	
	for ( var i = 0 ; i < patterns.length ; i++ )
		add_to_renderplane (renderplane, patterns[i].triangles[0]);
	verbose = true;
	l(patterns);
	verbose = false;		
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
function PATTERNgentriangles (o, p) // find triangles from junction list
{
	l('## PATTERNgentriangles ##');
	for( var i = 0 ; i < p.edges.length ; i++ )
		for( var j = 0 ; j < o.edges[p.edges[i]].tri.length ; j++ )
			if ( PATTERNgottriangle (p ,o.edges[p.edges[i]].tri[j]) == -1 )
			{
				var flatcoord = genflatcoord (o, o.edges[p.edges[i]].tri[j]);
			l(flatcoord);
				p.triangles.push(o.edges[p.edges[i]].tri[j]);
				p.triangles[p.triangles.length-1].flatcoord = flatcoord;
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

	return o.triangles[t].state;
}
function setshapestate (o, t, s)
{
	if ( s == undefined )
	l('-#- ERROR unable to set shape stae to '+s+' leaving function "setshapestate"', 'lr');



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
function getpattern(triangle)
{
	for (var i = 0 ; i < patterns.length ; i++ )
		for ( var j = 0 ; j < patterns[i].triangles.length ; j ++ )	
			if ( patterns[i].triangles[j] == triangle )
				return i;
	return -1;
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
        var a = document.createElement("a"), url = URL.createObjectURL(file);
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

