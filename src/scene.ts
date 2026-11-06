// @ts-nocheck
import * as THREE from './vendor/three.module.js';
import { skyTexture } from './textures';
import { makeHeroHouse, makeNeighbor, box, std } from './builders';
import { buildStreet, buildBackdrop, makeGarden, makeHydrant, SLOPE } from './street';

const SIN = SLOPE / Math.sqrt(1 + SLOPE * SLOPE); // sin(atan(SLOPE))
const COS = 1 / Math.sqrt(1 + SLOPE * SLOPE);
const groundY = (x: number) => -x * SIN + 0.11 * COS;

export function mountScene(wrapper: HTMLElement): () => void {
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    // ---------- renderer ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = 'scene-canvas';
    wrapper.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#eed6bd', 55, 185);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);

    // sky dome + sun
    const sky = new THREE.Mesh(new THREE.SphereGeometry(260, 24, 16), new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false }));
    scene.add(sky);
    const sunSpr = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#fff0cf', fog: false, transparent: true, opacity: 0.95 }));
    sunSpr.scale.setScalar(26);
    sunSpr.position.set(120, 90, 90);
    scene.add(sunSpr);

    // ---------- lights ----------
    const sun = new THREE.DirectionalLight('#ffd9a8', 2.9);
    sun.position.set(38, 30, 34);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 130;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(sun);
    scene.add(sun.target);
    scene.add(new THREE.HemisphereLight('#bcd2ec', '#a08764', 0.9));
    scene.add(new THREE.AmbientLight('#fff2e0', 0.18));

    // ---------- build ----------
    const { car } = buildStreet(scene);
    buildBackdrop(scene);

    const hero = makeHeroHouse('#87a5b8', '#c9784a');
    hero.position.set(0, groundY(0), 0);
    scene.add(hero);
    const left = makeNeighbor({ color: '#d9c07a', accent: '#a8543e', hasBay: false, garage: true, garageX: -2.0, w: 8, d: 6.6 });
    left.position.set(-10.9, groundY(-10.9), 0);
    scene.add(left);
    const right = makeNeighbor({ color: '#9db08c', accent: '#5f7d95', hasBay: true, garage: true, garageX: 2.0, w: 8, d: 6.6 });
    right.position.set(10.9, groundY(10.9), 0);
    scene.add(right);

    // terrace pads + gardens
    for (const [hx, w] of [[0, 11.5], [-10.9, 9.5], [10.9, 9.5]]) {
        const pad = box(w, 2.4, 10.5, std('#a89f8d', 0.95), hx, groundY(hx) - 1.22, -2.4);
        scene.add(pad);
    }
    const garden = makeGarden(10);
    garden.position.set(0, groundY(0), 0);
    scene.add(garden);
    const hyd = makeHydrant();
    hyd.position.set(6.8, groundY(6.8) + 0.02, 2.9);
    scene.add(hyd);

    // ---------- controls ----------
    const HOME = { az: 0.2, el: 0.07, r: 24, tx: -0.6, ty: 4.0, tz: -0.5 };
    const state: any = {
        mode: 'orbit',
        az: HOME.az, el: HOME.el, r: HOME.r,
        target: new THREE.Vector3(HOME.tx, HOME.ty, HOME.tz),
        eye: new THREE.Vector3(0, groundY(0) + 1.7, 9),
        yaw: 0, pitch: -0.05,
        keys: {},
    };
    if (coarse) state.r = HOME.r * 1.38;

    function applyCamera() {
        if (state.mode === 'orbit') {
            const { az, el, r, target } = state;
            camera.position.set(
                target.x + r * Math.cos(el) * Math.sin(az),
                target.y + r * Math.sin(el),
                target.z + r * Math.cos(el) * Math.cos(az)
            );
            camera.lookAt(target);
        } else {
            camera.position.copy(state.eye);
            const d = new THREE.Vector3(Math.sin(state.yaw) * Math.cos(state.pitch), Math.sin(state.pitch), -Math.cos(state.yaw) * Math.cos(state.pitch));
            camera.lookAt(state.eye.x + d.x, state.eye.y + d.y, state.eye.z + d.z);
        }
    }

    function resetView() {
        state.mode = 'orbit';
        state.az = HOME.az; state.el = HOME.el;
        state.r = coarse ? HOME.r * 1.32 : HOME.r;
        state.target.set(HOME.tx, HOME.ty, HOME.tz);
        updateButtons();
    }

    // DOM overlay
    const btns = document.createElement('div');
    btns.className = 'scene-btns';
    const bOrbit = document.createElement('button'); bOrbit.textContent = 'Orbit'; bOrbit.className = 'scene-btn';
    const bWalk = document.createElement('button'); bWalk.textContent = 'Walk'; bWalk.className = 'scene-btn';
    const bReset = document.createElement('button'); bReset.textContent = 'Reset view'; bReset.className = 'scene-btn';
    btns.appendChild(bOrbit);
    if (!coarse) btns.appendChild(bWalk);
    btns.appendChild(bReset);
    wrapper.appendChild(btns);

    const caption = document.createElement('div');
    caption.className = 'scene-caption';
    caption.textContent = coarse
        ? 'Drag to look around - pinch to zoom'
        : 'Drag to look around - scroll to zoom - Walk: drag to look, WASD / arrows to move';
    wrapper.appendChild(caption);

    const loading = document.createElement('div');
    loading.className = 'scene-loading';
    loading.innerHTML = '<div class="scene-loading-bar"></div><p>Raising the Painted Ladies...</p>';
    wrapper.appendChild(loading);

    function updateButtons() {
        bOrbit.classList.toggle('is-active', state.mode === 'orbit');
        bWalk.classList.toggle('is-active', state.mode === 'walk');
    }
    updateButtons();

    bOrbit.addEventListener('click', () => { state.mode = 'orbit'; updateButtons(); });
    bWalk.addEventListener('click', () => {
        state.mode = 'walk';
        const p = camera.position;
        state.eye.set(Math.max(-26, Math.min(26, p.x)), 0, Math.max(2.2, Math.min(11.6, p.z)));
        state.eye.y = groundY(state.eye.x) + 1.7;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        state.yaw = Math.atan2(dir.x, -dir.z);
        state.pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
        updateButtons();
    });
    bReset.addEventListener('click', resetView);

    // pointer / touch
    const el = renderer.domElement;
    const pointers = new Map();
    let pinchDist = 0;
    const onDown = (e: PointerEvent) => {
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        }
    };
    const onMove = (e: PointerEvent) => {
        if (!pointers.has(e.pointerId)) return;
        const prev = pointers.get(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchDist > 0 && state.mode === 'orbit') {
                state.r = Math.max(7, Math.min(38, state.r * (pinchDist / d)));
            }
            pinchDist = d;
            return;
        }
        const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        if (state.mode === 'orbit') {
            state.az = Math.max(HOME.az - 1.0, Math.min(HOME.az + 1.0, state.az - dx * 0.0042));
            state.el = Math.max(0.05, Math.min(1.2, state.el + dy * 0.0042));
        } else {
            state.yaw -= dx * 0.004;
            state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch - dy * 0.004));
        }
    };
    const onUp = (e: PointerEvent) => {
        pointers.delete(e.pointerId);
        pinchDist = 0;
    };
    const onWheel = (e: WheelEvent) => {
        if (state.mode !== 'orbit') return;
        e.preventDefault();
        state.r = Math.max(7, Math.min(38, state.r * (1 + e.deltaY * 0.0009)));
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
        if (state.mode !== 'walk') return;
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
            state.keys[k] = down;
            e.preventDefault();
        }
    };
    const kd = onKey(true), ku = onKey(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    // ---------- resize ----------
    const resize = () => {
        const w = wrapper.clientWidth, h = wrapper.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    resize();

    // ---------- loop ----------
    let raf = 0, last = performance.now(), first = true;
    let carDir = 1, carPause = 0;
    const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        // cable car patrol
        if (carPause > 0) carPause -= dt;
        else {
            car.position.x += carDir * 1.5 * dt;
            if (car.position.x > 26) { car.position.x = 26; carDir = -1; carPause = 3.5; }
            if (car.position.x < -26) { car.position.x = -26; carDir = 1; carPause = 3.5; }
        }

        // walk movement
        if (state.mode === 'walk') {
            const sp = (state.keys['shift'] ? 7 : 3.6) * dt;
            const f = new THREE.Vector3(Math.sin(state.yaw), 0, -Math.cos(state.yaw));
            const r = new THREE.Vector3(Math.cos(state.yaw), 0, Math.sin(state.yaw));
            if (state.keys['w'] || state.keys['arrowup']) state.eye.addScaledVector(f, sp);
            if (state.keys['s'] || state.keys['arrowdown']) state.eye.addScaledVector(f, -sp);
            if (state.keys['a'] || state.keys['arrowleft']) state.eye.addScaledVector(r, -sp);
            if (state.keys['d'] || state.keys['arrowright']) state.eye.addScaledVector(r, sp);
            state.eye.x = Math.max(-26, Math.min(26, state.eye.x));
            state.eye.z = Math.max(2.2, Math.min(11.6, state.eye.z));
            state.eye.y = groundY(state.eye.x) + 1.7;
        }

        applyCamera();
        renderer.render(scene, camera);
        if (first) {
            first = false;
            setTimeout(() => loading.classList.add('is-done'), 250);
        }
    };
    raf = requestAnimationFrame(tick);

    return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener('keydown', kd);
        window.removeEventListener('keyup', ku);
        renderer.dispose();
        wrapper.innerHTML = '';
    };
}
