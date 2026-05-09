// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
function animRing() {
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
}
animRing();

// BACKGROUND THREE.JS
(function () {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 200;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x00f5ff, size: 0.15, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Floating wireframe objects
    const objs = [];
    const geos = [
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(1.2, 0),
        new THREE.TetrahedronGeometry(1.2, 0),
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
    ];
    for (let i = 0; i < 8; i++) {
        const geo = geos[i % geos.length];
        const mat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.08 + Math.random() * 0.06 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20 - 10);
        mesh.userData = { rx: Math.random() * 0.003, ry: Math.random() * 0.003 };
        scene.add(mesh);
        objs.push(mesh);
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => { mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5; mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3; });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        objs.forEach(o => { o.rotation.x += o.userData.rx; o.rotation.y += o.userData.ry; });
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();
})();

// HERO 3D
(function () {
    const container = document.getElementById('hero-3d');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Main icosahedron
    const geo = new THREE.IcosahedronGeometry(1.6, 1);
    const mat = new THREE.MeshPhongMaterial({
        color: 0x00f5ff, emissive: 0x003344, wireframe: false,
        transparent: true, opacity: 0.85, shininess: 100
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.3 });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    scene.add(wireMesh);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.2, 0.015, 8, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff2d78, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = 0.8; ring2.rotation.y = 0.3;
    scene.add(ring2);

    // Orbiting spheres
    const sphGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const spheres = [];
    const colors = [0x00f5ff, 0x7b2fff, 0xff2d78, 0xffffff];
    for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(sphGeo, new THREE.MeshBasicMaterial({ color: colors[i] }));
        scene.add(s);
        spheres.push({ mesh: s, angle: i * Math.PI * 0.5, radius: 2.5 + i * 0.2, speed: 0.01 + i * 0.003 });
    }

    // Lights
    scene.add(new THREE.AmbientLight(0x001133, 2));
    const pLight = new THREE.PointLight(0x00f5ff, 3, 20);
    pLight.position.set(3, 3, 3);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(0x7b2fff, 2, 20);
    pLight2.position.set(-3, -2, 2);
    scene.add(pLight2);

    let t = 0, mx = 0, my = 0;
    container.addEventListener('mousemove', e => {
        const r = container.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width * 2 - 1;
        my = -((e.clientY - r.top) / r.height * 2 - 1);
    });

    function animate() {
        requestAnimationFrame(animate);
        t += 0.01;
        mesh.rotation.x = t * 0.4 + my * 0.3;
        mesh.rotation.y = t * 0.6 + mx * 0.3;
        wireMesh.rotation.x = mesh.rotation.x;
        wireMesh.rotation.y = mesh.rotation.y;
        ring1.rotation.z = t * 0.5;
        ring2.rotation.z = -t * 0.3;
        ring2.rotation.x = 0.8 + Math.sin(t * 0.5) * 0.2;
        spheres.forEach(s => {
            s.angle += s.speed;
            s.mesh.position.x = Math.cos(s.angle) * s.radius;
            s.mesh.position.y = Math.sin(s.angle * 0.7) * 0.8;
            s.mesh.position.z = Math.sin(s.angle) * s.radius;
        });
        pLight.position.set(Math.sin(t) * 4, Math.cos(t) * 3, 3);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
})();

// PROJECT CARDS 3D
function initProjectCanvas(id, color, geo) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 3;
    const mat = new THREE.MeshPhongMaterial({ color, wireframe: false, transparent: true, opacity: 0.8, shininess: 80 });
    const mesh = new THREE.Mesh(geo, mat);
    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.25 }));
    scene.add(mesh); scene.add(wire);
    const light = new THREE.PointLight(color, 3, 10);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x111133, 1));
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.015;
        mesh.rotation.x = t * 0.5; mesh.rotation.y = t * 0.7;
        wire.rotation.x = mesh.rotation.x; wire.rotation.y = mesh.rotation.y;
        renderer.render(scene, camera);
    }
    animate();
}
initProjectCanvas('proj1-canvas', 0x00f5ff, new THREE.BoxGeometry(1.2, 1.2, 1.2));
initProjectCanvas('proj2-canvas', 0x7b2fff, new THREE.IcosahedronGeometry(0.9, 1));
initProjectCanvas('proj3-canvas', 0xff2d78, new THREE.OctahedronGeometry(1, 0));

// SCROLL REVEAL
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));

// SKILL BAR ANIMATION
const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('#skills').forEach(s => skillObserver.observe(s));