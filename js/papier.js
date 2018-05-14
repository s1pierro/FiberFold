/*
	this file is a part of 
	paperseed 0.0.1
		
	Author : Saint Pierre Thomas
	feel fre to contact me at spierro@free.fr
	Licenced under the termes oftrhe GNU GPL v3
*/
'use strict';

$('#settings').hide();

var silent = false;


function initScene()
{

	var zoom = 10;
	var ratio = $("#svg8").width()/$("#svg8").height();
	initView(270, 0, 0, 9);
	$("#svg8").attr('viewBox', '-'+((zoom*ratio)/2)+' -'+(zoom/2)+' '+(zoom*ratio)+' '+zoom);
}
window['initScene'] = initScene;
function buildScene()
{
	var Logo = {};
	var TMPwvft = {};
	Logo = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'logo'));
	paperseed.Items.splice (0, paperseed.Items.length );
	var tmpWvft2 = {};
	
	var vpos = [0, 0, 0];
	var u = 0;
	var v = 0;
	var square = 'a0';
	tmpWvft2 = $.extend(true, {}, Logo);
	var altItem = {id: paperseed.Items.length, pos: vpos,  x: u, y: v, index: 0, w: {}};
	setWavefrontId(tmpWvft2, paperseed.Items.length);			
	altItem.w = $.extend(true, {},tmpWvft2 );
	paperseed.Items.push(altItem);
}
window['buildScene'] = buildScene;
function getid(f) {
var tmp = $(f).attr('id');
return parseInt(tmp);

}
window['getid'] = getid;


function add_to_renderplane (renderplane, t)
{
			var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg.setAttribute('points', t);
			svg.setAttribute('class', 'solid' );
			renderplane.appendChild(svg);

}

function buildjunctions (obj)
{
			for( var i = 0; i < obj.triangles.length ; i++ )
			{
				for ( var j = 0 ; j < obj.triangles[i].length ; j ++ )
					if ( j == ( obj.triangles[i].length - 1 ) )
						addjunction (obj, obj.triangles[i][j],
										 obj.triangles[i][0], i);
					else
						addjunction (obj, obj.triangles[i][j],
										 obj.triangles[i][(j+1)], i);
			}
			for( var i = 0; i < obj.junctions.length ; i++ )
				showjunction (obj, i);
			for( var i = 0; i < obj.junctions.length ; i++ )
				setjstate (i, "hide");
}
function addline (obj, s1, s2, n, id)
{
	var tmp = obj.triangles.length;
	obj.triangles.push([s1, s2]);
	obj.trianglesnorm.push(n);
	obj.triangles[tmp].id = id;
	obj.triangles[tmp].state = "visible";
}

function rmline (obj, s1, s2)
{
	for( var i = 0; i < obj.triangles.length ; i++ )
	{

		if ( obj.triangles[i].length == 2 )
		{
		//	l('testing '+i+' ( '+obj.triangles[i][0]+', '+obj.triangles[i][1]+' )');	
			if ( ( s1 == obj.triangles[i][0] && s2 == obj.triangles[i][1] ) |
				  ( s2 == obj.triangles[i][0] && s1 == obj.triangles[i][1] ) ) 
			{
				obj.triangles.splice(i, 1);
				obj.trianglesnorm.splice(i, 1);
				l('# rm line '+s1+', '+s2+' : '+i, 'r');
				return;
			}
		}
	}
}
function rmtriangle (obj, t) {

	if (t > -1) {
		obj.triangles.splice(t, 1);
		obj.trianglesnorm.splice(t, 1);
		l('# rm triangle '+t, 'r');
			}
	else
	{
		l('## rmtriangle - error rm triangle '+t, 'r');
	}
}
function hidejunction (obj, j)
{
	var rms1 = obj.junctions[j].som[0];
	var rms2 = obj.junctions[j].som[1];

	l('hide junc '+j+' rms1: '+rms1+', rms2: '+rms2, 'lr');
	rmline (obj, rms1, rms2 );
}
function isjunctionshown (obj, k)
{
	//TODO Important correction needed //TODO
	var s1 = obj.junctions[k].som[0];
	var s2 = obj.junctions[k].som[1];
	
		l('** isjunctionshown '+k+'( '+s1+', '+s2+' )');
		
		l('obj.nt '+obj.nt);
		l('final buffer nt '+obj.triangles.length);
		l('n junctions '+ (obj.triangles.length - obj.nt));
		
		
	if ( obj.nt == obj.triangles.length )
	{
		l('there is no junction yet'+k);
		return -1;
	}
	if ( k < 0 | k > (obj.triangles.length-obj.nt) )
	{
		l('nj: '+(obj.triangles.length-obj.nt), 'r')
		l('## isjunctionshow : index error: j='+k, 'r');
		return -2;
	}
	for( var i = obj.nt; i < obj.triangles.length ; i++ )
	{
	//	l('testing '+i+' ( '+obj.triangles[i][0]+', '+obj.triangles[i][1]+' )');
		if ((( s1 == obj.triangles[i][0] &&
				 s2 == obj.triangles[i][1]) |
			  ( s2 == obj.triangles[i][0] &&
			  	 s1 == obj.triangles[i][1]) ) /*&& obj.triangles[i].length == 2 */)
			  return obj.triangles[i].id;
	}
	l('  -> this junction is not showned');
	return -1;
}

function showjunction (obj, i) {
	var tmp = isjunctionshown(obj, i);
	if ( tmp == -1 )
	//if(true)
	{
				var n1 = $.extend(true, [], obj.trianglesnorm[obj.junctions[i].tri[0]]);
				var n2 = $.extend(true, [], obj.trianglesnorm[obj.junctions[i].tri[1]]);
				
				vectfromvertices (n1, n2).o;
				var mid0 =  vectfromvertices (n1, n2).o;
				var mid1 =  vectfromvertices (n1, n2).o;
				mid1[0] = (mid0[0] + (vectfromvertices (n1, n2).s[0]*vectfromvertices (n1, n2).n/2));
				mid1[1] = (mid0[1] + (vectfromvertices (n1, n2).s[1]*vectfromvertices (n1, n2).n/2));
				mid1[2] = (mid0[2] + (vectfromvertices (n1, n2).s[2]*vectfromvertices (n1, n2).n/2));
				var sens = normalisevertex(mid1);

				
				addline (obj, obj.junctions[i].som[0],
																  obj.junctions[i].som[1], sens, i);
	}
	else l('showjunction '+i+' - error: junction already showned', 'r');
}

function addjunction (obj, s1, s2, tri) {

	var mrg = false;
	var same = false;

	for( var i = 0; i < obj.junctions.length ; i++ )
		if ( ( obj.junctions[i].som[0] == s1 && obj.junctions[i].som[1] == s2) |
			  ( obj.junctions[i].som[1] == s1 && obj.junctions[i].som[0] == s2) )
	{
		same = false;
		for( var j = 0; j < obj.junctions[i].tri.length ; j++ )
			if ( obj.junctions[i].tri[j] == tri )
				same = true;
		if ( same == false )
		{
			obj.junctions[i].tri.push(tri);
			mrg = true;
		}
	}
	if ( mrg == false )
	{
		 obj.junctions.push({ som : [s1, s2], tri : [tri]});
		 obj.nj = obj.junctions.length;
	 }
}
function aresharingjunction (obj, triangle_1, triangle_2)
{
	if ( triangle_1 == triangle_2 ) return -2;
	if ( triangle_1 == -1 ) return -3;
	if ( -1 == triangle_2 ) return -3;
	for (var i = 0 ; i < obj.junctions.length ; i++ )
	{
		if ( ( obj.junctions[i].tri[0] == triangle_1 &&
				 obj.junctions[i].tri[1] == triangle_2) |
			  ( obj.junctions[i].tri[1] == triangle_1 &&
				 obj.junctions[i].tri[0] == triangle_2) )
{	console.log ('sharing');
			return i;}
	}
	console.log ('not sharing');
	return -1;
}
function isfreezed (junction)
{
	for( var i = 0 ; i < paperseed.print.patterns.length ; i++ )
		for( var j = 0 ; j < paperseed.print.patterns[i].junctions.length ; j++ )
			if (paperseed.print.patterns[i].junctions[j] == junction ) return i;
	return -1;
}
/*
		for( var i =  ; i <  ; i++ )
		{
		
		}
*/
function paperseed ()
{
	$('#start-layer').hide();
	var mode = (eval("var __temp = null"), (typeof __temp === "undefined")) ? 
	    "strict": 
	    "non-strict";
	    if (mode == "strict")
	    	l('interprete js : '+mode, 'lg');
		else
	    	l('interprete js : '+mode, 'blr');

	/*======================================================================
	
		Initialisations
		
	----------------------------------------------------------------------*/

	var container = document.getElementById("renderbox");
	var renderplane = document.getElementById("renderplane");
		var activeshape1;
		var activeshape2;	
		var activejunction;
		var activejunctionshadowedstate;
		var activeshape1shadowedstate;
		var activeshape2shadowedstate;	
	
	if ( typeof paperseed.init == 'undefined' ) {
		
		paperseed.init = true;
		
		paperseed.Items = [];
		paperseed.print = {printsize: 'A4', npages : 0, printmode : 'desktop', patterns : [] };
		
		
		buildScene ();
		paperseed.Items[0].w.junctions = [];
		buildjunctions (paperseed.Items[0].w);
		

		buffer = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'buffer'));

/*
		for ( var i = 0 ; i < paperseed.Items[0].w.triangles.length ; i++ )
		{
			var pattern = { triangles : [i], junctions : [], frontier : [] };
			paperseed.print.patterns.push(pattern);

		}
*/
		// building patterns needs :
		//
		// - frontier[frontier_junction_1, frontier_junction_2, ... ]
		// - triangles []		 				( can be empty if freezedjunctions isn't.)
		// - freezedjunctions []			( can only be empty if pattern is made of
		//											  a single triangle  )

		
		l(paperseed.impression);
		l(paperseed);
		initScene();	
		drawScene(container);
	}
	var activeshape = 0; 

	// configuration hammerJS

	var myElement = document.getElementById('svg8');
	var mc = new Hammer(myElement);
	mc.get('pan').set({
		direction: Hammer.DIRECTION_ALL
	});
	
	// Évenements fenetre
		
	$(window).on('resize', function() {

		initScene();
		drawScene(container);
	});
	
	// interactions vue
	mc.on("pan", function(ev) {
		if (paperseed.view != 'mobile') {
			rotateView(ev.velocityY * 15, ev.velocityX * 15, 0);
			drawScene(container);
		}
		else {
			window.scrollBy(0,-ev.velocityY*20);
		}
	});
//	$('html, .shape').on('mouseup', function() {
	mc.on("panend", function(ev) {

	});


	$('#svg8').on('mousewheel', function(event)
	{

		translateView (0, 0,event.deltaY*event.deltaFactor );
		drawScene(container);
	});
	$('body').on('click', '#close-settings', function() {
		$('#settings').fadeOut(); 
		$('#credits').fadeIn();

	 });
	$('body').on('click', '#toggle-settings', function() {

		$('#settings').fadeIn();
		$('#credits').fadeOut(); 

	});

	$('body').on('click', '.junction', function() {

		var id = getid (this);
		
		l('junction '+id+' hit\n  freezed ?:'+jstate(id), 'lb');
		setjstate(id, 'freeze');
	rebuildpatterns ();
		drawScene(container);
		

	});	
	
	$('body').on('click', '.shape', function() {
	
		///////////////////////////////////////////////////////////////////////
		// Dirty implementation trying, will be replace by separate explicit //
		// functions
		///////////////////////////////////////////////////////////////////////


		// on recupere l'id tu triangle selectionné. Cela correspond a sa place
		// dans le tableau Item[activeitem].w.triangles[]
		if ( activeshape1 > -1 ) paperseed.Items[0].w.triangles[activeshape1].state = activeshape1shadowedstate;
		if ( activeshape2 > -1 ) paperseed.Items[0].w.triangles[activeshape2].state = activeshape2shadowedstate;
		activeshape2 = activeshape1;
		var id = getid (this);
		activeshape1 = id;
		for ( var i = paperseed.Items[0].w.nt ; i < paperseed.Items[0].w.triangles.length ; i++ )
			if ( paperseed.Items[0].w.triangles[i].state == "highlight" )
			{
				l('restore '+activejunctionshadowedstate);
				paperseed.Items[0].w.triangles[i].state =activejunctionshadowedstate;
			}

		var connected = aresharingjunction (paperseed.Items[0].w, activeshape1, activeshape2);
		if ( connected > -1 /*&& isjunctionshown (paperseed.Items[0].w, connected) > -1*/ )
		{
			activeshape1shadowedstate = paperseed.Items[0].w.triangles[activeshape1].state;
			activeshape2shadowedstate = paperseed.Items[0].w.triangles[activeshape2].state;
			paperseed.Items[0].w.triangles[activeshape1].state = "highlight"
			paperseed.Items[0].w.triangles[activeshape2].state = "highlight"
		}
		else
		{
			activeshape1shadowedstate = paperseed.Items[0].w.triangles[activeshape1].state;
			paperseed.Items[0].w.triangles[activeshape1].state = "highlight"
			
		}
		if ( connected > -1 )
		{
			for ( var i = paperseed.Items[0].w.nt ; i < paperseed.Items[0].w.triangles.length ; i++ )
			{
				if ( paperseed.Items[0].w.triangles[i].id == connected )
				{
					activejunctionshadowedstate = paperseed.Items[0].w.triangles[i].state;
					paperseed.Items[0].w.triangles[i].state = "highlight";
					l('highlighting'+activejunctionshadowedstate);
				}
			}

		}
		drawScene(container);






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
				 (w.vertices[w.triangles[id][2]][2])]];

		

		var svgtrigon = tmptri[0][0]+', '+tmptri[0][1]+
			    ' '+tmptri[1][0]+', '+tmptri[1][1]+
			    ' '+tmptri[2][0]+', '+tmptri[2][1];
		add_to_renderplane (renderplane, svgtrigon);
		var flatmat = gentmat (234.0, 143.0, 0.0);
		
		var trsltri = $.extend(true, [], tmptri);

		for ( var i = 0 ; i < 3 ; i++ )
			trsltri[i] = applymatNscale(flatmat, tmptri[i]);

		
	});
	rebuildpatterns ();
	
}
		
window['paperseed'] = paperseed;


$(window).on("load", paperseed ());




