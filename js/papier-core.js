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
			PATTERNgenfrontier (pattern);
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

	
	/*
	
	
		// on recupere la normale du triangle
		var n = paperseed.Items[0].w.trianglesnorm[id];
		// on construit deux vecteurs pour l'interpolation
		// - target corespond au plan du document final. Celui qui contient les patrons
		// - bullet, dont le sens est confondu avec l'axe normal a la face selectionnée.
		var target = new Vector ([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1.0);
		var bullet = new Vector ([0.0, 0.0, 0.0], n, 1.0);
		// La,matrice de transformation peut etre construite
		var itpmat = geninterpmat (bullet, target);

		//un peu de bavardage avec la console
		l('bullet', 'l');
		logVector(bullet);
		l('target', 'l');
		logVector(target);
		l('interpolation matrix', 'l');
		logMatrix(itpmat);
	
		var w = $.extend(true, {}, paperseed.Items[0].w);
		
		for ( var i = 0 ; i < w.nv ; i++ )
			w.vertices[i] = applymatNscale(itpmat, w.vertices[i]);
		
		var tmptri = [ [ (w.vertices[w.triangles[id][0]][0]), 
				 (w.vertices[w.triangles[id][0]][1]), 
				 (w.vertices[w.triangles[id][0]][2])  ],
				     
			       [ (w.vertices[w.triangles[id][1]][0]), 
				 (w.vertices[w.triangles[id][1]][1]), 
				 (w.vertices[w.triangles[id][1]][2])  ],
				
			       [ (w.vertices[w.triangles[id][2]][0]), 
				 (w.vertices[w.triangles[id][2]][1]), 
				 (w.vertices[w.triangles[id][2]][2])  ] ];

		

		var svgtrigon = tmptri[0][0]+', '+tmptri[0][1]+
			    ' '+tmptri[1][0]+', '+tmptri[1][1]+
			    ' '+tmptri[2][0]+', '+tmptri[2][1];
		add_to_renderplane (renderplane, svgtrigon);
		var flatmat = gentmat (234.0, 143.0, 0.0);
		
		var trsltri = $.extend(true, [], tmptri);

		for ( var i = 0 ; i < 3 ; i++ )
			trsltri[i] = applymatNscale(flatmat, tmptri[i]);
*/
		



function checkpatterns ()
{

	
}









var Acontext = new AudioContext();

function playSound() {

    
	// Stéréo
	var nombreCanaux = 2;

	// Crée une mémoire tampon vide de 2 secondes
	// à la fréquence d'échantillonage du contexte AudioContext
	var nombreFrames = contexteAudio.sampleRate * 2.0;
	var tableauDonnees = audioCtx.createBuffer(nombreCanaux, nombreFrames, contexteAudio.sampleRate);
  // remplit la mémoire tampon avec du bruit blanc
  // valeurs aléatoires entre -1.0 et 1.0
  for (var canal = 0; canal < nombreCanaux; canal++) {
    // génère le tableau contenant les données
    var tampon = tableauDonnees.getChannelData(canal);
    for (var i = 0; i < nombreFrames; i++) {
      // Math.random() donne une valeur comprise entre [0; 1.0]
      // l'audio doit être compris entre [-1.0; 1.0]
      tampon[i] = Math.random() * 2 - 1;
    }
  }
	
// Récupère un AudioBufferSourceNode.
  // C'est un AudioNode à utiliser quand on veut jouer AudioBuffer
  var source = contexteAudio.createBufferSource();

  // assigne le buffer au AudioBufferSourceNode
  source.buffer = tableauDonnees;

  // connecte le AudioBufferSourceNode avec
  // la destination pour qu'on puisse entendre le son
  source.connect(contexteAudio.destination);

  // lance la lecture du so
  source.start();

}
