function l (s, format)
{
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
function logMatrix(m) {

	var s = '';
	for ( var i = 0 ; i < 4 ; i++ )
	{
		for ( var j = 0 ; j < 4 ; j++ )
			s += m[i*4+j].toFixed(2)+' ';
		s+='\n';
	}
	l(s, 'l');
}
function logVector(a) {
    l("origine: " + a.o + "\nsens: " + a.s + "\nnorme: " + a.n, 'l')
}
window.logVector = logVector;
function logVertice(a) {
    console.log("x: " + a[0] + " y: " + a[1] + " z: " + a[2])
}
window.logVertice = logVertice;

