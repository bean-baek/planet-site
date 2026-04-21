import{A as e,C as t,D as n,E as r,F as i,M as a,N as o,O as s,P as c,S as l,T as u,_ as d,a as f,b as p,c as m,d as h,f as g,g as ee,h as te,i as ne,j as re,k as _,l as v,m as ie,n as ae,o as oe,p as se,r as ce,s as le,t as ue,u as y,v as b,w as x,x as de,y as fe}from"./three-CSOvY4xL.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var S=new i({canvas:document.getElementById(`bg`),antialias:!0,alpha:!0,powerPreference:`high-performance`});S.setSize(window.innerWidth,window.innerHeight),S.setPixelRatio(Math.min(window.devicePixelRatio,2)),S.toneMapping=7,S.toneMappingExposure=.9,S.outputColorSpace=n;var C=new s,pe=new g(`#355865`);C.background=pe,C.fog=new te(pe,4,14);var w=new de(38,window.innerWidth/window.innerHeight,.1,1e3);w.position.set(0,.4,5),w.lookAt(0,0,0);var me=new le(`#ffffff`,2);C.add(me);var he=new ie(15259391,1);he.position.set(5,5,5),C.add(he);function ge(){return new Promise((e,t)=>{let r=new re,i={},a=0,o=[[`/ring.png`,`ringTexture`,!0],[`/model/sphere/sphere-albedo.webp`,`sphereAlbedo`,!0],[`/model/sphere/sphere-normal.webp`,`sphereNormal`,!1],[`/model/sphere/sphere-roughness.webp`,`sphereRoughness`,!1]],s=o.length,c=(t,r)=>o=>{r&&(o.colorSpace=n),i[t]=o,a++,a===s&&e(i)};o.forEach(([e,n,i])=>r.load(e,c(n,i),void 0,t))})}function _e({sphereAlbedo:t,sphereNormal:n,sphereRoughness:r}){return new b(new e(1,64,64),new p({map:t,normalMap:n,normalScale:new o(.08,.08),roughnessMap:r,roughness:.55,metalness:.1,transparent:!0,opacity:.95,transmission:.15,iridescence:1,iridescenceIOR:1.3,iridescenceThicknessRange:[100,800]}))}function ve(e){e.geometry.dispose(),e.material.map&&e.material.map.dispose(),e.material.normalMap&&e.material.normalMap.dispose(),e.material.roughnessMap&&e.material.roughnessMap.dispose(),e.material.dispose()}var T=Math.PI/2+.2,E=Math.PI+.2;function ye(e){e.rotation.x=T,e.rotation.y=E}var D=1.2,O=2.3,k=[16770280,16766693,16771286,16774614,15259391,14083839,14090226,15267583],A=k.map(e=>new g(e)),be=class extends se{constructor(e,t,n){super(),this.rx=e,this.ry=t,this.rAmp=.015+Math.random()*.03,this.rFreq=3+Math.floor(Math.random()*1.3),this.zAmp=.01+Math.random()*.04,this.zFreq=2+Math.floor(Math.random()*1.5),this.phase=n*Math.PI*1.2}getPoint(e){let t=e*Math.PI*2,n=1+this.rAmp*Math.sin(t*this.rFreq+this.phase),r=this.zAmp*Math.sin(t*this.zFreq+this.phase*.3);return new c(this.rx*n*Math.cos(t),this.ry*n*Math.sin(t),r)}};function xe(e,t,n,r,i){let o=(e+t)/1.8,s=(t-e)*(.03+Math.random()*.2),c=new b(new a(new be(o*1,o,i),256,s,8,!0),new fe({color:n,transparent:!0,opacity:r,blending:2,depthWrite:!1,fog:!1}));return ye(c),c}function Se(){let e=[],t=(O-D)/100;for(let n=0;n<100;n++){let r=D+n*t,i=r+t*1.5,a=k[n%k.length],o=n%4==0,s=xe(r,i,a,o?.21:.12,n/100);s.renderOrder=o?100+n:n,e.push(s)}return e}function Ce(e){(Array.isArray(e)?e:e.children||[]).forEach(e=>{e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}var we=1200,j=new Float32Array(we*3),Te=new Float32Array(we);for(let e=0;e<we;e++){let t=6+Math.random()*8,n=Math.random()*Math.PI*2,r=Math.acos(2*Math.random()-1);j[e*3+0]=t*Math.sin(r)*Math.cos(n),j[e*3+1]=t*Math.sin(r)*Math.sin(n),j[e*3+2]=t*Math.cos(r),Te[e]=.3+Math.random()*1.4}function Ee(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`),r=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,`rgba(255,255,255,1.0)`),r.addColorStop(.2,`rgba(255,255,255,0.9)`),r.addColorStop(.5,`rgba(240,240,255,0.35)`),r.addColorStop(.85,`rgba(220,220,255,0.08)`),r.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=r,t.fillRect(0,0,128,128);let i=new h(e);return i.colorSpace=n,i}var De=Ee(),M=new y;M.setAttribute(`position`,new v(j,3)),M.setAttribute(`size`,new v(Te,1));var Oe=new _({uniforms:{uSize:{value:.04},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uMap:{value:De},uColor:{value:new g(16773590)},uOpacity:{value:.9}},vertexShader:`
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`,fragmentShader:`
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor * tex.rgb, tex.a * uOpacity);
  }
`,transparent:!0,blending:2,depthWrite:!1,fog:!1}),ke=new x(M,Oe);function Ae(){M.dispose(),Oe.dispose(),De.dispose()}var N=5e3,je=(O-D)/8,Me=(O-D)/100,Ne=.04,Pe=.0015;function Fe(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`),r=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,`rgba(255,255,255,1.0)`),r.addColorStop(.15,`rgba(255,255,255,0.95)`),r.addColorStop(.45,`rgba(230,235,255,0.45)`),r.addColorStop(.8,`rgba(220,215,255,0.12)`),r.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=r,t.fillRect(0,0,128,128);let i=new h(e);return i.colorSpace=n,i}var Ie=Fe();function Le(){let e=new Float32Array(N*3),t=new Float32Array(N),n=new Float32Array(N*3),r=new Float32Array(N);for(let i=0;i<N;i++){let a=Math.floor(Math.random()*8),o=D+a*je,s=(o+(o+je*1.5))/1.8,c=s+(Math.random()-.9)*.03,l=Math.random()*Math.PI*2,u=c*1*Math.cos(l),d=c*Math.sin(l),f=(Math.random()-.4)*.01;e[i*3+0]=u,e[i*3+1]=d,e[i*3+2]=f;let p=A[a%A.length];n[i*3+0]=p.r,n[i*3+1]=p.g,n[i*3+2]=p.b,t[i]=Math.random()*2,r[i]=Ne+(s-D)/Me*Pe}return{pos:e,sizes:t,colors:n,speeds:r}}var{pos:Re,sizes:ze,colors:Be,speeds:Ve}=Le(),P=new y;P.setAttribute(`position`,new v(Re,3)),P.setAttribute(`size`,new v(ze,1)),P.setAttribute(`color`,new v(Be,3)),P.setAttribute(`speed`,new v(Ve,1));var He=new _({uniforms:{uTime:{value:0},uSize:{value:.03},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uMap:{value:Ie},uOpacity:{value:1}},vertexShader:`
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float size;
  attribute float speed;

  varying vec3 vColor;

  void main() {
    vColor = color;

    // 파티클별 rings.js 속도로 Z 회전 (local, tilt 이전)
    float angle = uTime * speed;
    float c = cos(angle);
    float s = sin(angle);
    vec3 rotated = vec3(
      position.x * c - position.y * s,
      position.x * s + position.y * c,
      position.z
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
    gl_PointSize = size * uSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`,fragmentShader:`
  uniform sampler2D uMap;
  uniform float uOpacity;

  varying vec3 vColor;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(vColor * tex.rgb, tex.a * uOpacity);
  }
`,vertexColors:!0,transparent:!0,blending:2,depthWrite:!1,fog:!1}),F=new x(P,He);F.rotation.x=T,F.rotation.y=E;function Ue(){P.dispose(),He.dispose(),Ie.dispose()}var I=100,We=2,Ge=(We-D)/8,Ke=(We-D)/10,qe=.01,Je=1e-4,Ye=.35;function Xe(){let e=new Float32Array(I*3),t=new Float32Array(I),n=new Float32Array(I),r=new Float32Array(I),i=new Float32Array(I);for(let a=0;a<I;a++){let o=D+Math.floor(Math.random()*8)*Ge,s=(o+(o+Ge*1.5))/1.8,c=s+(Math.random()-.5)*.08,l=Math.random()*Math.PI*2,u=c*1*Math.cos(l),d=c*Math.sin(l),f=(Math.random()-.5)*.9;e[a*3+0]=u,e[a*3+1]=d,e[a*3+2]=f,t[a]=Math.random()<Ye?.05+Math.random()*.1:.02+Math.random()*.02;let p=Math.random(),m;m=p<.4?0:p<.65?1:p<.85?2:3,i[a]=m,r[a]=a,n[a]=qe+(s-D)/Ke*Je}return{pos:e,sizes:t,speeds:n,ids:r,colorIndices:i}}var{pos:Ze,sizes:Qe,speeds:$e,ids:et,colorIndices:tt}=Xe(),L=new y;L.setAttribute(`position`,new v(Ze,3)),L.setAttribute(`size`,new v(Qe,1)),L.setAttribute(`speed`,new v($e,1)),L.setAttribute(`pid`,new v(et,1)),L.setAttribute(`colorIndex`,new v(tt,1));var nt=new _({uniforms:{uTime:{value:0},uFade:{value:1},uSize:{value:2},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)}},vertexShader:`
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute float size;
  attribute float speed;
  attribute float pid;
  attribute float colorIndex;

  varying float vParticleID;
  varying float vColorIndex;
  varying float vSize;

  void main() {
    vParticleID = pid;
    vColorIndex = colorIndex;
    vSize = size;
    
    float individualFloat = sin(uTime * 0.5 + pid) * 0.1;
    float angle = uTime * speed;
    float c = cos(angle);
    float s = sin(angle);

    vec3 rotated = vec3(
      position.x * c - position.y * s,
      position.x * s + position.y * c,
      position.z + individualFloat
    );

    vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
    gl_PointSize = size * uSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`,fragmentShader:`
  uniform float uTime;
  uniform float uFade;

  varying float vParticleID;
  varying float vColorIndex;
  varying float vSize;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv) * 2.0;
    if (dist > 1.02) discard;

    // Anti-aliased circular edge
    float edgeAA = 1.0 - smoothstep(0.96, 1.02, dist);

    // --- Layer 1: Thin fresnel rim (glass shell) ---
    // A narrow bright band near the outer edge + a broad fresnel falloff
    float rim = smoothstep(0.78, 0.95, dist) * (1.0 - smoothstep(0.95, 1.02, dist));
    float fresnel = pow(dist, 3.0) * 0.35;

    // --- Layer 2: Swirling thin-film interference ---
    // Real bubbles show uneven, flowing rainbow bands (varying film thickness),
    // not concentric rings. Approximate with layered trig noise in polar space.
    float angle = atan(uv.y, uv.x);
    float swirl = dist * 4.0
                + sin(angle * 3.0 + vParticleID * 1.3 + uTime * 0.15) * 0.6
                + sin(angle * 5.0 - vParticleID * 0.7) * 0.35
                + cos(dist * 7.0 + angle * 2.0 + vParticleID) * 0.5;
    float phase = swirl + vParticleID * 1.7;

    vec3 iri;
    iri.r = cos(phase) * 0.5 + 0.5;
    iri.g = cos(phase + 2.094) * 0.5 + 0.5;
    iri.b = cos(phase + 4.189) * 0.5 + 0.5;

    // Per-particle base tint (step-decoded)
    vec3 baseColor = vec3(0.941, 0.922, 0.898); // #F0EBE5 champagne
    baseColor = mix(baseColor, vec3(0.910, 0.816, 0.835), step(0.5, vColorIndex)); // #E8D0D5 rose
    baseColor = mix(baseColor, vec3(0.835, 0.835, 0.910), step(1.5, vColorIndex)); // #D5D5E8 lavender
    baseColor = mix(baseColor, vec3(0.910, 0.863, 0.753), step(2.5, vColorIndex)); // #E8DCC0 gold

    vec3 filmColor = mix(baseColor, iri, 0.72);

    // --- Layer 3: Sharp specular + soft bloom (upper-right key light) ---
    vec2 specUV = gl_PointCoord - vec2(0.68, 0.28);
    float d2 = dot(specUV, specUV);
    float specCore = exp(-d2 * 260.0);          // tight hotspot
    float specBloom = exp(-d2 * 45.0) * 0.35;   // soft halo around it
    float specular = specCore + specBloom;

    // Secondary (lower-left environment bounce)
    vec2 spec2UV = gl_PointCoord - vec2(0.3, 0.72);
    float spec2 = exp(-dot(spec2UV, spec2UV) * 180.0) * 0.28;

    // --- Layer 4: Surface caustic — slow flowing thickness variation ---
    float caustic = 0.0;
    if (vSize > 0.06) {
      caustic = sin(gl_PointCoord.x * 18.0 + vParticleID + uTime * 0.3)
              * sin(gl_PointCoord.y * 14.0 + vParticleID * 0.7 + uTime * 0.2)
              * 0.12;
    }

    // --- Composition ---
    
    // The shell carries the iridescent color, strongest at the fresnel rim.
    float shellEnergy = rim * 1.0 + fresnel * 0.25;
    vec3 color = filmColor * shellEnergy
               + vec3(1.0, 0.98, 0.95) * specular
               + vec3(1.0) * spec2
               + filmColor * caustic;

    // Interior is nearly transparent — alpha is carried by rim + highlights.
    float alpha = (0.12 + rim * 0.85
                 + fresnel * 0.05
                 + specular * 0.95
                 + spec2 * 0.4
                 + abs(caustic) * 0.12)
                * edgeAA;

    // Gentle independent twinkle
    alpha *= 0.92 + 0.18 * sin(uTime * 1.2 + vParticleID * 3.0);

    gl_FragColor = vec4(color, alpha * uFade);
  }
`,transparent:!0,blending:1,depthWrite:!1,fog:!1}),R=new x(L,nt);R.rotation.x=T,R.rotation.y=E,R.renderOrder=500;function rt(){L.dispose(),nt.dispose()}var it=`/model/flower/1435963177547374592.glb`,at=120,ot=(O-D)/8,st=(O-D)/100,ct=.04,lt=.0015,ut=.02,dt=.05,ft=.05,pt=1.2,mt=.45,ht=new f;ht.setDecoderPath(`/draco/`);var gt=new oe;gt.setDRACOLoader(ht);function _t(e,t){e.traverse(e=>{!e.isMesh||!e.material||(Array.isArray(e.material)?e.material=e.material.map(e=>e.clone()):e.material=e.material.clone(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>{let n=e.color?e.color.clone():new g(16766693);e.color&&e.color.copy(n).lerp(t,mt),e.emissive.copy(t),e.map&&(e.emissiveMap=e.map),e.emissiveIntensity=pt,e.transparent=!0,e.depthWrite=!1,e.fog=!1,e.toneMapped=!0}))})}function vt(e){let t=new m().setFromObject(e).getSize(new c).length();return 1/Math.max(t,.001)}async function yt(){let e=(await gt.loadAsync(it)).scene,t=vt(e),n=new ee;for(let r=0;r<at;r++){let r=Math.floor(Math.random()*8),i=D+r*ot,a=(i+(i+ot*1.5))/1.8,o=a+(Math.random()-.5)*.05,s=Math.random()*Math.PI*2,c=(Math.random()-.5)*ft,l=e.clone(!0),u=A[r%A.length];_t(l,u),l.position.set(o,0,c);let d=(ut+Math.random()*(dt-ut))*t;l.scale.setScalar(d),l.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI*2,Math.random()*Math.PI*2);let f=new ee;f.add(l),f.rotation.z=s;let p=(a-D)/st;f.userData.speed=ct+p*lt,n.add(f)}return n.rotation.x=T,n.rotation.y=E,n.renderOrder=600,n}function bt(e){e.traverse(e=>{e.isMesh&&(e.geometry&&e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e&&e.dispose()))})}var z=320,xt=1.8,St=3.6,Ct=[16758213,16763350,16752560,16769252,16754844].map(e=>new g(e));function wt(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=new h(e);return t.colorSpace=n,t}var Tt=wt();function Et(){let e=new Float32Array(z*3),t=new Float32Array(z),n=new Float32Array(z*3);for(let r=0;r<z;r++){let i=xt+Math.random()*(St-xt),a=Math.random()<.78?Math.PI+Math.random()*Math.PI:Math.random()*Math.PI,o=i*Math.cos(a),s=i*Math.sin(a),c=(Math.random()-.5)*.5;e[r*3+0]=o,e[r*3+1]=s,e[r*3+2]=c;let l=Ct[Math.floor(Math.random()*Ct.length)];n[r*3+0]=l.r,n[r*3+1]=l.g,n[r*3+2]=l.b,t[r]=.5+Math.random()*2}return{pos:e,sizes:t,colors:n}}var{pos:Dt,sizes:Ot,colors:kt}=Et(),B=new y;B.setAttribute(`position`,new v(Dt,3)),B.setAttribute(`size`,new v(Ot,1)),B.setAttribute(`color`,new v(kt,3));var At=new u({size:.18,map:Tt,vertexColors:!0,transparent:!0,opacity:.85,blending:2,depthWrite:!1,fog:!1}),V=new x(B,At);V.rotation.x=T,V.rotation.y=E;function jt(){B.dispose(),At.dispose(),Tt.dispose()}function Mt(){let e=7e4,t=new y,n=new Float32Array(e*3),r=new Float32Array(e*3),i=[new g(`#ffffff`),new g(`#ffccff`),new g(`#ccffff`),new g(`#fff2cc`)];for(let t=0;t<e;t++){n[t*3+0]=(Math.random()-.5)*12,n[t*3+1]=(Math.random()-.5)*12,n[t*3+2]=(Math.random()-.5)*20-5;let e=i[Math.floor(Math.random()*i.length)];r[t*3+0]=e.r,r[t*3+1]=e.g,r[t*3+2]=e.b}return t.setAttribute(`position`,new v(n,3)),t.setAttribute(`color`,new v(r,3)),new x(t,new _({uniforms:{uTime:{value:0},uProgress:{value:0}},transparent:!0,blending:2,depthWrite:!1,vertexShader:`
      uniform float uTime;
      uniform float uProgress;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec3 p = position;
        
        // 정면 흐름
        p.z += uProgress * 25.0;
        p.z = mod(p.z + 10.0, 20.0) - 10.0;

        // [핵심] 통과 연출: 0.85 지점부터 입자들이 사방으로 터져나가며 시야를 비움 (더 snappy하게)
        if (uProgress > 0.85) {
          float burst = smoothstep(0.85, 1.0, uProgress);
          p.xy *= (1.0 + burst * 50.0);
          p.z -= burst * 20.0;
        }

        p.x += sin(uTime * 0.5 + position.z) * 0.1;
        p.y += cos(uTime * 0.5 + position.x) * 0.1;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.5 + sin(uTime * 2.0 + position.y)) * (25.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        // [핵심] 폭발 시작(0.85)과 함께 매우 빠르게 소멸하여 0.98에 완벽 제거
        vAlpha = smoothstep(0.0, 0.1, uProgress) * (1.0 - smoothstep(0.85, 0.98, uProgress));
      }
    `,fragmentShader:`
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float glow = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(vColor, glow * vAlpha * 0.8);
      }
    `}))}var Nt=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Pt=`
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = vUv * 3.0;
    float n = noise(p + uTime * 0.1);
    
    // Create soft rolling mist effect
    float alpha = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
    alpha *= (0.3 + 0.7 * sin(vUv.x * 10.0 + uTime * 0.5) * cos(vUv.y * 5.0 + uTime * 0.2));
    
    vec3 color = vec3(0.8, 0.9, 1.0); // Soft grey-teal mist
    gl_FragColor = vec4(color, alpha * uOpacity * 0.4);
  }
`,H=null;function Ft(){return H=new b(new l(30,10,1,1),new _({uniforms:{uTime:{value:0},uOpacity:{value:0}},vertexShader:Nt,fragmentShader:Pt,transparent:!0,depthWrite:!1,side:2})),H.rotation.x=-Math.PI/2.1,H.position.y=-.3,H.visible=!1,H}function It(e,t){if(!H)return;H.material.uniforms.uTime.value+=e;let n=Math.max(0,(t-.8)/.2);H.material.uniforms.uOpacity.value=n,H.visible=n>0}function Lt(){let e=5e3,t=new y,n=new Float32Array(e*3),r=new Float32Array(e*3),i=new Float32Array(e),a=[new g(`#ffffff`),new g(`#ffccff`),new g(`#ccffff`)];for(let t=0;t<e;t++){n[t*3+0]=(Math.random()-.5)*20,n[t*3+1]=Math.random()*2,n[t*3+2]=(Math.random()-.5)*20;let e=a[Math.floor(Math.random()*a.length)];r[t*3+0]=e.r,r[t*3+1]=e.g,r[t*3+2]=e.b,i[t]=Math.random()*Math.PI*2}return t.setAttribute(`position`,new v(n,3)),t.setAttribute(`color`,new v(r,3)),t.setAttribute(`aOffset`,new v(i,1)),new x(t,new _({uniforms:{uTime:{value:0},uOpacity:{value:0}},transparent:!0,blending:2,depthWrite:!1,vertexShader:`
      uniform float uTime;
      uniform float uOpacity;
      attribute vec3 color;
      attribute float aOffset;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vColor = color;
        vec3 p = position;
        
        // Gentle organic float (Brownian-ish)
        p.x += sin(uTime * 0.3 + aOffset) * 0.2;
        p.y += cos(uTime * 0.5 + aOffset) * 0.1;
        p.z += sin(uTime * 0.4 + aOffset) * 0.2;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + sin(uTime + aOffset)) * (20.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        vAlpha = uOpacity * (0.4 + 0.6 * sin(uTime * 0.5 + aOffset));
      }
    `,fragmentShader:`
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float glow = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `}))}function Rt(e,t,n){if(!e)return;e.material.uniforms.uTime.value+=t;let r=Math.max(0,(n-.9)/.1);e.material.uniforms.uOpacity.value=r,e.visible=r>0}var U=new ae(new o(window.innerWidth,window.innerHeight),1.5,.4,.85);U.threshold=.75,U.strength=.75,U.radius=.9;var W=new ne(S);W.addPass(new ce(C,w)),W.addPass(U);function zt(e,t){W.setSize(e,t),U.setSize(e,t)}function Bt(){W.dispose()}var G=null,Vt=!1,Ht={uTime:{value:0}};function Ut(e,t){let n=0;return n+=Math.sin(e*1.2+t*.8)*.5,n+=Math.sin(e*2.5-t*1.7+1.3)*.25,n+=Math.sin(e*5.1+t*4.3+2.7)*.125,n+=Math.sin(e*10.3-t*8.7+5.1)*.0625,n}function Wt(e){let t=document.createElement(`canvas`);t.width=e,t.height=e;let n=t.getContext(`2d`),i=n.createImageData(e,e);for(let t=0;t<e;t++)for(let n=0;n<e;n++){let r=(Ut(n/e*6,t/e*6)+1)*.5,a=Math.floor(r*255),o=(t*e+n)*4;i.data[o]=a,i.data[o+1]=a,i.data[o+2]=a,i.data[o+3]=255}n.putImageData(i,0,0);let a=new h(t);return a.wrapS=r,a.wrapT=r,a}var K=[[.85,.75,.8],[.8,.82,.88],[.85,.8,.72],[.78,.85,.82],[.82,.78,.85]];function Gt(e,t){let i=document.createElement(`canvas`);i.width=e,i.height=e;let a=i.getContext(`2d`),o=a.createImageData(e,e),s=t.image.getContext(`2d`).getImageData(0,0,e,e);for(let t=0;t<e;t++)for(let n=0;n<e;n++){let r=(t*e+n)*4,i=s.data[r]/255,a=K[Math.min(Math.floor(i*K.length),K.length-1)],c=Ut(n/e*12,t/e*12)*.05;o.data[r]=Math.floor(Math.max(0,Math.min(1,a[0]+c))*255),o.data[r+1]=Math.floor(Math.max(0,Math.min(1,a[1]+c))*255),o.data[r+2]=Math.floor(Math.max(0,Math.min(1,a[2]+c))*255),o.data[r+3]=255}a.putImageData(o,0,0);let c=new h(i);return c.colorSpace=n,c.wrapS=r,c.wrapT=r,c}function Kt(e){if(G)return G;let t=Wt(512),n=Gt(512,t),r=new l(20,20,256,256);r.rotateX(-Math.PI/2);let i=new p({map:n,displacementMap:t,displacementScale:.4,roughness:.5,metalness:0,iridescence:.6,iridescenceIOR:1.4,clearcoat:.2,emissive:new g(`#ffffff`),emissiveMap:n,emissiveIntensity:.35,side:2,fog:!0});return i.onBeforeCompile=e=>{e.uniforms.uTime=Ht.uTime,e.vertexShader=`
      uniform float uTime;
      ${e.vertexShader}
    `.replace(`#include <displacementmap_vertex>`,`
      #include <displacementmap_vertex>
      // [시니어 디테일] 더 정교하고 리얼한 복합 파동 연출
      float wave = sin(transformed.x * 1.2 + uTime * 0.4) * cos(transformed.z * 1.5 + uTime * 0.5) * 0.08;
      transformed.y += wave;
      `)},G=new b(r,i),G.visible=!1,G.position.y=-.5,e.add(G),G}function qt(e){Ht.uTime.value+=e}function Jt(){let e=new ee,n=new ie(`#ffffff`,.6);n.position.set(0,10,0),e.add(n);let r=[`#ffccff`,`#ccffff`,`#e8d6ff`],i=[[15,5,5],[-15,5,5],[0,5,15]];return r.forEach((n,r)=>{let a=new t(n,1.5,60);a.position.set(...i[r]),e.add(a)}),e}function Yt(){return G}function Xt(){!G||Vt||(Vt=!0,G.geometry.dispose(),G.material.map&&G.material.map.dispose(),G.material.displacementMap&&G.material.displacementMap.dispose(),G.material.dispose())}var q=new ue(w,S.domElement);q.enableDamping=!0,q.minDistance=1.1,q.maxDistance=12;var Zt=new c(0,0,0);function Qt(e){e===`landscape`?(q.target.set(0,.05,0),q.minDistance=.3,q.maxDistance=2,q.minPolarAngle=.2,q.maxPolarAngle=Math.PI/2-.05,q.zoomSpeed=.5):(q.target.copy(Zt),q.minDistance=1.1,q.maxDistance=12,q.minPolarAngle=0,q.maxPolarAngle=Math.PI,q.zoomSpeed=1),q.update()}var $t=1.8,en=1.15,tn=4,J=`ORBITAL`,nn=`TRANSITION_IN`,rn=`LANDSCAPE`,an=`TRANSITION_OUT`,on=J,sn=0,Y=0,X={rings:[],planet:0,petals:0,glitterOpacity:0,starsOpacity:0},cn=!1,Z=null;function ln(e,t,n){return Math.max(0,Math.min(1,(n-e)/(t-e)))}function Q(e,t,n){return Math.max(0,Math.min(1,(e-t)/(n-t)))}function un(){return on}function dn(){return Y}function fn(e,t,n){Z||={bgColor:e.background.clone(),fogNear:e.fog.near,fogFar:e.fog.far,bloomStrength:t.strength,ambientIntensity:n.intensity}}var pn=new g(`#5a8a9a`),mn=8,hn=50,gn=.2,_n=4.5;function vn(e,t){sn=1-ln(en,$t,e),Y=d.damp(Y,sn,tn,t),Y<.001&&(Y=0),Y>.999&&(Y=1),on=Y===0?J:Y===1?rn:sn>Y?nn:an}function yn(e,t,n,r,i,a,o){cn||(cn=!0,X.planet=e.material.opacity,X.petals=o.material.opacity,X.glitterOpacity=r.material.uniforms.uOpacity.value,X.starsOpacity=n.material.uniforms.uOpacity.value,t.forEach(e=>{X.rings.push(e.material.opacity)}))}function bn(e,t,n,r,i,a,o){let s=Y;if(s===0){e.material.opacity=X.planet,e.visible=!0,o.material.opacity=X.petals,o.visible=!0,r.material.uniforms.uOpacity.value=X.glitterOpacity,r.visible=!0,n.material.uniforms.uOpacity.value=X.starsOpacity,n.visible=!0,i.material.uniforms.uFade.value=1,i.visible=!0,a.visible=!0,a.traverse(e=>{e.isMesh&&e.material&&(e.material.opacity=1)}),t.forEach((e,t)=>{e.material.opacity=X.rings[t],e.visible=!0});return}let c=1-Q(s,0,.4),l=1-Q(s,0,.6),u=1-Q(s,0,.6),d=1-Q(s,0,.5),f=1-Q(s,0,.6),p=1-Q(s,0,.6),m=1-Q(s,.5,.6);n.material.uniforms.uOpacity.value=X.starsOpacity*c,n.visible=c>0,t.forEach((e,t)=>{e.material.opacity=X.rings[t]*l,e.visible=l>0}),r.material.uniforms.uOpacity.value=X.glitterOpacity*u,r.visible=u>0,i.material.uniforms.uFade.value=d,i.visible=d>0,a.visible=f>0,a.visible&&a.traverse(e=>{e.isMesh&&e.material&&(e.material.opacity=f)}),o.material.opacity=X.petals*p,o.visible=p>0,e.material.opacity=X.planet*m,e.visible=m>0}function xn(e,t,n){if(!Z||Y===0)return;let r=Y;e.background.copy(Z.bgColor).lerp(pn,r),e.fog.near=d.lerp(Z.fogNear,mn,r),e.fog.far=d.lerp(Z.fogFar,hn,r);let i=r**6*15,a=d.smoothstep(r,.9,1);t.strength=d.lerp(Z.bloomStrength,gn,r)+i*(1-a),n.intensity=d.lerp(Z.ambientIntensity,_n,r)}function Sn(e,t,n){Z&&(e.background.copy(Z.bgColor),e.fog.near=Z.fogNear,e.fog.far=Z.fogFar,t.strength=Z.bloomStrength,n.intensity=Z.ambientIntensity)}var Cn=document.getElementById(`loader`),wn=document.getElementById(`title-group`),Tn=document.getElementById(`hint-text`),En=document.getElementById(`landscape-hint`);function Dn(){Cn.classList.add(`hidden`),requestAnimationFrame(()=>{wn.classList.add(`visible`)}),setTimeout(()=>{Tn.classList.add(`dismissed`)},5e3)}function On(e){e>.05?wn.classList.add(`fading`):wn.classList.remove(`fading`),e>.95?En.classList.add(`visible`):En.classList.remove(`visible`)}var kn=performance.now(),An=.3,jn=.03,Mn=.3,Nn=.006,$=null;C.traverse(e=>{e.isAmbientLight&&!$&&($=e)});var Pn=J,Fn=!1;function In(e,t,n,r,i,a,o,s,c,l,u){yn(e,t,n,r,i,a,o),fn(C,U,$);function f(){if(requestAnimationFrame(f),document.hidden){kn=performance.now();return}let p=performance.now(),m=Math.min((p-kn)/1e3,.05);kn=p,vn(w.position.distanceTo(q.target),m);let h=un(),g=dn();if(g>0){Fn||=(Kt(C),!0),bn(e,t,n,r,i,a,o);let s=Yt();if(s){let e=d.smoothstep(g,.9,1);s.visible=e>0,s.material.opacity=e,s.material.transparent=e<1,u&&(u.visible=e>0,u.children.forEach((t,n)=>{t.isDirectionalLight&&(t.intensity=.6*e),t.isPointLight&&(t.intensity=1.5*e)}))}xn(C,U,$),It(m,g),Rt(l,m,g)}else{bn(e,t,n,r,i,a,o),Sn(C,U,$);let s=Yt();s&&(s.visible=!1),c&&(c.visible=!1),l&&(l.visible=!1),u&&(u.visible=!1)}On(g),h===`LANDSCAPE`&&Pn!==`LANDSCAPE`?Qt(`landscape`):h===`ORBITAL`&&Pn!==`ORBITAL`&&Qt(`orbital`),Pn=h,h===`LANDSCAPE`?(s&&(s.visible=!1),qt(m),It(m,g),Rt(l,m,g)):(e.rotation.y+=An*m,n.rotation.y+=jn*m,r.material.uniforms.uTime.value+=m,i.material.uniforms.uTime.value+=m,a.children.forEach(e=>{e.rotation.z+=e.userData.speed*m}),t.forEach((e,t)=>{let n=Mn+t*Nn;e.rotation.z+=n*m}),s&&(g>0&&g<.99?(s.visible=!0,s.material.uniforms.uTime.value+=m,s.material.uniforms.uProgress.value=g):s.visible=!1)),q.update(),W.render()}requestAnimationFrame(f)}var Ln=_e(await ge()),Rn=Se(),zn=await yt(),Bn=Mt(),Vn=Ft(),Hn=Lt(),Un=Jt();C.add(Ln,...Rn,ke,F,R,zn,V,Bn,Vn,Hn,Un);function Wn(){let e=window.innerWidth,t=window.innerHeight;w.aspect=e/t,w.updateProjectionMatrix(),S.setSize(e,t),zt(e,t)}window.addEventListener(`resize`,Wn),window.addEventListener(`beforeunload`,()=>{Ce(Rn),ve(Ln),Ae(),Ue(),rt(),bt(zn),jt(),Xt(),Bt(),q.dispose()}),Dn(),In(Ln,Rn,ke,F,R,zn,V,Bn,Vn,Hn,Un);