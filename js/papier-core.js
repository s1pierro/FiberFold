

window['drawScene'] = drawScene;

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
	l('### Rebuid patterns','l');	
	l('    n patterns :'+paperseed.print.patterns.length,'lg' );
	
	for ( var i = 0 ; i < paperseed.print.patterns.length ; i++ )
	{
		l('    pattern '+i+' : '+paperseed.print.patterns[i].triangles.length+' triangles, '+paperseed.print.patterns[i].junctions.length+' junctions','lg' );
		if ( ( paperseed.print.patterns[i].triangles.length > 1 ) &&
			  ( paperseed.print.patterns[i].junctions.length < 1 )    )
			l('  **  error pattern '+i+' has more than 1 triangle and less than 1junction','lr');

		var cohesion = checkcohesion (paperseed.print.patterns[i]);
	}
}
function PATTERNgottriangle (p,t)
{
	for( var i = 0 ; i < p.triangles.length ; i++ )	
		if ( p.triangles[i] == t ) return i;
	return -1;
}
function PATTERNgentriangles (p)
{
	for( var i = 0 ; i < p.junctions.length ; i++ )	
	{
		for( var j = 0 ; j < paperseed.w.junctions[p.junctions[i]].triangles.length ; j++ )	
			if ( PATTERNgottriangle (p ,paperseed.w.junctions[p.junctions[i]].triangles[j]) == -1 )
				p.triangles.push(paperseed.w.junctions[p.junctions[i]].triangles[j]);
		
	}
	l(p);
}
function checkcohesion (p)
{
	if ( p.junctions.length < 1 ) return 2;
	PATTERNgentriangles (p);
	var tstatus = [];
	for( var i = 0 ; i < p.triangles.length ; i++ )	tstatus.push(0);
	/*
	do
	{
		
	
	} while ();
*/
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
