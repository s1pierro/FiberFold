
////////////////////////////////////////////////////////////////////////////////
//	Maths funcions

function Vector(a, b, c) {
    this.o = a;
    this.s = b;
    this.n = c
}
window.Vector = Vector;
function vectfromvertices(a, b) {
	if (a[0] == b[0] && a[1] == b[1] && a[2] == b[2])
		return new Vector([0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 1.0);
    var c = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]) + (b[2] - a[2]) * (b[2] - a[2]));
    return new Vector(a, [(b[0] - a[0]) / c, (b[1] - a[1]) / c, (b[2] - a[2]) / c], c)
}
window.vectfromvertices = vectfromvertices;
function magnitudevertex(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
}
window.magnitudevertex = magnitudevertex;

function normalisevertex(a) {
    var b = [0, 0, 0],
        c = magnitudevertex(a);
    b[0] = a[0] / c;
    b[1] = a[1] / c;
    b[2] = a[2] / c;
    return b
}
window.normalisevertex = normalisevertex;

function vectorproduct(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}
window.vectorproduct = vectorproduct;

function scalarproduct(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
window.scalarproduct = scalarproduct;

function multiplymatrix(a, b) {
    var c = [];
    c.length = 16;
    var d, e, f;
    for (e = 0; 4 > e; e++)
        for (d = 0; 4 > d; d++)
            for (f = c[d + 4 * e] = 0; 4 > f; f++) c[d + 4 * e] += a[f + 4 * e] * b[d + 4 * f];
    return c
}
window.multiplymatrix = multiplymatrix;

function applypersp(a) {
    v1[0] = viewangle / a[2] * a[0];
    v1[1] = viewangle / a[2] * a[1];
    v1[2] = a[2];
    return v1
}
window.applypersp = applypersp;

function applymat(a, b) {

     var c = [];
    c.lenth = 3;
   c[0] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3];
    c[1] = a[4] * b[0] + a[5] * b[1] + a[6] * b[2] + a[7];
    c[2] = a[8] * b[0] + a[9] * b[1] + a[10] * b[2] + a[11];
    return c
}
window.applymat = applymat;

function applymatNpersp(a, b) {
    var c = [];
    c.lenth = 3;
    c[2] = a[8] * b[0] + a[9] * b[1] + a[10] * b[2] + a[11];
    c[0] = viewangle / c[2] * (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3]);
    c[1] = viewangle / c[2] * (a[4] * b[0] + a[5] * b[1] + a[6] * b[2] + a[7]);
    return c
}
window.applymatNpersp = applymatNpersp;

function applymatNscale(a, b) {
     var c = [];
    c.lenth = 3;
   c[0] = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3])*scaleconst;
    c[1] = (a[4] * b[0] + a[5] * b[1] + a[6] * b[2] + a[7])*scaleconst;
    c[2] = (a[8] * b[0] + a[9] * b[1] + a[10] * b[2] + a[11])*scaleconst;
    return c
}
window.applymatNscale = applymatNscale;

function genimat() {
    var a = [];
    a.length = 16;
    var b, c;
    for (b = 0; 4 > b; b++)
        for (c = 0; 4 > c; c++) a[b + 4 * c] = b == c ? 1 : 0;
    return a
}
window.genimat = genimat;

function gentmat(a, b, c) {
    var d = genimat();
    d[3] = a;
    d[7] = b;
    d[11] = c;
    return d
}
window.gentmat = gentmat;
function gentmatfromvector(vect) {

	var a = vect.s[0]*vect.n;
	var b = vect.s[1]*vect.n;
	var c = vect.s[2]*vect.n;

	var d = genimat();

	d[3] = a;
	d[7] = b;
	d[11] = c;
	return d;
}
window.gentmatfromvector = gentmatfromvector;

function genscalemat(scale) {

	var d = genimat();

	d[0] = scale;
	d[5] = scale;
	d[10] = scale;
	d[15] = scale;

	return d;
}
window.genscalemat = genscalemat;

function genrmat(a, b, c) {
    a *= Math.PI / 180;
    var d = Math.PI / 180 * b,
        e = Math.PI / 180 * c;
    c = genimat();
    b = Math.cos(a);
    a = Math.sin(a);
    var f = Math.cos(d);
    d = Math.sin(d);
    var g = Math.cos(e);
    e = Math.sin(e);
    var h = b * d,
        k = a * d;
    c[0] = f * g;
    c[1] = -f * e;
    c[2] = -d;
    c[4] = -k * g + b * e;
    c[5] = k * e + b * g;
    c[6] = -a * f;
    c[8] = h * g + a * e;
    c[9] = -h * e + a * g;
    c[10] = b * f;
    c[3] = c[7] = c[11] = c[12] = c[13] = c[14] = 0;
    c[15] = 1;
    return c
}
window.genrmat = genrmat;
function axe_ang_to_mat ( axe, ang )
{
	var matrix = genimat();
	var rcos = Math.cos( ang );
	var rsin = Math.sin( ang );
	matrix[0] =           rcos + axe[0]*axe[0]*(1-rcos);
	matrix[4] =  axe[2] * rsin + axe[1]*axe[0]*(1-rcos);
	matrix[8] = -axe[1] * rsin + axe[2]*axe[0]*(1-rcos);
	matrix[1] = -axe[2] * rsin + axe[0]*axe[1]*(1-rcos);
	matrix[5] =           rcos + axe[1]*axe[1]*(1-rcos);
	matrix[9] =  axe[0] * rsin + axe[2]*axe[1]*(1-rcos);
	matrix[2] =  axe[1] * rsin + axe[0]*axe[2]*(1-rcos);
	matrix[6] = -axe[0] * rsin + axe[1]*axe[2]*(1-rcos);
	matrix[10] =          rcos + axe[2]*axe[2]*(1-rcos);
	matrix[3] =  matrix[7] = matrix[11] = matrix[12] = matrix[13] = matrix[14] = 0;
	matrix[15] =  1;
	return matrix;
}
window.axe_ang_to_mat = axe_ang_to_mat;
function geninterpmat (vs, ve)
{	
	l(' ## interpolation', 'lg');
	var scal, ang;
	var frmat = genimat ();
	var m = new THREE.Matrix4();
	
	// matrice de translation :
	//var translatevector = vectfromvertices( ve.o, vs.o );
	
	var a = ve.o[0] - vs.o[0];
	var b = ve.o[1] - vs.o[1];
	var c = ve.o[2] - vs.o[2];
	var ftmat = gentmat(a, b, c);
//	l('vertice a');
//	logVertice (vs.o);
//	l('vertice b');
//	logVertice (ve.o);
//	l('translate vector :', 'lg');
//	logVector (translatevector);	
//	var ftmat = gentmatfromvector (translatevector);
//	l('ftmat', 'lb')
//	logMatrix(ftmat);

	// verrification du cas d'alignement des vecteurs :
	var aligntestvector = vectfromvertices( vs.s, ve.s );
//	l('align : '+aligntestvector.n);
	if ( aligntestvector.n == 0 )
	{
		// les vecteurs sont de meme sens, une matrice d'identté suffit
		// pour la rotation
		frmat = genimat ();
	}
	else if ( aligntestvector.n == 2 )
	{
	//TODO /!\ IMPORTANT
	// Les vecteur sont de sens opposés, un vecteur aligné a leurs plan normal
	// doit etre defini pour effectuer une rotation de 180°
	}
	else
	{
	
		var a = vs.s;
		var b = ve.s;
		
		var vp = vectorproduct ( a, b);	
		vp = normalisevertex (vp);
		var sp = scalarproduct ( a, b );

      var ang = Math.acos (sp);

		frmat = axe_ang_to_mat (vp , ang );
	

	
//		fl('produit vectoriel :'+vp);
//		fl('produit scalaire :'+sp);
//		fl('ang : '+ang)
//		logMatrix(frmat, 'lb');
				
	}
	var mat = gentmat( -vs.o[0], -vs.o[1], -vs.o[2]);
	var mat3 = gentmat( ve.o[0], ve.o[1], ve.o[2]);

	var mat2 = multiplymatrix (frmat, mat);

	var finalmat = multiplymatrix (mat3, mat2);

//	logMatrix(finalmat);
	return finalmat;

}
window.geninterpmat = geninterpmat;

