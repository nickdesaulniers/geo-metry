SOURCES := \
	webgl-shader-loader/webGLShaderLoader.js \
	prims/sierpinski.js \
	document-register-element/build/document-register-element.max.js \
	gl-matrix/src/gl-matrix/common.js \
	gl-matrix/src/gl-matrix/mat4.js \
	gl-matrix/src/gl-matrix/vec3.js \
	src/3d-tags.js

default:
	cat $(SOURCES) > build/3d-tags.js
	uglifyjs build/3d-tags.js -m -c > build/3d-tags.min.js

