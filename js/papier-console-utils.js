/*
	This file is a part of "Papier" a paper-crafting tool
	
Copyright (C) 2018  Saint Pierre Thomas ( s1pierro@protonmail.fr )

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

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
	verbose = true;
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
	else if ( format == 'xlg')
	{
		s = '%c'+s;
		console.log(s, 'color: green; font-size: x-large');
	}
	else if ( format == 'ly')
	{
		s = '%c'+s;
		console.log(s, 'color: yellow; font-size: large');
	}
	else if ( format == 'xl')
	{
		s = '%c'+s;
		console.log(s, 'font-size: x-large');
	}
	else if ( format == 'l')
	{
		s = '%c'+s;
		console.log(s, 'font-size: large');
	}
	else if ( format == 'blr')
	{
		s = '%c'+s;
		console.log(s, 'color: red; font-size: large; font-weight: 700');
	}
	else	console.log(s);
}

// An utility to note the treated elements
function processedelements ()
{
	this.pe = [];
}
processedelements.prototype.add = function ( id )
{
	if ( this.is(id) == false )
	this.pe.push(id);
}
processedelements.prototype.is = function (id)
{
	for ( var i = 0 ; i < this.pe.length ; i++ )
		if ( this.pe[i] == id )
			return true;
	return false;
}

// An utility to note the treated elements
function ToDo ()
{
	this.td = [];
}
ToDo.prototype.add = function (id)
{
	this.td.push(id);
}
ToDo.prototype.done = function (id)
{
	for ( var i = 0 ; i < this.td.length ; i++ )
		if ( this.td[i] == id )
			this.td.splice(i, 1);
}
ToDo.prototype.next = function ()
{
	return this.td[0];
}
ToDo.prototype.isEmpty = function ()
{
	if ( this.td.length == 0 ) return true;
	else return false;
}

