/*
	this file is a part of 
	paperseed 0.0.1
		
	Author : Saint Pierre Thomas
	feel fre to contact me at spierro@free.fr
	Licenced under the termes oftrhe GNU GPL v3
*/
'use strict';

$('#settings').hide();


////////////////////////////////////////////////////////////////////////////////
//	paperseed core functions
////////////////////////////////////////////////////////////////////////////////


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
function getFaceId(f) {
var tmp = $(f).attr('id');
return parseInt(tmp);
/*
	var tmp = $(f).attr('class');
	var tmp2 = tmp.match(/ID.+ID/) + '';
	if (tmp2.includes('ID')) tmp2=tmp2.slice(2, tmp2.length-2);
	return tmp2;*/
}
window['getFaceId'] = getFaceId;


function add_to_renderplane (renderplane, t)
{
			var svg = document.createElementNS("http://www.w3.org/2000/svg",'polygon');
			svg.setAttribute('points', t);
			svg.setAttribute('class', 'solid' );
			renderplane.appendChild(svg);

}

function buildjunctionsItem (item)
{
			for( var i = 0; i < paperseed.Items[item].w.triangles.length ; i++ )
			{
			//	p('add '+paperseed.Items[item].w.triangles[i][0]+', '+paperseed.Items[item].w.triangles[i][1]);
				addjunction (paperseed.Items[item].w.triangles[i][0], paperseed.Items[item].w.triangles[i][1], i);
			//	p('add '+paperseed.Items[item].w.triangles[i][1]+', '+paperseed.Items[item].w.triangles[i][2]);
				addjunction (paperseed.Items[item].w.triangles[i][1], paperseed.Items[item].w.triangles[i][2], i);
		//		p('add '+paperseed.Items[item].w.triangles[i][2]+', '+paperseed.Items[item].w.triangles[i][0]);
				addjunction (paperseed.Items[item].w.triangles[i][2], paperseed.Items[item].w.triangles[i][0], i);
			}
	/*		for( var i = 0; i < paperseed.Items[item].junctions.length ; i++ )
			{
		
				var n1 = $.extend(true, [], paperseed.Items[item].w.trianglesnorm[paperseed.Items[item].junctions[i].tri[0]]);
				var n2 = $.extend(true, [], paperseed.Items[item].w.trianglesnorm[paperseed.Items[item].junctions[i].tri[1]]);
				
				vectfromvertices (n1, n2).o;
				var mid0 =  vectfromvertices (n1, n2).o;
				var mid1 =  vectfromvertices (n1, n2).o;
				mid1[0] = (mid0[0] + (vectfromvertices (n1, n2).s[0]*vectfromvertices (n1, n2).n/2));
				mid1[1] = (mid0[1] + (vectfromvertices (n1, n2).s[1]*vectfromvertices (n1, n2).n/2));
				mid1[2] = (mid0[2] + (vectfromvertices (n1, n2).s[2]*vectfromvertices (n1, n2).n/2));
				var sens = normalisevertex(mid1);

				
				addtriangle (paperseed.Items[item].w, paperseed.Items[item].junctions[i].som[0],
																  paperseed.Items[item].junctions[i].som[1], sens);
				
				

				
			}
			*/
}

function addtriangle (obj, s1, s2, n) {
	obj.triangles.push([s1, s2]);
	
	obj.trianglesnorm.push(n);


}

function rmtriangle (obj, t) {

	if (t > -1) {
		obj.triangles.splice(t, 1);
		obj.trianglesnorm.splice(t, 1);
		l('# rm triangle '+t, 'r');
			}
	else
	{
		l('- error rm triangle '+t, 'r');
	}
}
function hidejunction (obj, j) {
	rmtriangle (obj, obj.nt+j);
}

function addjunction (s1, s2, tri) {

	var mrg = false;
	var same = false;

			
		for( var i = 0; i < paperseed.Items[0].junctions.length ; i++ )
			if ( ( paperseed.Items[0].junctions[i].som[0] == s1 && paperseed.Items[0].junctions[i].som[1] == s2) |
				  ( paperseed.Items[0].junctions[i].som[1] == s1 && paperseed.Items[0].junctions[i].som[0] == s2) )
					{
			//			p(' junctions['+i+'].som 1: '+paperseed.Items[0].junctions[i].som[0]);
			//			p(' junctions['+i+'].som 2: '+paperseed.Items[0].junctions[i].som[1]);

						same = false;
						for( var j = 0; j < paperseed.Items[0].junctions[i].tri.length ; j++ )
				  			if ( paperseed.Items[0].junctions[i].tri[j] == tri )
				  			{
				  				same = true;
				  		//		p('###× ERROR x###');
				  			}
				  		
					  	if ( same == false )
					  	{
					  //		p('    merge '+i);
					  		paperseed.Items[0].junctions[i].tri.push(tri);
					  		mrg = true;
					  	}
			  		}
			  		
	
		
	if ( mrg == false )
	{
	

		 paperseed.Items[0].junctions.push({ som : [s1, s2], tri : [tri]});
		 }

}


function paperseed () {
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
	
	
	if ( typeof paperseed.init == 'undefined' ) {
		
		paperseed.init = true;
		
		paperseed.Items = [];
		paperseed.impression = {printsize: 'A4', npages : 0, printmode : 'desktop', patterns : [] };
		
		
		buildScene ();
		paperseed.Items[0].junctions = [];
		buildjunctionsItem (0);
		

		buffer = $.extend(true, {}, loadWavefrontFromHTLM('#logo', 'buffer'));


		for ( var i = 0 ; i < paperseed.Items[0].w.triangles.length ; i++ )
		{
		
		
			var pattern = { triangles : [i], junctions : [] };
			paperseed.impression.patterns.push(pattern);

		}
		
		l(paperseed.impression);
		l(paperseed.Items[0]);
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
	
		var selector = '#'+activeshape+'.shape';
		$(selector).addClass ('active');
	});


	$('#svg8').on('mousewheel', function(event)
	{
		translateView (0, 0,event.deltaY*event.deltaFactor );
		drawScene(container);
	});
	$('body').on('click', '#close-settings', function() { $('#settings').fadeOut(); });
	$('body').on('click', '#toggle-settings', function() { $('#settings').fadeIn(); });

	$('body').on('click', '.junction', function() {
	l('junc hit', 'lb');
		var id = getFaceId (this);
				//	$(this).addClass ('freeze');
			hidejunction (paperseed.Items[0].w, id);
			 		drawScene(container);
	});	
	$('body').on('click', '.shape', function() {
	
		///////////////////////////////////////////////////////////////////////
		// Dirty implementation trying, will be replace by separate explicit //
		// functions
		///////////////////////////////////////////////////////////////////////


		// on recupere l'id tu triangle selectionné. Cela correspond a sa place
		// dans le tableau Item[activeitem].w.triangles[]
		var id = getFaceId (this);

		activeshape = id;
		// Coloration du triaangl selectionné dans la vue 3D
		$('.active0').removeClass('active0');
		$('.active').removeClass('active').addClass('active0');
		$(this).addClass ('active');
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

		
	});	
}
		
window['paperseed'] = paperseed;


$(window).on("load", paperseed ());




