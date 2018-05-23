/*
	this file is a part of 
	papier 0.4.1
		
	Author : Saint Pierre Thomas
	If you got interest in such kind of app
	feel free to contact me at spierro@free.fr
	Licenced under the termes of the GNU GPL v3
*/
'use strict';



function logMatrix(m) {

	var s = '';
	for ( var i = 0 ; i < 4 ; i++ )
	{
		for ( var j = 0 ; j < 4 ; j++ )
			s += m[i*4+j].toFixed(2)+' ';
		s+='\n';
	}
	fl(s, 'lr');
}
function logVector(a) {
    l("origine: " + a.o + "\nsens: " + a.s + "\nnorme: " + a.n, 'l')
}
window.logVector = logVector;
function logVertice(a) {
    console.log("x: " + a[0] + " y: " + a[1] + " z: " + a[2])
}
window.logVertice = logVertice;

function fl (s, format)
{
	verbose = false;
	l(s, format);
	verbose = false;	
}
function l (s, format)
{
	if (!verbose) return;
	if ( format == 'xlb')
	{
		s = '%c'+s;
		console.log(s, 'color: blue; font-size: x-large');
	}
	else if ( format == 'lb')
	{
		s = '%c'+s;
		console.log(s, 'color: blue; font-size: large');
	}
	else if ( format == 'lg')
	{
		s = '%c'+s;
		console.log(s, 'color: green; font-size: large');
	}
	else if ( format == 'xl')
	{
		s = '%c'+s;
		console.log(s, 'color: black; font-size: x-large');
	}
	else if ( format == 'l')
	{
		s = '%c'+s;
		console.log(s, 'color: black; font-size: large');
	}
	else if ( format == 'blr')
	{
		s = '%c'+s;
		console.log(s, 'color: red; font-size: large; font-weight: 700');
	}
	else	console.log(s);
}
