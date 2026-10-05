// The one world. A hand-written GLSL raymarcher: a corridor of five monoliths (one per
// project), wet-floor reflections, a light-painting ribbon that ages as it trails, dust,
// fog, ceiling seams and wall seams so the space reads as a built room, not a void.
// uDim lets the film dim the room per chapter without ever stopping the camera.

export const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uCamZ;
uniform float uVel;
uniform float uWake;
uniform float uDim;
uniform vec2 uPtr;

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+vec2(1.,-1.); a*=.5; } return v; }

float boxSDF(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }

vec3 slabC(float i){ return vec3(mod(i,2.)>0. ? 4.6 : -4.6, 3.2, -(i*28.0+16.0)); }

// returns (distance, materialId) — 1 floor, 2..6 monoliths, 7 ceiling, 8 side walls
vec2 map(vec3 p){
  float d = p.y + 2.2;
  float m = 1.;
  float dc = 7.5 - p.y;
  if(dc < d){ d = dc; m = 7.; }
  float dw = 8.2 - abs(p.x);
  if(dw < d){ d = dw; m = 8.; }
  for(int i=0;i<5;i++){
    float fi=float(i);
    float db = boxSDF(p - slabC(fi), vec3(1.5,5.4,1.0));
    if(db < d){ d = db; m = 2. + fi; }
  }
  return vec2(d, m);
}

// light bleeding out of the slabs into the room volume
float shaftAmt(vec3 q){
  float a = 0.;
  for(int i=0;i<5;i++){
    vec3 c = slabC(float(i));
    float dx = q.x - c.x;
    float dz = q.z - c.z;
    a += exp(-(dx*dx*0.4 + dz*dz*0.25)) * (mod(float(i),2.) > 0. ? 1. : 0.5);
  }
  return a;
}

vec3 nrm(vec3 p){
  vec2 e = vec2(0.0015, 0.);
  return normalize(vec3(
    map(p+e.xyy).x - map(p-e.xyy).x,
    map(p+e.yxy).x - map(p-e.yxy).x,
    map(p+e.yyx).x - map(p-e.yyx).x));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes) / uRes.y;
  float asp = uRes.x/uRes.y;
  vec3 amber = vec3(1.,.69,.125);
  vec3 teal  = vec3(.24,.84,.78);

  // pointer banks AND yaws the camera; the body breathes; fast scroll rolls the frame
  float ya = uPtr.x*0.09;
  float ca = cos(ya), sa = sin(ya);
  vec3 ro = vec3(uPtr.x*0.55 + sin(uTime*0.7)*0.05, 0.25 + uPtr.y*0.35 + sin(uTime*1.1)*0.03, uCamZ);
  vec3 d0 = vec3(uv, -(1.55 - uVel*0.45 + uPtr.y*0.05));
  vec3 rd = normalize(vec3(d0.x*ca - d0.z*sa, d0.y, d0.x*sa + d0.z*ca));
  float rl = uVel*0.10;
  rd = normalize(vec3(rd.x*cos(rl) - rd.y*sin(rl), rd.x*sin(rl) + rd.y*cos(rl), rd.z));

  float t = 0.;
  float m = -1.;
  vec3 p;
  for(int i=0;i<76;i++){
    p = ro + rd*t;
    vec2 h = map(p);
    if(h.x < 0.02){ m = h.y; break; }
    t += h.x * 1.05;
    if(t > 70.) break;
  }

  float wakeSlab = smoothstep(.3,.85,uWake);
  float wakeFloor = smoothstep(.05,.42,uWake);
  float wakeSky  = smoothstep(.55,1.,uWake);
  vec3 fogc = vec3(.027,.031,.041) * uWake;
  vec3 col = fogc;

  if(m > 0.){
    vec3 n = nrm(p);
    vec3 L = normalize(vec3(-.25,.8,.35));
    float dif = max(dot(n,L),0.);

    if(m < 1.5){
      // floor: dark graphite + thin grid
      vec2 g = abs(fract(p.xz/4.)-.5);
      float line = 1. - smoothstep(0., .022, min(g.x,g.y));
      col = vec3(.024,.027,.033)*(.25+.55*dif) + vec3(.55,.44,.2)*line*.12;
      // wet reflection: mirror-march off the floor, slabs bleed into it
      vec3 rr = normalize(vec3(rd.x, -rd.y, rd.z));
      vec2 h2 = vec2(1e9,-1.);
      float t2 = 0.;
      for(int i=0;i<22;i++){
        vec3 q = p + vec3(0.,0.03,0.) + rr*t2;
        h2 = map(q);
        if(h2.x < 0.04) break;
        t2 += h2.x;
        if(t2 > 30.) break;
      }
      if(h2.y > 1.5 && t2 <= 30.){
        float i2 = h2.y - 2.;
        vec3 ac = mod(i2,2.) > 0. ? amber : teal;
        float streak = exp(-t2*.075) * (.55 + .45*sin(uTime*.7 + i2*1.9));
        col += ac * streak * .5 * wakeSlab * wakeFloor;
      }
      col *= wakeFloor;
    } else if(m < 7.){
      // monolith: graphite slab, glowing vertical edges, breathing band
      float i = m - 2.;
      vec3 ac = mod(i,2.) > 0. ? amber : teal;
      vec3 sl = abs(p - slabC(i));
      vec3 b = vec3(1.5,5.4,1.0);
      vec3 v = sl - b;
      // second-largest of three <=0 values = distance to nearest edge line
      float d2 = max(min(v.x,v.y), max(min(v.x,v.z), min(v.y,v.z)));
      float glow = exp(d2*14.);
      float pulse = .8 + .35*sin(uTime*.7 + i*1.9);
      float fres = pow(1. - max(dot(n,-rd),0.), 3.);
      col = vec3(.05,.055,.07)*(.3+.6*dif) + ac*glow*1.9*pulse + ac*fres*.16;
      col *= wakeSlab + .15;
    } else if(m < 7.5){
      // ceiling: dark, with a thin amber seam over every slab (slabs sit at z = -(28i+16))
      float z = abs(fract((p.z + 16.)/28. + .5) - .5)*28.;
      col = vec3(.02,.023,.03)*(.2+.4*dif) + amber*exp(-z*z*3.)*.35;
      col *= wakeSlab;
    } else {
      // side walls: near-black with cold panel seams marching past
      float seam = abs(fract((p.z + 16.)/28. + .5) - .5)*28.;
      col = vec3(.018,.02,.026)*(.25+.5*dif) + teal*exp(-seam*seam*4.)*.12;
      col *= wakeSlab;
    }
    // the room volume drinks the slab light along the ray
    float midT = min(t, 18.);
    col += (amber*.09 + teal*.03) * shaftAmt(ro + rd*midT) * exp(-t*.035) * wakeSlab;
    float fog = 1. - exp(-t*.048);
    col = mix(col, fogc, fog);
  } else {
    col += (amber*.05 + teal*.02) * shaftAmt(ro + rd*min(t,24.)) * wakeSlab;
    // background: drifting embers + far stars, seen past the slabs
    float e = pow(fbm(uv*3. + uTime*.05), 6.);
    col += vec3(.5,.35,.12) * e * .5 * wakeSky;
    vec2 g = uv*140.; vec2 id = floor(g);
    float h = hash(id);
    col += vec3(.9,.89,.85) * step(.985,h) * (.6+.4*sin(uTime*2.+h*40.)) * wakeSky;
    col *= 1. - exp(-t*.02);
  }

  // ---- light-painting ribbon: a parametric head travels the room, the strip
  // is rebuilt every frame from where it has been; the trail cools as it ages
  vec2 rp2 = vec2(uv.x*asp*0.55, uv.y + uCamZ*0.012);
  float rb = 0.;
  float rw = 0.;
  for(int j=0;j<15;j++){
    float fj = float(j);
    float ht = uTime - fj*0.34;
    vec2 hp = vec2(sin(ht*.23) + .62*sin(ht*.13+2.), .34*sin(ht*.31) + .27*cos(ht*.17));
    hp = hp * vec2(.9,.62) + vec2(0., .04);
    vec2 dp = rp2 - hp;
    float d = length(dp);
    float age = fj/15.;
    rb += exp(-d*d*420.) * (1.-age);
    rw += exp(-d*d*420.) * (1.-age) * age;
  }
  vec3 ribbon = (vec3(1.,.78,.45)*rb + vec3(.65,.22,.05)*rw) * wakeSlab;
  col += ribbon*.55;

  // dust motes twinkling in the slab light
  vec2 dg = (uv + vec2(uCamZ*.004,0.))*24.;
  vec2 di = floor(dg);
  float dh = hash(di);
  if(dh > .982){
    vec2 dc = fract(dg)-.5 - vec2(sin(uTime*.5+dh*40.)*.08, cos(uTime*.4+dh*30.)*.08);
    col += vec3(.9,.55,.2) * exp(-dot(dc,dc)*30.) * (.5+.5*sin(uTime*1.8+dh*50.)) * .5 * wakeSlab;
  }

  // faint haze floor + light shafts bleed into fog
  col += vec3(.10,.07,.03) * exp(-max(ro.y,0.)*.4) * exp(-t*.09) * wakeSlab;

  gl_FragColor = vec4(col * uDim, 1.);
}
`;
