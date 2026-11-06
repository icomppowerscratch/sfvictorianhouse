// @ts-nocheck
import * as THREE from './vendor/three.module.js';
import { asphaltTexture, sidewalkTexture, lawnTexture, skylineTexture, glowTexture, cableCarSignTexture } from './textures';
import { box, cyl, std, M, makeHedge, makeFlowers } from './builders';

export const SLOPE = 0.12; // rise per meter along +x (~7 degrees)

function makeLamp(glow: any): any {
    const g = new THREE.Group();
    g.add(cyl(0.09, 0.13, 0.5, M.iron, 0, 0.25, 0));
    g.add(cyl(0.045, 0.07, 3.6, M.iron, 0, 2.3, 0));
    const arm = box(0.06, 0.06, 0.7, M.iron, 0, 4.15, 0.3);
    g.add(arm);
    g.add(cyl(0.16, 0.22, 0.34, M.iron, 0, 3.95, 0.62, 6));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd9a0' }));
    bulb.position.set(0, 3.92, 0.62);
    g.add(bulb);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85 }));
    spr.scale.setScalar(1.7);
    spr.position.set(0, 3.92, 0.62);
    g.add(spr);
    return g;
}

function makePalm(): any {
    const g = new THREE.Group();
    let y = 0;
    for (let i = 0; i < 6; i++) {
        const seg = cyl(0.09 - i * 0.008, 0.11 - i * 0.008, 0.9, std('#8a7358', 0.95), Math.sin(i * 0.16) * 0.22, y + 0.45, 0);
        g.add(seg);
        y += 0.85;
    }
    const topX = Math.sin(5 * 0.16) * 0.22;
    for (let i = 0; i < 9; i++) {
        const frond = box(0.09, 0.02, 2.0, std('#3e6b35', 0.9), 0, 0, 0.75);
        frond.rotation.y = (i / 9) * Math.PI * 2;
        frond.rotation.x = -0.85 - (i % 3) * 0.18;
        const pivot = new THREE.Group();
        pivot.position.set(topX, y + 0.1, 0);
        pivot.add(frond);
        g.add(pivot);
    }
    return g;
}

function makeCypress(): any {
    const g = new THREE.Group();
    g.add(cyl(0.08, 0.14, 0.8, std('#6b5138', 0.95), 0, 0.4, 0));
    const fol = new THREE.Mesh(new THREE.ConeGeometry(0.85, 4.6, 8), std('#2f4a2e', 0.95));
    fol.position.y = 3.0;
    fol.castShadow = true;
    g.add(fol);
    return g;
}

function makeCableCar(glow: any): any {
    const g = new THREE.Group();
    const maroon = std('#7a2e2a', 0.6);
    const cream = std('#efe3c4', 0.6);
    // chassis + lower body
    g.add(box(4.3, 0.25, 2.1, M.iron, 0, 0.45, 0));
    g.add(box(4.3, 1.05, 2.15, maroon, 0, 1.1, 0));
    // open window band
    g.add(box(4.3, 0.16, 2.15, cream, 0, 1.7, 0));
    for (let i = 0; i <= 8; i++) {
        g.add(box(0.09, 0.95, 0.09, cream, -2.05 + i * 0.5125, 2.2, 1.0));
        g.add(box(0.09, 0.95, 0.09, cream, -2.05 + i * 0.5125, 2.2, -1.0));
    }
    // dark interior behind the posts
    g.add(box(4.1, 0.95, 1.9, std('#2b2124', 0.9), 0, 2.2, 0));
    // bench hints
    g.add(box(3.8, 0.1, 0.5, std('#9a6b3f', 0.8), 0, 1.85, 0.55));
    g.add(box(3.8, 0.1, 0.5, std('#9a6b3f', 0.8), 0, 1.85, -0.55));
    // roof
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 4.35, 18), cream);
    roof.rotation.z = Math.PI / 2;
    roof.scale.set(0.34, 1, 1);
    roof.position.y = 2.62;
    roof.castShadow = true;
    g.add(roof);
    g.add(box(2.4, 0.3, 0.7, cream, 0, 3.1, 0));
    // end platforms
    for (const s of [-1, 1]) {
        g.add(box(0.5, 0.12, 2.1, std('#5d2320', 0.7), s * 2.4, 0.62, 0));
        g.add(box(0.06, 1.9, 0.06, M.iron, s * 2.62, 1.6, 0.9));
        g.add(box(0.06, 1.9, 0.06, M.iron, s * 2.62, 1.6, -0.9));
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe2ae' }));
        lamp.position.set(s * 2.66, 2.3, 0);
        g.add(lamp);
    }
    // side signs
    const sign = new THREE.MeshBasicMaterial({ map: cableCarSignTexture('POWELL & HYDE') });
    for (const s of [-1, 1]) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.45), sign);
        p.position.set(0, 1.62, s * 1.09);
        p.rotation.y = s > 0 ? 0 : Math.PI;
        g.add(p);
    }
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.7 }));
    spr.scale.setScalar(1.1);
    spr.position.set(2.66, 2.3, 0);
    g.add(spr);
    return g;
}

export function buildStreet(scene: any): any {
    const glow = glowTexture();
    const hill = new THREE.Group(); // everything that follows the slope
    hill.rotation.z = -Math.atan(SLOPE);
    scene.add(hill);

    // roadway with cable-car tracks
    const road = new THREE.Mesh(new THREE.BoxGeometry(72, 0.12, 7), new THREE.MeshStandardMaterial({ map: asphaltTexture(14, 2), roughness: 0.97 }));
    road.position.set(0, -0.06, 6.6);
    road.receiveShadow = true;
    hill.add(road);
    for (const tz of [5.9, 7.3]) {
        hill.add(box(72, 0.015, 0.1, M.iron, 0, 0.012, tz));
    }
    hill.add(box(72, 0.013, 0.14, std('#2c2e33', 0.9), 0, 0.011, 6.6)); // center slot
    // faded parking lines
    const lineMat = std('#c9c4b2', 0.9);
    for (let x = -32; x < 34; x += 6) {
        hill.add(box(0.14, 0.012, 1.9, lineMat, x, 0.012, 4.0));
        hill.add(box(0.14, 0.012, 1.9, lineMat, x, 0.012, 9.3));
    }

    // sidewalks + curbs
    const swMat = new THREE.MeshStandardMaterial({ map: sidewalkTexture(18, 1), roughness: 0.95 });
    const sw1 = new THREE.Mesh(new THREE.BoxGeometry(72, 0.22, 2.6), swMat);
    sw1.position.set(0, 0.0, 1.85);
    sw1.receiveShadow = true;
    hill.add(sw1);
    const sw2 = sw1.clone();
    sw2.position.z = 11.5;
    hill.add(sw2);
    hill.add(box(72, 0.24, 0.18, std('#9d968a', 0.95), 0, 0.0, 3.25));
    hill.add(box(72, 0.24, 0.18, std('#9d968a', 0.95), 0, 0.0, 10.1));

    // lamps along both sidewalks
    for (const lx of [-18, 0, 18]) {
        const lamp = makeLamp(glow);
        lamp.position.set(lx, 0.11, 2.6);
        hill.add(lamp);
    }
    const lamp2 = makeLamp(glow);
    lamp2.position.set(-9, 0.11, 10.6);
    lamp2.rotation.y = Math.PI;
    hill.add(lamp2);
    const lamp3 = makeLamp(glow);
    lamp3.position.set(9, 0.11, 10.6);
    lamp3.rotation.y = Math.PI;
    hill.add(lamp3);

    // palms on the far sidewalk
    for (const px of [-14, 4, 22]) {
        const palm = makePalm();
        palm.position.set(px, 0.11, 10.9);
        hill.add(palm);
    }

    // cable car
    const car = makeCableCar(glow);
    car.position.set(-8, 0.06, 6.6);
    hill.add(car);

    return { hill, car };
}

// Terraced front garden for a house whose entry sits at world y=yHouse.
export function makeGarden(width: number): any {
    const g = new THREE.Group();
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(width, 0.14, 2.5), new THREE.MeshStandardMaterial({ map: lawnTexture(5, 1), roughness: 0.95 }));
    lawn.position.set(0, 0.07, 1.55);
    lawn.receiveShadow = true;
    g.add(lawn);
    // path
    g.add(box(1.7, 0.16, 2.5, std('#b0a897', 0.95), 3.3, 0.08, 1.55));
    // hedges + flowers
    const h1 = makeHedge(3.4);
    h1.position.set(-2.6, 0.14, 2.6);
    g.add(h1);
    const h2 = makeHedge(1.6);
    h2.position.set(0.6, 0.14, 2.6);
    g.add(h2);
    const f1 = makeFlowers(8);
    f1.position.set(-4.0, 0.14, 1.2);
    g.add(f1);
    const f2 = makeFlowers(6);
    f2.position.set(0.9, 0.14, 1.6);
    g.add(f2);
    return g;
}

export function buildBackdrop(scene: any): any {
    // distant downtown skyline in the haze
    const sky = new THREE.Group();
    const tex = skylineTexture();
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: '#93a3b4', fog: true });
    const xs = [-46, -38, -31, -22, -14, -5, 3, 12, 20, 29, 38, 46];
    for (let i = 0; i < xs.length; i++) {
        const h = 7 + ((i * 37) % 13);
        const b = new THREE.Mesh(new THREE.BoxGeometry(6 + (i % 3) * 2, h, 5), mat);
        b.position.set(xs[i], h / 2 - 2, -72 - (i % 4) * 6);
        sky.add(b);
    }
    // transamerica-style pyramid
    const pyr = new THREE.Mesh(new THREE.ConeGeometry(3.4, 20, 4), new THREE.MeshBasicMaterial({ color: '#9dabbc', fog: true }));
    pyr.rotation.y = Math.PI / 4;
    pyr.position.set(-27, 6, -78);
    sky.add(pyr);
    scene.add(sky);

    // hill silhouettes behind the houses
    for (const [hx, hz, s, c] of [[-52, -45, 26, '#7d8b7a'], [55, -50, 30, '#75836f']]) {
        const hillM = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 12), new THREE.MeshBasicMaterial({ color: c, fog: true }));
        hillM.scale.set(1.6, 0.5, 1);
        hillM.position.set(hx, -6, hz);
        scene.add(hillM);
    }

    // cypress trees behind the row
    for (const [tx, tz] of [[-16, -13], [-7, -15], [6, -14], [15, -12], [22, -16]]) {
        const c = makeCypress();
        c.position.set(tx, 0, tz);
        c.scale.setScalar(0.9 + ((tx * 13) % 10) / 25);
        scene.add(c);
    }
}

// Fire hydrant detail at the curb.
export function makeHydrant(): any {
    const g = new THREE.Group();
    const red = std('#b33a2e', 0.6);
    g.add(cyl(0.14, 0.16, 0.5, red, 0, 0.25, 0, 10));
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), red);
    top.position.y = 0.53;
    g.add(top);
    g.add(cyl(0.05, 0.05, 0.36, red, 0, 0.32, 0, 8).rotateZ(Math.PI / 2));
    return g;
}
