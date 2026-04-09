<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Iridescent Planet Scene</title>
    <style>
        body { margin: 0; background-color: #000; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>

<script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
    }
</script>

<script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

    // 1. 기본 씬 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#001a1a'); // 깊은 청록색 배경

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);

    // 2. 조명 설정 (이미지의 색감을 살리기 위해 핑크와 블루 조명 배치)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 10); // 핑크 조명
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 10); // 민트/블루 조명
    pointLight2.position.set(-2, -2, 2);
    scene.add(pointLight2);

    // 3. 행성 본체 (이리데슨트 재질)
    const planetGeo = new THREE.IcosahedronGeometry(1, 15);
    const planetMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.6,    // 반투명한 젤리/유리 느낌
        thickness: 0.5,
        iridescence: 1.0,     // 무지개 빛깔 효과 핵심
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        ior: 1.5,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planet);

    // 4. 행성 고리 (여러 겹으로 구성)
    const createRing = (inner, outer, color) => {
        const ringGeo = new THREE.RingGeometry(inner, outer, 64);
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4,
            iridescence: 0.8,
            transmission: 0.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        return ring;
    };

    const ring1 = createRing(1.4, 1.45, 0xffccff);
    const ring2 = createRing(1.5, 1.8, 0xccffff);
    scene.add(ring1, ring2);

    // 5. 배경 파티클 (스타더스트)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1000;
    const posArray = new Float32Array(starCount * 3);

    for(let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 6. 포스트 프로세싱 (Bloom 효과 - 이미지의 발광 느낌 재현)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.2; // 빛나는 강도
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 컨트롤러
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 7. 애니메이션 루프
    function animate() {
        requestAnimationFrame(animate);
        
        planet.rotation.y += 0.005;
        ring1.rotation.z += 0.002;
        ring2.rotation.z -= 0.001;
        stars.rotation.y += 0.0005;

        controls.update();
        composer.render(); // renderer.render 대신 composer 사용
    }

    animate();

    // 창 크기 조절 대응
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
</script>
</body>
</html>