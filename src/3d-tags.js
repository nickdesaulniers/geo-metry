(function () {

var vertexShaderSrc = '\
uniform mat4 uView;\n\
uniform mat4 uProj;\n\
uniform mat4 uModel;\n\
\n\
attribute vec4 aPosition;\n\
attribute vec4 aNormal;\n\
\n\
varying vec3 vNormal;\n\
varying vec3 vPosition;\n\
\n\
void main () {\n\
  vNormal = vec3(uModel * aNormal);\n\
  vPosition = vec3(uModel * aPosition);\n\
\n\
  gl_Position = uProj * uView * uModel * aPosition;\n\
}';
var fragmentShaderSrc = '\
precision mediump float;\n\
\n\
uniform bool uShowNormals;\n\
uniform vec4 uColor;\n\
varying vec3 vNormal;\n\
varying vec3 vPosition;\n\
\n\
vec3 lightPosition = vec3(2, 2, 0);\n\
vec3 ambient = vec3(0.3);\n\
vec3 lightColor = vec3(1.0);\n\
\n\
void main () {\n\
  vec3 n = normalize(vNormal);\n\
  vec3 l = lightPosition - vPosition;\n\
\n\
  float nDotL = clamp(dot(n, normalize(l)) / length(l) * 2.0, 0.0, 1.0);\n\
\n\
  if (uShowNormals) {\n\
    gl_FragColor = vec4(abs(n), 1.0);\n\
  } else {\n\
    gl_FragColor = uColor;\n\
  }\n\
}';

var loader, aspectRatio, color, normals; // :(
var d = degPerPeriod(10);

function glCreated (errors, program, gl) {
  if (errors.length) return console.error.apply(console, errors);

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  var uniforms = loader.getUniforms(gl, program);
  var modelMatrix = setUniforms(gl, uniforms);

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  generateGeometry(gl, program, function (n) {
    var previous = performance.now();
    (function anim (t) {
      var dt = t - previous;
      previous = t;
      mat4.rotateY(modelMatrix, modelMatrix, d2r(dt * d));
      gl.uniformMatrix4fv(uniforms.uModel, false, modelMatrix);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
      requestAnimationFrame(anim);
    })(previous);
  });
};
function generateGeometry (gl, program, cb) {
  var attributes = loader.getAttributes(gl, program);
  var geometry = Sierpinski();
  initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), 3, attributes.aPosition);
  initBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(geometry.normals), 3, attributes.aNormal);
  initBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices));
  cb(geometry.indices.length);
};
function initBuffer (gl, type, data, elemPerVertex, attribute) {
  var buffer = gl.createBuffer();
  if (!buffer) throw new Error('Failed to create buffer');
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, gl.STATIC_DRAW);
  if (type === gl.ARRAY_BUFFER) {
    gl.vertexAttribPointer(attribute, elemPerVertex, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribute);
  }
};
function setUniforms (gl, uniforms) {
  var modelMatrix = createModelMatrix();
  gl.uniformMatrix4fv(uniforms.uModel, false, modelMatrix);
  gl.uniformMatrix4fv(uniforms.uView, false, createViewMatrix());
  gl.uniformMatrix4fv(uniforms.uProj, false, createProjMatrix());
  if (color.length) {
    gl.uniform4fv(uniforms.uColor, color);
  } else {
    gl.uniform1i(uniforms.uShowNormals, true);
  }
  return modelMatrix;
};
function createModelMatrix () {
  var modelMatrix = mat4.create();
  mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(1.8, 1.8, 1.8));
  return modelMatrix;
};
function createViewMatrix () {
  var eye = vec3.fromValues(2, 2, 3);
  var center = vec3.fromValues(0, 0, 0);
  var up = vec3.fromValues(0, 1, 0);
  var viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, eye, center, up);
  return viewMatrix;
};
function createProjMatrix () {
  var projMatrix = mat4.create();
  mat4.perspective(projMatrix, d2r(75.0), aspectRatio, 0.01, 50);
  return projMatrix;
};
function d2r (deg) { return deg * Math.PI / 180.0; };
function degPerPeriod (period) { return 0.36 / period; };
function created () {
  console.log('here I am ^_^ ');
  //console.log('with content: ', this.textContent);
  console.log(this);
  var width = parseInt(this.getAttribute('width'), 10);
  var height = parseInt(this.getAttribute('height'), 10);
  if (isNaN(width) || isNaN(height)) return console.error("width and height attributes required");
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  aspectRatio = width / height;

  if (this.hasAttribute('color')) {
    color = colorString.getRgba(this.getAttribute('color'));
    color[0] /= 255;
    color[1] /= 255;
    color[2] /= 255;
    color[3] = 1.0;
    normals = false;
  } else {
    normals = true;
  }

  var gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, });
  loader = new WebGLShaderLoader(gl);
  loader.loadFromStr(vertexShaderSrc, fragmentShaderSrc, glCreated);
  this.appendChild(canvas);
};

var MyElement = document.registerElement(
  'geo-metry',
  {
    prototype: Object.create(
      HTMLElement.prototype, {
      createdCallback: {value: created},
      attachedCallback: {value: function() {
        console.log('live on DOM ;-) ');
      }},
      detachedCallback: {value: function() {
        console.log('leaving the DOM :-( )');
      }},
      attributeChangedCallback: {value: function(
        name, previousValue, value
      ) {
        if (previousValue == null) {
          console.log(
            'got a new attribute ', name,
            ' with value ', value
          );
        } else if (value == null) {
          console.log(
            'somebody removed ', name,
            ' its value was ', previousValue
          );
        } else {
          console.log(
            name,
            ' changed from ', previousValue,
            ' to ', value
          );
        }
      }}
    })
  }
);

})();

