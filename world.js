 // Draw a shape when mouse is clicked
 // ColoredPoints.js
 // Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec4 a_Color;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Color = a_Color;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec4 v_Color;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform vec4 u_FragColor;
uniform vec3 u_CameraPosition;
uniform int u_LightingOn;
uniform vec3 u_LightPos;
uniform vec3 u_SpotLightPos;
uniform vec3 u_SpotLightColor;

uniform sampler2D u_Sampler;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform sampler2D u_Sampler5;
uniform int u_WhichTexture;
vec3 pointLightEquation(vec3 lightPos, vec3 color){
    
  vec3 lightVector =  lightPos - vec3(v_VertPos);
  vec3 L = normalize(lightVector);
  vec3 N = normalize(v_Normal);
  float nDotL = max(dot(N,L), 0.0);
  vec3 R = reflect(-L,N);
  vec3 E = normalize(u_CameraPosition - vec3(v_VertPos));
  
  float specular = pow(max(dot(E,R),0.0),10.0)*.8;
  vec3 diffuse = vec3 (color) * nDotL * .5;
  vec3 ambient = vec3 (color) * 0.25;
  return vec3 (specular + diffuse + ambient);
}
vec3 spotLightEquation(vec3 lightPos, vec3 color, float intensity, float lightCutoff){
    vec3 lightVector = lightPos - vec3(v_VertPos);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_CameraPosition - vec3(v_VertPos));
  
    float nDotL = max(dot(N, L), 0.0);
    float eDotR = dot(E, R);
    float theta = dot(L, normalize(-vec3(0.0,-1.0,0.0)));
    float epsilon = lightCutoff - 0.1;
    intensity = clamp((theta - epsilon) / (lightCutoff - epsilon), 0.0, 1.0);
    float factor = 0.0;
    if(eDotR > 0.0) { factor = pow(max(eDotR, 0.0), 10.0) * intensity; }

    vec3 specular = vec3(1.0,1.0,1.0) * factor * 0.7;
    vec3 diffuse = vec3(gl_FragColor) * nDotL * .7 * intensity * u_SpotLightColor;
    return vec3(specular + diffuse);
}
void main() {
  gl_FragColor = vec4((v_Normal +1.0)/2.0, 1.0);

  if (u_WhichTexture == -2) {
      gl_FragColor = u_FragColor; // use color
      
    } else if (u_WhichTexture == -1) {
      gl_FragColor = vec4((v_Normal +1.0)/2.0, 1.0);
    } else if (u_WhichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler, v_UV);
    } else if (u_WhichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_WhichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_WhichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_WhichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if (u_WhichTexture == 5) {
      gl_FragColor = texture2D(u_Sampler5, v_UV);
    } else {
      gl_FragColor = vec4(1, .2, .2, 1); // Error, reddish
    }

  // lighting
  if(u_LightingOn == 0){

    //gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    vec3 color = vec3(gl_FragColor);
    gl_FragColor = vec4(0.0,0.0,0.0,0.0);
    gl_FragColor += vec4(pointLightEquation(u_LightPos, color), 1.0);
    gl_FragColor += vec4(spotLightEquation(u_SpotLightPos, color, 0.7, 0.9), 1.0);
  }

}`

//#region [[GENERAL GLOBAL VARIABLES]]
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_LightPos;
let u_SpotLightPos;
let u_SpotLightColor;
let u_LightingOn = 1;;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_CameraPosition = [0,5,0];
let wood = 5;
let roof = 5;

// [[ TEXTURE GLOBAL VARIABLES ]]
let u_WhichTexture = 0;
let u_Sampler;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;

//#region [[ MAP SET UP ]]
var map1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

var roof1 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

var roof2 = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]
//#endregion
let g_globalAngle = 0; 

// [[ LIGHTING GLOBAL VARIABALES]]
let g_lightPos = [0,12,0];
let g_spotLightPos = [-5,10,0];
let g_spotLightColor = [1,1,1];
let g_Power = false;
let g_Normalize = false;
let g_AnimatedSpotLight = false;
let g_LightingColor = [1.0, 1.0, 1.0];
let g_globalLightingPosition = [1.0, 1.0, 1.0];

//#endregion

// #region [[ CAMERA GLOBAL VARS]]
var c_eye = new Vector3([-4,7,30]);
var c_at = new Vector3([-3, 5,3]);
var c_up =  new Vector3([0,1,0]);
var c_move = [0,0,0];
var c_rotSpeed = 5;
var c_moveSpeed = 5;
var c_rotY = 0;
var c_rotX = 0;
//#endregion
let sphere;
let sphere1;

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext('webgl' , {preserveDrawingBuffer:true});
    // a fun little trick to help with lag
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
    return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

     // Get the storage location of attribute variable
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if(a_Position <0){
        console.log("failed to get the storage location locqtion of u_FragColor");
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of attribute variable
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor variable
    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    if(u_WhichTexture <0){
        console.log("failed to get the storage location locqtion of u_WhichTexture");
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

        // Get the storage location of u_Sampler
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }

    // Get the storage location of u_Sampler
    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler5');
        return;
    }

    // Get storage location for Model Matrix from our Vertex Shader
    u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    // Get storage location for our Rotate Matrix from our Vertex Shader
    // This dictates the camera angle
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program,'u_GlobalRotateMatrix');
    if(!u_GlobalRotateMatrix){
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
        return;
    }
    u_CameraPosition = gl.getUniformLocation(gl.program,'u_CameraPosition');
    if(!u_CameraPosition){
        console.log("Failed to get the storage location of u_CameraPosition");
        return;
    }

    // Get storage location for our Projection  Matrix from our Vertex Shader
    u_ProjectionMatrix = gl.getUniformLocation(gl.program,'u_ProjectionMatrix');
    if(!u_ProjectionMatrix){
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    // Get storage location for our View  Matrix from our Vertex Shader
    u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
    if(!u_ViewMatrix){
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    if (!u_LightPos) {
        console.log('Failed to get the storage location of u_LightPos');
        return false;
    }
    u_SpotLightPos = gl.getUniformLocation(gl.program, 'u_SpotLightPos');
    if (!u_SpotLightPos) {
        console.log('Failed to get the storage location of u_SpotLightPos');
        return false;
    }
    u_SpotLightColor = gl.getUniformLocation(gl.program, 'u_SpotLightColor');
    if (!u_SpotLightColor) {
        console.log('Failed to get the storage location of u_SpotLightColor');
        return false;
    }
    u_LightingOn = gl.getUniformLocation(gl.program, 'u_LightingOn');
    if (u_LightingOn < 0) {
        console.log('Failed to get the storage location of u_LightingOn');
        return false;
    }

    // Set an initial value for this matrix to identity
    var indentityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, indentityM.elements);
}

function addActionsForHtmlUI(){
    //let angleSlider = document.getElementById('angleSlider');
    //angleSlider.addEventListener('mousemove', function(){g_globalAngle = this.value; renderScene();});
    
    //#region [[ LIGHTING ]]
    // SET UP
    let redSlider = document.getElementById('redSlider');
    let greenSlider = document.getElementById('greenSlider');
    let blueSlider = document.getElementById('blueSlider');
    let normalize = document.getElementById('normalize');
    let power = document.getElementById('power');
    let animate =  document.getElementById('animate');
    let lightX = document.getElementById('lightSliderX');
    let lightY = document.getElementById('lightSliderY');
    let lightZ = document.getElementById('lightSliderZ');
    let SlightX = document.getElementById('SlightSliderX');
    let SlightY = document.getElementById('SlightSliderY');
    let SlightZ = document.getElementById('SlightSliderZ');

    // COLORS
    redSlider.addEventListener('mousemove', function(){g_spotLightColor[0] = this.value;});
    greenSlider.addEventListener('mousemove', function(){g_spotLightColor[1] = this.value;});
    blueSlider.addEventListener('mousemove', function(){g_spotLightColor[2] = this.value;});

    // BUTTONS
    power.onclick =  function(){g_Power = !g_Power};
    normalize.onclick =  function(){g_Normalize = !g_Normalize;};
    animate.onclick =  function(){g_AnimatedSpotLight = !g_AnimatedSpotLight;};

    // SLIDERS
    lightX.addEventListener('input', function() {g_lightPos[0] = parseFloat(this.value);});
    lightY.addEventListener('input', function() {g_lightPos[1] = parseFloat(this.value);});
    lightZ.addEventListener('input', function() {g_lightPos[2] = parseFloat(this.value);});
    // SPOT LIGHT SLIDERS
    SlightX.addEventListener('input', function() {g_spotLightPos[0] = parseFloat(this.value);});
    SlightY.addEventListener('input', function() {g_spotLightPos[1] = parseFloat(this.value);});
    SlightZ.addEventListener('input', function() {g_spotLightPos[2] = parseFloat(this.value);});
    //#endregion

    //#region [[ HOUSE CUSTOMIZATIONS ]]
      let oak = document.getElementById('Oak')
      oak.addEventListener("click", function() {
          wood = 5;
      });

      let darkOak = document.getElementById('DarkOak')
      darkOak.addEventListener("click", function() {
          wood = 4;
      }); 

      let arcadia = document.getElementById('Arcadia')
      arcadia.addEventListener("click", function() {
          wood = 3;
      });   
      let oakRoof = document.getElementById('OakRoof')
      oakRoof.addEventListener("click", function() {
          roof = 5;
      });

      let darkOakRoof = document.getElementById('DarkOakRoof')
      darkOakRoof.addEventListener("click", function() {
          roof = 4;
      }); 

      let arcadiaRoof = document.getElementById('ArcadiaRoof')
      arcadiaRoof.addEventListener("click", function() {
          roof = 3;
      });  

    //#endregion
    
}

function main() {

    // [[ SET UP FUNCTIONS ]]
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    
    document.onkeydown = keydown;
    document.onkeyup = keyup;

    initTextures();

    // Set Canvas Color
    gl.clearColor(75/255, 97/255, 84/255, 1.0);
    sphere = new Sphere();
    sphere.color = [230/255,2/255, 50/255, 1];
    sphere.matrix.translate(0,0,10);

    sphere1 = new Sphere();
    sphere1.color = [230/255,100/255, 50/255, 1];
    sphere1.matrix.translate(-5,0,7);
    // call anim fram
    requestAnimationFrame(tick);
   // console.log(g_globalAngle);
 }

 let g_time = Date.now();
 let g_time_elapsed;
 
 function oscCircle(time, radius, initX, initZ){
  //given readiuc 
  let x = initX + radius * Math.cos(time);
  let z = initZ + radius * Math.sin(time);
  return [x, z];
 }
 function tick(){
  
    var curr_time = Date.now();
    g_time_elapsed = curr_time - g_time;
    g_time = curr_time;

    c_update(g_time_elapsed);
    c_rotY = 0;
    c_rotX= 0;
    if(g_AnimatedSpotLight){
      let [x, z] = oscCircle(g_time/700, 7, 0, 0);
      g_spotLightPos[0] = x;
      g_spotLightPos[2] = z;
    }
    renderScene();

    sendTextToHTML('ms: '+ Math.floor(g_time_elapsed) + ' fps: ' + Math.floor(10000/g_time_elapsed)/10, 'fps');
    requestAnimationFrame(tick);
 }

 
 function c_update(elapsedTime){//camera update

  let forward = new Vector3().set(c_at).sub(c_eye).normalize();
  let right = Vector3.cross(forward,c_up).normalize();
  let delta = c_moveSpeed*elapsedTime/1000;
  move_distance = forward.mul(c_move[2]*delta).add(right.mul(c_move[0]*delta));
  c_eye.add(move_distance);
  c_at.add(move_distance);
  
  if (c_rotY != 0) {
    const angle = c_rotY * c_rotSpeed * elapsedTime / 1000;
    console.log("angle: " + angle);
    forward =  new Vector3().set(c_at).sub(c_eye).normalize();
    var rotMat = new Matrix4().setRotate(-1*angle, c_up.elements[0], c_up.elements[1], c_up.elements[2]);
    var new_forward = rotMat.multiplyVector3(forward);

    c_at.set(c_eye).add(new_forward);
    console.log("camera updated");
  }
  if(c_rotX != 0){
    const angle = c_rotX * c_rotSpeed * elapsedTime / 1000;
    forward = new Vector3().set(c_at).sub(c_eye).normalize();
    right = Vector3.cross(forward, c_up).normalize();
    var rotMat = new Matrix4().setRotate(angle,right.elements[0],right.elements[1],right.elements[2]);
    var newForward = rotMat.multiplyVector3(forward);
    c_at.set(c_eye).add(newForward);
  }

 }

function keydown(ev){
    if(ev.keyCode==68){ // D
        c_move[0] = 1;
    }else if(ev.keyCode ==65){ // A
        c_move[0] = -1;
    }else if(ev.keyCode == 87){ // W
        c_move[2] = 1;
    }else if(ev.keyCode == 83){ //S
        c_move[2] = -1;
    }else if(ev.keyCode == 69){ //E
        c_rotY = 20;
        console.log("E");
    }else if(ev.keyCode == 81){ //Q
        c_rotY = -20;
        console.log("Q");
    }else if(ev.keyCode == 82){// R
        c_rotX = 20;
    }else if(ev.keyCode == 70){// F
        c_rotX = -20;
    }else{
        console.log("invalid key");
    }
}

function keyup(ev){
  if(ev.keyCode==68){ // D
      c_move[0] = 0;
  }else if(ev.keyCode ==65){ // A
      c_move[0] = 0;
  }else if(ev.keyCode == 87){ // W
      c_move[2] = 0;
  }else if(ev.keyCode == 83){ //S
      c_move[2] = 0;
  }
}

 function renderScene(){

    //#region [[ CAMERA MATRIX ]]
    // making the projection  matrix 
    var projMat = new Matrix4()
    projMat.setPerspective(60, canvas.width/canvas.height,.1, 1000);

    gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements);

    // making the view matrix 
    var viewMat = new Matrix4()
    viewMat.setLookAt(c_eye.elements[0],c_eye.elements[1],c_eye.elements[2], 
                      c_at.elements[0], c_at.elements[1], c_at.elements[2], 
                      c_up.elements[0], c_up.elements[1], c_up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix,false,viewMat.elements);
    // making the rotational matrix 
    var globalRotMat = new Matrix4(); // turn the angle into a matrix
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements); // roate it based off that global rotate matrix

    gl.uniform3f(u_CameraPosition, c_eye.elements[0], c_eye.elements[1], c_eye.elements[2]);
    //#endregion 

    gl.uniform3f(u_LightPos, g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    gl.uniform3f(u_SpotLightPos, g_spotLightPos[0],g_spotLightPos[1],g_spotLightPos[2]);
    gl.uniform3f(u_SpotLightColor, g_spotLightColor[0],g_spotLightColor[1],g_spotLightColor[2]);

    // Clear Canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(u_LightingOn, g_Power == false? 1 : 0);
    // Drawing the House
    drawMap(map1,wood,1);
    drawMap(map1,wood,2);
    drawMap(roof1,roof,3);
    drawMap(roof2,roof,4);

    // Ground floor
    var ground = new Cube();
    ground.textureNum = 1; // THESE NEEDS TO CHANGE WHEN IT WORKS
    ground.matrix.translate(0,-1,0);
    ground.matrix.scale(100,0,100);
    ground.matrix.translate(-.5,-.5,.5);
    ground.render();

    // Sky 
    var sky = new Cube();
    sky.color = [1,0,0,1];
    sky.textureNum = 0;
    sky.matrix.scale(100,100,100);
    sky.matrix.translate(-.5,-0.5,.5);
    sky.render();
    if(g_Normalize) {
      sphere.textureNum = -1;
      sphere1.textureNum = -1;
    }
    else {
      sphere.textureNum = -2;
      sphere1.textureNum = -2;
    }
    sphere.render();
    sphere1.render();
    var lightCube = new Cube();
    lightCube.matrix.setTranslate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    lightCube.matrix.translate(.5,.5,-.5);
    lightCube.color = [1, 0, 0, 1];
    lightCube.textureNum = -2;
    lightCube.matrix.scale(-1,-1,-1);
    lightCube.render();

    var spotLightCube = new Cube();
    spotLightCube.matrix.setTranslate(g_spotLightPos[0],g_spotLightPos[1],g_spotLightPos[2]);
    spotLightCube.matrix.translate(.5,.5,-.5);
    spotLightCube.textureNum = -2;
    spotLightCube.matrix.scale(-1,-1,-1);
    spotLightCube.render();
    

}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log('Failed to get ' + htmlID + ' from HTML');
        return;
    }
    htmlElm.innerHTML = text;
}

function drawMap(map, texture, level){
    for(x=0;x<32;x++){
        for(y=0;y<32;y++){
            if(map[x][y] == 1){
                var body = new Cube();
                if(g_Normalize == true){
                  body.textureNum = -1; //normalize color
                }else{
                  body.textureNum = texture;
                }
                body.matrix.translate(x-20,1*level-2,y-15);
                body.render();
            }
        }
    }
}

//#region [[ TEXTURE LOADER FUNCTIONS ]]
function initTextures() {
      let image0 = new Image();
      let image1 = new Image();
      let image2 = new Image();
      let image3 = new Image();
      let image4 = new Image();
      let image5 = new Image();


      image0.src = './resources/sky.png';
      image0.onload = () => {
        loadTexture0(image0);
      }
      image1.src = './resources/ground.png';
      image1.onload = () => {
        loadTexture1(image1);
      }
      image2.src = './resources/door.png';
      image2.onload = () => {
        loadTexture2(image2);
      }
      image3.src = './resources/wood_arcadia.png';
      image3.onload = () => {
        loadTexture3(image3);
      }
      image4.src = './resources/wood_dark_oak.png';
      image4.onload = () => {
        loadTexture4(image4);
      }
      image5.src = './resources/wood_oak.png';
      image5.onload = () => {
        loadTexture5(image5);
      }
  }
  
function loadTexture0(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);
  }

  function loadTexture1(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
  }

  function loadTexture2(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
  }

  function loadTexture3(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler3, 3);
  }

  function loadTexture4(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE4);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler4, 4);
  }

  function loadTexture5(image) {
    let texture = gl.createTexture();
    if (!texture) {
      console.error("Failed to create texture");
      return -1;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE5);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler5, 5);
  }
//#endregion