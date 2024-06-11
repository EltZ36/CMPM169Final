/**//snippet based from https://github.com/aferriss/p5jsShaderExamples/blob/gh-pages/2_texture-coordinates/2-5_noise/texcoord.frag for the noise shader 
//another snippet from https://github.com/aferriss/p5jsShaderExamples/blob/gh-pages/4_image-effects/4-7_displacement-map/effect.frag for the displacement part of the fire 

precision mediump float;

// this is the same variable we declared in the vertex shader
// we need to declare it here too!
varying vec2 vTexCoord;

//noise function 
float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

uniform float amt; 
uniform sampler2D tex1; 

uniform float amount; 

void main() {

  // copy the vTexCoord
  // vTexCoord is a value that goes from 0.0 - 1.0 depending on the pixels location
  // we can use it to access every pixel on the screen
  vec2 coord = vTexCoord;
  
  float avg = 1.0;

  float disp = avg * amount;

  vec4 pup = texture2D(tex1, coord + disp);

  // make some noise!
  // try changing the 10.0 (that value is the scale of the noise)
  float n = noise(coord* 5.0);

  gl_FragColor = vec4(n, n, n, 1.0);
}**/ 