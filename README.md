
### A webapp to perform 3d print from desktop printer.
_This project is a (js) rewritting of my old [eMesh](https://www.youtube.com/watch?v=Rcpjqd3NSTE "eMesh") desktop application (SDL, openGL2, C++)_

 It aim to provide an enought advanced paper-crafting tool to be used as an alternative prototyping tool ( as [paperAce](https://github.com/s1pierro/paperAce "paperAce") does ). Beside being as simple as possible to use.

![screen](https://github.com/s1pierro/FiberFold/blob/master/img/screen-00.png "FiberFold screenshot")
![screen](https://github.com/s1pierro/FiberFold/blob/master/img/screen-01.png "FiberFold screenshot")


#### Here is the begining of something functional. [try it !](https://s1pierro.github.io/FiberFold/)
_touch devices are not fully supported yet, they will be soon_

### State

_FreakPOC_ - **\[Reasonably Secure Proof Of Concept.\]** - Release Candidate


### Goals :

 - Provide an enought advanced paper-crafting tool to be used as an alternative prototyping tool ( as [paperAce](https://plus.google.com/photos/118368888481050824788/album/6366533843773096817/6366533840814789570?authkey=CIr985KLmqXwTA "paperAce") does ).
 - Be as simple as possible to use.

### non-Goals :

 - texturing.
 - mesh editing.
 

###  Requirements

A browser that provides webGL.

###  How to proceed
#### There's only one way to do it all:
 - Create a pattern.
 - Extend a pattern.
 - Merge patterns.
 - Splitting patterns.
 
#### Hit successively two joined triangles.

When two joined triangles are struck successively, the edge they share is called frozen. if it already is, it will be unfrozen.

**internal work :**

 - _global (user step)_
 
    Frozen edges are the main components of patterns. They connect the triangles you want to assemble to create one.  From what Papier does its work, it first calculates the coordinates of each triangles in order to move them in a same plane. then he assembles the patterns, looking for frozen edges connected by triangles. Edges that are adjacent to triangles belonging to a pattern but that are not frozen can now be considered as pattern borders. From these data, it is now possible to represent the borders of flattened patterns in the form of a chain of ordered nodes. 

 - _Step by step internal work_ :
 
      _Before processing did after an edge freeze attempt, the rebuilding of every pattern, a copy of patterns is done. to restore app state if freeze attempt fails._
    
    - **Flatten triangles**

       Flatten the triangles. The reason Papier exists! This single step could be sufficient to perform 3D printing from a desktop printer. This step also complicates things a little, code side. A "Wavefront", like most meshes, first describe the vertices of a 3d model, then the triangles are described using these vertices. But to be properly flattened, triangles must now store their own vertex coordinates. meaning is that a mesh summit could be representated by several flatened triangles summits. These vertices will then store the identifier (actually the index) of the vertex of the mesh to which they correspond.
 
    - **Assemble patterns**
      

      


### Standards and technologies :

 - Javascript
 - WebGL ( throught three.js )
 - SVG
 - HTML
 - CSS


### Third party code libraries :

 - Three.js
 - Hammer.js ( comming soon to provide touch devices compatibility )
 - jQuery
 
### to do :

 - automate patterns final layout.
 - full mobile devices support.
 - clean, beautify and clarify code design.
 - obtain funding to continue.
 - make it able to generate autoclave tabs.
 - make it able to generate assembly marks.
 - make it able to generate laser-cut compatible documents.
 - automate pattern selection.
 - enrich configuration options.
 - OOP rewrite.

### done:

 - application layout.
 - loading 3D user models.
 - manual pattern editing.
 - added an alternative pattern editing mode (fast way).
 - pattern flattening.
 - scaling capability.
 
 
## Authors

* **Thomas Saint Pierre** - *Initial work | code engineering* [s1pierro](https://github.com/s1pierro "s1pierro")
* **Gabriel Garcia** - *Graphic Design | Brand identity* [ggabogarcia](https://github.com/ggabogarcia "ggabogarcia")


## License
Code is licenced under the termes of the <a href="LICENSE.md">GNU GPL v3</a>

Graphic contents are licenced under the termes of <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
 
If you got interset in such kind of app and want more or if you want to contribute, feel free to contact me : s1pierro@protonmail.com

## Feedback
Feel free to [open an issue](https://github.com/s1pierro/Papier/issues).


	 
