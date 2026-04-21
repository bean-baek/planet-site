import{A as e,C as t,D as n,E as r,F as i,M as a,N as o,O as s,P as c,S as l,T as u,_ as d,a as f,b as p,c as m,d as h,f as g,g as ee,h as te,i as ne,j as re,k as _,l as v,m as ie,n as ae,o as oe,p as se,r as ce,s as le,t as ue,u as y,v as de,w as b,x as fe,y as pe}from"./three-D9o3Lz3I.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var x=new i({canvas:document.getElementById(`bg`),antialias:!0,alpha:!0,powerPreference:`high-performance`});x.setSize(window.innerWidth,window.innerHeight),x.setPixelRatio(Math.min(window.devicePixelRatio,2)),x.toneMapping=7,x.toneMappingExposure=.9,x.outputColorSpace=n;var S=new s,me=new g(`#355865`);S.background=me,S.fog=new te(me,4,14);var C=new l(38,window.innerWidth/window.innerHeight,.1,1e3);C.position.set(0,.4,5),C.lookAt(0,0,0);var he=new le(`#ffffff`,2);S.add(he);var ge=new ie(15259391,1);ge.position.set(5,5,5),S.add(ge);function _e(){return new Promise((e,t)=>{let r=new re,i={},a=0,o=[[`/ring.png`,`ringTexture`,!0],[`/model/sphere/sphere-albedo.webp`,`sphereAlbedo`,!0],[`/model/sphere/sphere-normal.webp`,`sphereNormal`,!1],[`/model/sphere/sphere-roughness.webp`,`sphereRoughness`,!1]],s=o.length,c=(t,r)=>o=>{r&&(o.colorSpace=n),i[t]=o,a++,a===s&&e(i)};o.forEach(([e,n,i])=>r.load(e,c(n,i),void 0,t))})}function ve({sphereAlbedo:t,sphereNormal:n,sphereRoughness:r}){return new de(new e(1,64,64),new p({map:t,normalMap:n,normalScale:new o(.08,.08),roughnessMap:r,roughness:.55,metalness:.1,transparent:!0,opacity:.95,transmission:.15,iridescence:1,iridescenceIOR:1.3,iridescenceThicknessRange:[100,800]}))}function ye(e){e.geometry.dispose(),e.material.map&&e.material.map.dispose(),e.material.normalMap&&e.material.normalMap.dispose(),e.material.roughnessMap&&e.material.roughnessMap.dispose(),e.material.dispose()}var w=Math.PI/2+.2,T=Math.PI+.2;function be(e){e.rotation.x=w,e.rotation.y=T}var E=1.2,D=2.3,O=[16770280,16766693,16771286,16774614,15259391,14083839,14090226,15267583],k=O.map(e=>new g(e)),xe=class extends se{constructor(e,t,n){super(),this.rx=e,this.ry=t,this.rAmp=.015+Math.random()*.03,this.rFreq=3+Math.floor(Math.random()*1.3),this.zAmp=.01+Math.random()*.04,this.zFreq=2+Math.floor(Math.random()*1.5),this.phase=n*Math.PI*1.2}getPoint(e){let t=e*Math.PI*2,n=1+this.rAmp*Math.sin(t*this.rFreq+this.phase),r=this.zAmp*Math.sin(t*this.zFreq+this.phase*.3);return new c(this.rx*n*Math.cos(t),this.ry*n*Math.sin(t),r)}};function Se(e,t,n,r,i){let o=(e+t)/1.8,s=(t-e)*(.03+Math.random()*.2),c=new de(new a(new xe(o*1,o,i),256,s,8,!0),new pe({color:n,transparent:!0,opacity:r,blending:2,depthWrite:!1,fog:!1}));return be(c),c}function Ce(){let e=[],t=(D-E)/100;for(let n=0;n<100;n++){let r=E+n*t,i=r+t*1.5,a=O[n%O.length],o=n%4==0,s=Se(r,i,a,o?.21:.12,n/100);s.renderOrder=o?100+n:n,e.push(s)}return e}function we(e){(Array.isArray(e)?e:e.children||[]).forEach(e=>{e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}var A=1200,j=new Float32Array(A*3),Te=new Float32Array(A);for(let e=0;e<A;e++){let t=6+Math.random()*8,n=Math.random()*Math.PI*2,r=Math.acos(2*Math.random()-1);j[e*3+0]=t*Math.sin(r)*Math.cos(n),j[e*3+1]=t*Math.sin(r)*Math.sin(n),j[e*3+2]=t*Math.cos(r),Te[e]=.3+Math.random()*1.4}function Ee(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`),r=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,`rgba(255,255,255,1.0)`),r.addColorStop(.2,`rgba(255,255,255,0.9)`),r.addColorStop(.5,`rgba(240,240,255,0.35)`),r.addColorStop(.85,`rgba(220,220,255,0.08)`),r.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=r,t.fillRect(0,0,128,128);let i=new h(e);return i.colorSpace=n,i}var De=Ee(),M=new y;M.setAttribute(`position`,new v(j,3)),M.setAttribute(`size`,new v(Te,1));var Oe=new _({uniforms:{uSize:{value:.04},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uMap:{value:De},uColor:{value:new g(16773590)},uOpacity:{value:.9}},vertexShader:`
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
`,transparent:!0,blending:2,depthWrite:!1,fog:!1}),ke=new b(M,Oe);function Ae(){M.dispose(),Oe.dispose(),De.dispose()}var N=5e3,je=(D-E)/8,Me=(D-E)/100,Ne=.04,Pe=.0015;function Fe(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`),r=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);r.addColorStop(0,`rgba(255,255,255,1.0)`),r.addColorStop(.15,`rgba(255,255,255,0.95)`),r.addColorStop(.45,`rgba(230,235,255,0.45)`),r.addColorStop(.8,`rgba(220,215,255,0.12)`),r.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=r,t.fillRect(0,0,128,128);let i=new h(e);return i.colorSpace=n,i}var Ie=Fe();function Le(){let e=new Float32Array(N*3),t=new Float32Array(N),n=new Float32Array(N*3),r=new Float32Array(N);for(let i=0;i<N;i++){let a=Math.floor(Math.random()*8),o=E+a*je,s=(o+(o+je*1.5))/1.8,c=s+(Math.random()-.9)*.03,l=Math.random()*Math.PI*2,u=c*1*Math.cos(l),d=c*Math.sin(l),f=(Math.random()-.4)*.01;e[i*3+0]=u,e[i*3+1]=d,e[i*3+2]=f;let p=k[a%k.length];n[i*3+0]=p.r,n[i*3+1]=p.g,n[i*3+2]=p.b,t[i]=Math.random()*2,r[i]=Ne+(s-E)/Me*Pe}return{pos:e,sizes:t,colors:n,speeds:r}}var{pos:Re,sizes:ze,colors:Be,speeds:Ve}=Le(),P=new y;P.setAttribute(`position`,new v(Re,3)),P.setAttribute(`size`,new v(ze,1)),P.setAttribute(`color`,new v(Be,3)),P.setAttribute(`speed`,new v(Ve,1));var He=new _({uniforms:{uTime:{value:0},uSize:{value:.03},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uMap:{value:Ie},uOpacity:{value:1}},vertexShader:`
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
`,vertexColors:!0,transparent:!0,blending:2,depthWrite:!1,fog:!1}),F=new b(P,He);F.rotation.x=w,F.rotation.y=T;function Ue(){P.dispose(),He.dispose(),Ie.dispose()}var I=100,We=2,Ge=(We-E)/8,Ke=(We-E)/10,qe=.01,Je=1e-4,Ye=.35;function Xe(){let e=new Float32Array(I*3),t=new Float32Array(I),n=new Float32Array(I),r=new Float32Array(I),i=new Float32Array(I);for(let a=0;a<I;a++){let o=E+Math.floor(Math.random()*8)*Ge,s=(o+(o+Ge*1.5))/1.8,c=s+(Math.random()-.5)*.08,l=Math.random()*Math.PI*2,u=c*1*Math.cos(l),d=c*Math.sin(l),f=(Math.random()-.5)*.9;e[a*3+0]=u,e[a*3+1]=d,e[a*3+2]=f,t[a]=Math.random()<Ye?.05+Math.random()*.1:.02+Math.random()*.02;let p=Math.random(),m;m=p<.4?0:p<.65?1:p<.85?2:3,i[a]=m,r[a]=a,n[a]=qe+(s-E)/Ke*Je}return{pos:e,sizes:t,speeds:n,ids:r,colorIndices:i}}var{pos:Ze,sizes:Qe,speeds:$e,ids:et,colorIndices:tt}=Xe(),L=new y;L.setAttribute(`position`,new v(Ze,3)),L.setAttribute(`size`,new v(Qe,1)),L.setAttribute(`speed`,new v($e,1)),L.setAttribute(`pid`,new v(et,1)),L.setAttribute(`colorIndex`,new v(tt,1));var nt=new _({uniforms:{uTime:{value:0},uFade:{value:1},uSize:{value:2},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)}},vertexShader:`
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
`,transparent:!0,blending:1,depthWrite:!1,fog:!1}),R=new b(L,nt);R.rotation.x=w,R.rotation.y=T,R.renderOrder=500;function rt(){L.dispose(),nt.dispose()}var it=`/model/flower/1435963177547374592.glb`,at=120,ot=(D-E)/8,st=(D-E)/100,ct=.04,lt=.0015,ut=.02,dt=.05,ft=.05,pt=1.2,mt=.45,ht=new f;ht.setDecoderPath(`/draco/`);var gt=new oe;gt.setDRACOLoader(ht);function _t(e,t){e.traverse(e=>{!e.isMesh||!e.material||(Array.isArray(e.material)?e.material=e.material.map(e=>e.clone()):e.material=e.material.clone(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>{let n=e.color?e.color.clone():new g(16766693);e.color&&e.color.copy(n).lerp(t,mt),e.emissive.copy(t),e.map&&(e.emissiveMap=e.map),e.emissiveIntensity=pt,e.transparent=!0,e.depthWrite=!1,e.fog=!1,e.toneMapped=!0}))})}function vt(e){let t=new m().setFromObject(e).getSize(new c).length();return 1/Math.max(t,.001)}async function yt(){let e=(await gt.loadAsync(it)).scene,t=vt(e),n=new ee;for(let r=0;r<at;r++){let r=Math.floor(Math.random()*8),i=E+r*ot,a=(i+(i+ot*1.5))/1.8,o=a+(Math.random()-.5)*.05,s=Math.random()*Math.PI*2,c=(Math.random()-.5)*ft,l=e.clone(!0),u=k[r%k.length];_t(l,u),l.position.set(o,0,c);let d=(ut+Math.random()*(dt-ut))*t;l.scale.setScalar(d),l.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI*2,Math.random()*Math.PI*2);let f=new ee;f.add(l),f.rotation.z=s;let p=(a-E)/st;f.userData.speed=ct+p*lt,n.add(f)}return n.rotation.x=w,n.rotation.y=T,n.renderOrder=600,n}function bt(e){e.traverse(e=>{e.isMesh&&(e.geometry&&e.geometry.dispose(),(Array.isArray(e.material)?e.material:[e.material]).forEach(e=>e&&e.dispose()))})}var z=320,xt=1.8,St=3.6,Ct=[16758213,16763350,16752560,16769252,16754844].map(e=>new g(e));function wt(){let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=new h(e);return t.colorSpace=n,t}var Tt=wt();function Et(){let e=new Float32Array(z*3),t=new Float32Array(z),n=new Float32Array(z*3);for(let r=0;r<z;r++){let i=xt+Math.random()*(St-xt),a=Math.random()<.78?Math.PI+Math.random()*Math.PI:Math.random()*Math.PI,o=i*Math.cos(a),s=i*Math.sin(a),c=(Math.random()-.5)*.5;e[r*3+0]=o,e[r*3+1]=s,e[r*3+2]=c;let l=Ct[Math.floor(Math.random()*Ct.length)];n[r*3+0]=l.r,n[r*3+1]=l.g,n[r*3+2]=l.b,t[r]=.5+Math.random()*2}return{pos:e,sizes:t,colors:n}}var{pos:Dt,sizes:Ot,colors:kt}=Et(),B=new y;B.setAttribute(`position`,new v(Dt,3)),B.setAttribute(`size`,new v(Ot,1)),B.setAttribute(`color`,new v(kt,3));var At=new u({size:.18,map:Tt,vertexColors:!0,transparent:!0,opacity:.85,blending:2,depthWrite:!1,fog:!1}),V=new b(B,At);V.rotation.x=w,V.rotation.y=T;function jt(){B.dispose(),At.dispose(),Tt.dispose()}function Mt(){let e=7e4,t=new y,n=new Float32Array(e*3),r=new Float32Array(e*3),i=[new g(`#ffffff`),new g(`#ffccff`),new g(`#ccffff`),new g(`#fff2cc`)];for(let t=0;t<e;t++){n[t*3+0]=(Math.random()-.5)*12,n[t*3+1]=(Math.random()-.5)*12,n[t*3+2]=(Math.random()-.5)*20-5;let e=i[Math.floor(Math.random()*i.length)];r[t*3+0]=e.r,r[t*3+1]=e.g,r[t*3+2]=e.b}return t.setAttribute(`position`,new v(n,3)),t.setAttribute(`color`,new v(r,3)),new b(t,new _({uniforms:{uTime:{value:0},uProgress:{value:0}},transparent:!0,blending:2,depthWrite:!1,vertexShader:`
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
    `}))}var H=new ae(new o(window.innerWidth,window.innerHeight),1.5,.4,.85);H.threshold=.75,H.strength=.75,H.radius=.9;var U=new ne(x);U.addPass(new ce(S,C)),U.addPass(H);function Nt(e,t){U.setSize(e,t),H.setSize(e,t)}function Pt(){U.dispose()}var W=null,Ft=!1;function It(e,t){let n=0;return n+=Math.sin(e*1.2+t*.8)*.5,n+=Math.sin(e*2.5-t*1.7+1.3)*.25,n+=Math.sin(e*5.1+t*4.3+2.7)*.125,n+=Math.sin(e*10.3-t*8.7+5.1)*.0625,n}function Lt(e){let t=document.createElement(`canvas`);t.width=e,t.height=e;let n=t.getContext(`2d`),i=n.createImageData(e,e);for(let t=0;t<e;t++)for(let n=0;n<e;n++){let r=(It(n/e*6,t/e*6)+1)*.5,a=Math.floor(r*255),o=(t*e+n)*4;i.data[o]=a,i.data[o+1]=a,i.data[o+2]=a,i.data[o+3]=255}n.putImageData(i,0,0);let a=new h(t);return a.wrapS=r,a.wrapT=r,a}var G=[[.85,.75,.8],[.8,.82,.88],[.85,.8,.72],[.78,.85,.82],[.82,.78,.85]];function Rt(e,t){let i=document.createElement(`canvas`);i.width=e,i.height=e;let a=i.getContext(`2d`),o=a.createImageData(e,e),s=t.image.getContext(`2d`).getImageData(0,0,e,e);for(let t=0;t<e;t++)for(let n=0;n<e;n++){let r=(t*e+n)*4,i=s.data[r]/255,a=G[Math.min(Math.floor(i*G.length),G.length-1)],c=It(n/e*12,t/e*12)*.05;o.data[r]=Math.floor(Math.max(0,Math.min(1,a[0]+c))*255),o.data[r+1]=Math.floor(Math.max(0,Math.min(1,a[1]+c))*255),o.data[r+2]=Math.floor(Math.max(0,Math.min(1,a[2]+c))*255),o.data[r+3]=255}a.putImageData(o,0,0);let c=new h(i);return c.colorSpace=n,c.wrapS=r,c.wrapT=r,c}function zt(e){if(W)return W;let n=Lt(512),r=Rt(512,n),i=new t(20,20,256,256);return i.rotateX(-Math.PI/2),W=new de(i,new fe({map:r,displacementMap:n,displacementScale:.8,roughness:.85,metalness:.05,side:2,fog:!0})),W.visible=!1,W.position.y=-.5,e.add(W),W}function Bt(){return W}function Vt(){!W||Ft||(Ft=!0,W.geometry.dispose(),W.material.map&&W.material.map.dispose(),W.material.displacementMap&&W.material.displacementMap.dispose(),W.material.dispose())}var K=new ue(C,x.domElement);K.enableDamping=!0,K.minDistance=1.1,K.maxDistance=12;var Ht=new c(0,0,0);function Ut(e){if(e===`landscape`){K.target.set(0,.05,0);let e=C.position.distanceTo(K.target);C.position.set(0,.05,e),K.minDistance=e,K.maxDistance=e,K.minPolarAngle=.2,K.maxPolarAngle=Math.PI/2-.05}else{K.target.copy(Ht);let e=C.position.distanceTo(Ht);C.position.set(0,.4,e),K.minDistance=e,K.maxDistance=e,K.minPolarAngle=0,K.maxPolarAngle=Math.PI}K.update()}var Wt=1.8,Gt=1.15,Kt=4,q=`ORBITAL`,qt=`TRANSITION_IN`,Jt=`LANDSCAPE`,Yt=`TRANSITION_OUT`,Xt=q,J=0,Y=0,X={rings:[],planet:0,petals:0,glitterOpacity:0,starsOpacity:0},Zt=!1,Z=null;function Qt(e,t,n){return Math.max(0,Math.min(1,(n-e)/(t-e)))}function Q(e,t,n){return Math.max(0,Math.min(1,(e-t)/(n-t)))}function $t(){return Xt}function en(){return Y}function tn(e,t,n){Z||={bgColor:e.background.clone(),fogNear:e.fog.near,fogFar:e.fog.far,bloomStrength:t.strength,ambientIntensity:n.intensity}}var nn=new g(`#5a8a9a`),rn=8,an=50,on=.2,sn=3;function cn(e,t){J=1-Qt(Gt,Wt,e),Y=d.damp(Y,J,Kt,t),Y<.001&&(Y=0),Y>.999&&(Y=1),Xt=Y===0?q:Y===1?Jt:J>Y?qt:Yt}function ln(e,t,n,r,i,a,o){Zt||(Zt=!0,X.planet=e.material.opacity,X.petals=o.material.opacity,X.glitterOpacity=r.material.uniforms.uOpacity.value,X.starsOpacity=n.material.uniforms.uOpacity.value,t.forEach(e=>{X.rings.push(e.material.opacity)}))}function un(e,t,n,r,i,a,o){let s=Y;if(s===0){e.material.opacity=X.planet,e.visible=!0,o.material.opacity=X.petals,o.visible=!0,r.material.uniforms.uOpacity.value=X.glitterOpacity,r.visible=!0,n.material.uniforms.uOpacity.value=X.starsOpacity,n.visible=!0,i.material.uniforms.uFade.value=1,i.visible=!0,a.visible=!0,a.traverse(e=>{e.isMesh&&e.material&&(e.material.opacity=1)}),t.forEach((e,t)=>{e.material.opacity=X.rings[t],e.visible=!0});return}let c=1-Q(s,0,.4),l=1-Q(s,0,.6),u=1-Q(s,0,.6),d=1-Q(s,0,.5),f=1-Q(s,0,.6),p=1-Q(s,0,.6),m=1-Q(s,.5,.6);n.material.uniforms.uOpacity.value=X.starsOpacity*c,n.visible=c>0,t.forEach((e,t)=>{e.material.opacity=X.rings[t]*l,e.visible=l>0}),r.material.uniforms.uOpacity.value=X.glitterOpacity*u,r.visible=u>0,i.material.uniforms.uFade.value=d,i.visible=d>0,a.visible=f>0,a.visible&&a.traverse(e=>{e.isMesh&&e.material&&(e.material.opacity=f)}),o.material.opacity=X.petals*p,o.visible=p>0,e.material.opacity=X.planet*m,e.visible=m>0}function dn(e,t,n){if(!Z||Y===0)return;let r=Y;e.background.copy(Z.bgColor).lerp(nn,r),e.fog.near=d.lerp(Z.fogNear,rn,r),e.fog.far=d.lerp(Z.fogFar,an,r);let i=r**6*15,a=d.smoothstep(r,.9,1);t.strength=d.lerp(Z.bloomStrength,on,r)+i*(1-a),n.intensity=d.lerp(Z.ambientIntensity,sn,r)}function fn(e,t,n){Z&&(e.background.copy(Z.bgColor),e.fog.near=Z.fogNear,e.fog.far=Z.fogFar,t.strength=Z.bloomStrength,n.intensity=Z.ambientIntensity)}var pn=document.getElementById(`loader`),mn=document.getElementById(`title-group`),hn=document.getElementById(`hint-text`),gn=document.getElementById(`landscape-hint`);function _n(){pn.classList.add(`hidden`),requestAnimationFrame(()=>{mn.classList.add(`visible`)}),setTimeout(()=>{hn.classList.add(`dismissed`)},5e3)}function vn(e){e>.05?mn.classList.add(`fading`):mn.classList.remove(`fading`),e>.95?gn.classList.add(`visible`):gn.classList.remove(`visible`)}var yn=performance.now(),bn=.3,xn=.03,Sn=.3,Cn=.006,$=null;S.traverse(e=>{e.isAmbientLight&&!$&&($=e)});var wn=q,Tn=!1;function En(e,t,n,r,i,a,o,s){ln(e,t,n,r,i,a,o),tn(S,H,$);function c(){if(requestAnimationFrame(c),document.hidden){yn=performance.now();return}let l=performance.now(),u=Math.min((l-yn)/1e3,.05);yn=l,cn(C.position.distanceTo(K.target),u);let f=$t(),p=en();if(p>0){Tn||=(zt(S),!0),un(e,t,n,r,i,a,o);let s=Bt();if(s){let e=d.smoothstep(p,.9,1);s.visible=e>0,s.material.opacity=e,s.material.transparent=e<1}dn(S,H,$)}else{un(e,t,n,r,i,a,o),fn(S,H,$);let s=Bt();s&&(s.visible=!1)}vn(p),f===`LANDSCAPE`&&wn!==`LANDSCAPE`?Ut(`landscape`):f===`ORBITAL`&&wn!==`ORBITAL`&&Ut(`orbital`),wn=f,f===`LANDSCAPE`?s&&(s.visible=!1):(e.rotation.y+=bn*u,n.rotation.y+=xn*u,r.material.uniforms.uTime.value+=u,i.material.uniforms.uTime.value+=u,a.children.forEach(e=>{e.rotation.z+=e.userData.speed*u}),t.forEach((e,t)=>{let n=Sn+t*Cn;e.rotation.z+=n*u}),s&&(p>0&&p<.99?(s.visible=!0,s.material.uniforms.uTime.value+=u,s.material.uniforms.uProgress.value=p):s.visible=!1)),K.update(),U.render()}requestAnimationFrame(c)}var Dn=ve(await _e()),On=Ce(),kn=await yt(),An=Mt();S.add(Dn,...On,ke,F,R,kn,V,An);function jn(){let e=window.innerWidth,t=window.innerHeight;C.aspect=e/t,C.updateProjectionMatrix(),x.setSize(e,t),Nt(e,t)}window.addEventListener(`resize`,jn),window.addEventListener(`beforeunload`,()=>{we(On),ye(Dn),Ae(),Ue(),rt(),bt(kn),jt(),Vt(),Pt(),K.dispose()}),_n(),En(Dn,On,ke,F,R,kn,V,An);