function jstate (j)
{
	return paperseed.Items[0].w.triangles[(paperseed.Items[0].w.nt+j)].state;
}
window['jstate'] = jstate;
function setjstate (j, s)
{
	paperseed.Items[0].w.triangles[(paperseed.Items[0].w.nt+j)].state = s;
}
window['setjstate'] = setjstate;
function tstate (t)
{
	return paperseed.Items[0].w.triangles[t].state;
}
window['tstate'] = tstate;
function settstate (t, s)
{
	paperseed.Items[0].w.triangles[t].state = s;
}
window['settstate'] = settstate;
function rebuildpatterns ()
{

	paperseed.print.patterns.splice (0, paperseed.print.patterns.length);
	l('### Rebuid patterns','l');	
	var o = paperseed.Items[0].w;
	l('  * freezed junction :');
	
	//create and fill freezed junctions list
	var freezedlist = [];
	for ( var i = 0 ; i < o.nj ; i++ )
	{
		if (jstate(i) == "freeze" ) freezedlist.push(i);
	}
	l(freezedlist);
	
	// start building patterns def from freezed edges
	while ( freezedlist.length > 0 )
	{
		l('frz list length : '+freezedlist.length);
		var add = -1;
		var i = 0 ;
		while ( add == -1 && i < freezedlist.length )
		{
			l('freezedlist['+i+'] : (add '+add+')');
			var j = 0;
			while ( add == -1 && j < paperseed.print.patterns.length )
			{
				l('paperseed.print.patterns['+j+'] :');
				add = addjunctiontopattern ( paperseed.print.patterns[j], freezedlist[i] );
				l('add : '+freezedlist[i]);
				if ( add != -1 )
					freezedlist.splice(i, 1);
				j++;	
			}	
			i++;		
		}
		if ( add == -1 )
		{	
			l('junctions do not match with any pattern; Create new pattern : ');
			var tmp = { triangles : [], junctions : [freezedlist[0]], frontier : [] };
			PATTERNgentriangles(tmp);
			paperseed.print.patterns.push(tmp);
			freezedlist.splice(0, 1);	
		}
	}
	l(paperseed.print.patterns);
	
	// at this point pattern's 2D vertices are safe to be generated
	//TODO




}
function addjunctiontopattern (pattern, junction)
{
	var t1 = paperseed.Items[0].w.junctions[junction].tri[0];
	var t2 = paperseed.Items[0].w.junctions[junction].tri[1];
	//l(pattern);
	for ( var i = 0 ; i < pattern.junctions.length ; i++ )
		if ( pattern.junctions[i] == junction )	return -2;
	for ( var i = 0 ; i < pattern.triangles.length ; i++ )
	{
		if (t1 == pattern.triangles[i] | t2 == pattern.triangles[i] )
		{
			pattern.junctions.push(junction);
			PATTERNgentriangles (pattern);
			return 1;
		}
	}
	return -1;
}

function JUNCTIONgottriangle (j, t)
{
	for( var i = 0 ; i < j.tri.length ; i++ )	
		if ( j.tri[i] == t ) return i;
	return -1;
}
function PATTERNgottriangle (p, t)
{
	for( var i = 0 ; i < p.triangles.length ; i++ )	
		if ( p.triangles[i] == t ) return i;
	return -1;
}function PATTERNgotfrontier (p, f)
{
	for( var i = 0 ; i < p.frontier.length ; i++ )	
		if ( p.frontier[i] == f ) return i;
	return -1;
}
function PATTERNgentriangles (p) // find triangle from junction list
{
	for( var i = 0 ; i < p.junctions.length ; i++ )
		for( var j = 0 ; j < paperseed.Items[0].w.junctions[p.junctions[i]].tri.length ; j++ )	
			if ( PATTERNgottriangle (p ,paperseed.Items[0].w.junctions[p.junctions[i]].tri[j]) == -1 )
			{
				p.triangles.push(paperseed.Items[0].w.junctions[p.junctions[i]].tri[j]);
				settstate(paperseed.Items[0].w.junctions[p.junctions[i]].tri[j], "solid");
			}
	PATTERNgenfrontier (p);
}
function PATTERNgenfrontier (p) // find fronier from junctions && triangles lists
{
	for( var i = 0 ; i < p.triangles.length ; i++ )
	{
		var tmp = TRIANGLEgetjunctions (p.triangles[i]);
		for ( var j = 0 ; j < tmp.length ; j++ )
			if ( ( PATTERNgotfrontier (p,  tmp[j]) == -1 ) && ( jstate(tmp[j]) != "freeze" ) )
			{
				p.frontier.push (tmp[j]);
				setjstate (tmp[j], "visible");
				l('add');
			} else l('not add');
	}
}
function TRIANGLEgetjunctions (t) // find fronier from junctions && triangles lists
{
	var tmp = [];
	for( var i = 0 ; i < paperseed.Items[0].w.junctions.length ; i++ )
	{
		if ( JUNCTIONgottriangle (paperseed.Items[0].w.junctions[i], t) != -1 ) tmp.push(i);
	}
	return tmp;
}

	
