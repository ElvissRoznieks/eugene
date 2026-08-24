import{c as e,d as t}from"./index-DAjVZeH7.js";var n=t(e(),1),r=`
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`,i=`
precision mediump float;
uniform sampler2D u_img;
uniform vec2 u_res;
uniform vec2 u_img_size;
uniform vec2 u_cover_scale;
uniform vec2 u_cover_offset;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_strength;
varying vec2 v_uv;

void main() {
  // Match CSS object-fit: cover + object-position
  vec2 canvas_px = v_uv * u_res;
  vec2 img_px = (canvas_px - u_cover_offset) / u_cover_scale;
  vec2 uv = img_px / u_img_size;

  float ax = sin(uv.y * 7.5 + u_time * 0.55) * 0.0018;
  float ay = cos(uv.x * 6.2 + u_time * 0.42) * 0.0016;
  uv += vec2(ax, ay) * u_strength;

  vec2 m = u_mouse;
  // Mouse is in canvas UV — convert to texture UV space for distance
  vec2 mouse_px = m * u_res;
  vec2 mouse_img = (mouse_px - u_cover_offset) / u_cover_scale;
  vec2 mouse_uv = mouse_img / u_img_size;

  float d = distance(uv, mouse_uv);
  float falloff = exp(-d * 5.5);
  float wave = sin(d * 36.0 - u_time * 3.2) * 0.0045 * falloff;
  vec2 dir = normalize(uv - mouse_uv + 0.0001);
  uv += dir * wave * u_strength;

  float swell = sin(d * 14.0 - u_time * 1.4) * 0.0022 * falloff;
  uv += dir * swell * u_strength;

  uv = clamp(uv, 0.001, 0.999);
  vec4 color = texture2D(u_img, uv);

  float shimmer = sin((uv.x + uv.y) * 40.0 + u_time * 2.0) * 0.012 * falloff * u_strength;
  color.rgb += shimmer;

  gl_FragColor = color;
}
`;function a(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)}function o(){return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function s(e=`center center`){let t=String(e).trim().split(/\s+/),n=(e,t)=>e==null?t:e===`center`?.5:e===`left`||e===`top`?0:e===`right`||e===`bottom`?1:e.endsWith(`%`)?Number(e.slice(0,-1))/100:t;if(t.length===1){let e=n(t[0],.5);return{x:e,y:e}}return{x:n(t[0],.5),y:n(t[1],.5)}}function c({enabled:e,canvasRef:t,imgRef:c,wrapRef:l,intensity:u=1,objectPosition:d=`center center`}){(0,n.useEffect)(()=>{if(!e||o())return;let n=t.current,f=c.current,p=l.current;if(!n||!f||!p)return;let m=Math.max(0,u),h=s(d),g=0,_=!0,v=null,y=null,b=null,x={x:.5,y:.5,tx:.5,ty:.5},S={v:0,t:1};function C(){if(!v||!y||!f.naturalWidth)return;let e=f.naturalWidth,t=f.naturalHeight,r=n.width,i=n.height,a=Math.max(r/e,i/t),o=e*a,s=t*a,c=(r-o)*h.x,l=(i-s)*h.y;v.uniform2f(v.getUniformLocation(y,`u_img_size`),e,t),v.uniform2f(v.getUniformLocation(y,`u_cover_scale`),a,a),v.uniform2f(v.getUniformLocation(y,`u_cover_offset`),c,l)}function w(){if(v=n.getContext(`webgl`,{alpha:!1,antialias:!1,premultipliedAlpha:!1}),!v)return!1;let e=a(v,v.VERTEX_SHADER,r),t=a(v,v.FRAGMENT_SHADER,i);if(!e||!t||(y=v.createProgram(),v.attachShader(y,e),v.attachShader(y,t),v.linkProgram(y),!v.getProgramParameter(y,v.LINK_STATUS)))return!1;v.useProgram(y);let o=v.createBuffer();v.bindBuffer(v.ARRAY_BUFFER,o),v.bufferData(v.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),v.STATIC_DRAW);let s=v.getAttribLocation(y,`a_pos`);v.enableVertexAttribArray(s),v.vertexAttribPointer(s,2,v.FLOAT,!1,0,0),b=v.createTexture(),v.bindTexture(v.TEXTURE_2D,b),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_S,v.CLAMP_TO_EDGE),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_T,v.CLAMP_TO_EDGE),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MIN_FILTER,v.LINEAR),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MAG_FILTER,v.LINEAR);try{v.texImage2D(v.TEXTURE_2D,0,v.RGBA,v.RGBA,v.UNSIGNED_BYTE,f)}catch{return!1}return v.uniform1i(v.getUniformLocation(y,`u_img`),0),!0}function T(){if(!v||!n||!p)return;let e=p.getBoundingClientRect(),t=Math.min(window.devicePixelRatio||1,1.75),r=Math.max(1,Math.floor(e.width*t)),i=Math.max(1,Math.floor(e.height*t));(n.width!==r||n.height!==i)&&(n.width=r,n.height=i,v.viewport(0,0,r,i)),v.uniform2f(v.getUniformLocation(y,`u_res`),r,i),C()}function E(e){let t=p.getBoundingClientRect();!t.width||!t.height||(x.tx=(e.clientX-t.left)/t.width,x.ty=(e.clientY-t.top)/t.height,S.t=1)}function D(){S.t=.25}function O(e){if(!_||!v||!y)return;let t=e*.001;x.x+=(x.tx-x.x)*.1,x.y+=(x.ty-x.y)*.1,S.v+=(S.t-S.v)*.08,v.uniform2f(v.getUniformLocation(y,`u_mouse`),x.x,x.y),v.uniform1f(v.getUniformLocation(y,`u_time`),t),v.uniform1f(v.getUniformLocation(y,`u_strength`),(.65+S.v*.85)*m),v.drawArrays(v.TRIANGLES,0,6),g=requestAnimationFrame(O)}function k(){if(!w()){n.style.display=`none`;return}T(),n.classList.add(`is-live`),p.addEventListener(`pointermove`,E,{passive:!0}),p.addEventListener(`pointerleave`,D,{passive:!0}),window.addEventListener(`resize`,T,{passive:!0}),g=requestAnimationFrame(O)}return f.complete&&f.naturalWidth?k():f.addEventListener(`load`,k,{once:!0}),()=>{_=!1,cancelAnimationFrame(g),p.removeEventListener(`pointermove`,E),p.removeEventListener(`pointerleave`,D),window.removeEventListener(`resize`,T),n.classList.remove(`is-live`),v&&b&&v.deleteTexture(b),v&&y&&v.deleteProgram(y)}},[e,t,c,l,u,d])}export{c as t};