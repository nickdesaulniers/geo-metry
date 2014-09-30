SOURCES := \
	src/preamble.txt \
	webgl-shader-loader/webGLShaderLoader.js \
	prims/tetrahedron.js \
	prims/cube.js \
	prims/octahedron.js \
	prims/dodecahedron.js \
	prims/icosahedron.js \
	prims/cylinder.js \
	prims/cone.js \
	prims/sphere.js \
	prims/torus.js \
	prims/sierpinski.js \
	document-register-element/build/document-register-element.max.js \
	gl-matrix/src/gl-matrix/common.js \
	gl-matrix/src/gl-matrix/mat4.js \
	gl-matrix/src/gl-matrix/vec3.js \
	color-string/color-string-0.2.1.js \
	src/3d-tags.js \
	src/epilogue.txt

default:
	cat $(SOURCES) > build/3d-tags.js.tmp
	uglifyjs build/3d-tags.js.tmp -m -c > build/3d-tags.min.js.tmp
	cat src/licenses.txt build/3d-tags.js.tmp > build/3d-tags.js
	cat src/licenses.txt build/3d-tags.min.js.tmp > build/3d-tags.min.js
	rm build/*.tmp

