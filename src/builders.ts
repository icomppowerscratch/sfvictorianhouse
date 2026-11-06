// @ts-nocheck
import * as THREE from './vendor/three.module.js';
import { sidingTexture, fishScaleTexture, roofTexture, glassTexture, brickTexture } from './textures';

export function std(color: string, rough = 0.85, metal = 0): any {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

export const M = {
    trim: std('#f4eddc'),
    trimDark: std('#ddd2b8'),
    glass: null,
    door: std('#8a3b2c', 0.55),
    brass: std('#c9a44e', 0.35, 0.85),
    roof: null,
    brick: null,
    iron: std('#3d3f45', 0.6, 0.4),
    leaf: std('#3f5d33', 0.9),
    leaf2: std('#577a3c', 0.9),
};

export function initShared() {
    M.glass = new THREE.MeshStandardMaterial({ map: glassTexture(), roughness: 0.15, metalness: 0.55 });
    M.roof = new THREE.MeshStandardMaterial({ map: roofTexture(), color: '#8d939e', roughness: 0.9 });
    M.brick = new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.95 });
}

export function box(w: number, h: number, d: number, mat: any, x = 0, y = 0, z = 0): any {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

export function cyl(rt: number, rb: number, h: number, mat: any, x = 0, y = 0, z = 0, seg = 12): any {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

// A sash window with casings, header cap, sill and mullions. Faces +z.
export function makeWindow(w: number, h: number, opts: any = {}): any {
    const g = new THREE.Group();
    const trim = opts.trim || M.trim;
    const cw = 0.1;
    g.add(box(cw, h, 0.1, trim, -(w / 2 - cw / 2), 0, 0.03));
    g.add(box(cw, h, 0.1, trim, (w / 2 - cw / 2), 0, 0.03));
    // header + cap molding
    g.add(box(w + 0.06, 0.2, 0.11, trim, 0, h / 2 - 0.1, 0.03));
    g.add(box(w + 0.22, 0.07, 0.2, trim, 0, h / 2 + 0.015, 0.06));
    // sill
    g.add(box(w + 0.1, 0.08, 0.18, trim, 0, -h / 2 + 0.02, 0.05));
    // glass
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, h - 0.34), M.glass);
    glass.position.set(0, -0.04, 0.045);
    g.add(glass);
    // mullions: meeting rail + upper cross
    g.add(box(w - 0.2, 0.055, 0.05, trim, 0, -0.04, 0.055));
    g.add(box(0.045, (h - 0.34) / 2, 0.05, trim, 0, (h - 0.34) / 4 - 0.04, 0.055));
    return g;
}

// Turned porch column (stacked profile).
export function makeColumn(h: number): any {
    const g = new THREE.Group();
    g.add(box(0.24, 0.14, 0.24, M.trim, 0, 0.07, 0));
    g.add(cyl(0.075, 0.095, h * 0.32, M.trim, 0, 0.14 + h * 0.16, 0));
    const bulge = cyl(0.115, 0.075, h * 0.2, M.trim, 0, 0.14 + h * 0.42, 0);
    g.add(bulge);
    g.add(cyl(0.07, 0.1, h * 0.34, M.trim, 0, 0.14 + h * 0.69, 0));
    g.add(box(0.26, 0.1, 0.26, M.trim, 0, h - 0.05, 0));
    return g;
}

// Straight staircase from sidewalk up to a landing. Returns group at sidewalk level.
export function makeStairs(width: number, topY: number, run: number, steps: number, mat: any): any {
    const g = new THREE.Group();
    const rise = topY / steps;
    const depth = run / steps;
    for (let i = 0; i < steps; i++) {
        g.add(box(width, rise, depth + 0.04, mat, 0, topY - (i + 0.5) * rise, -i * depth - depth / 2));
    }
    // railings
    const ang = Math.atan2(topY, run);
    const len = Math.sqrt(topY * topY + run * run);
    for (const sx of [-1, 1]) {
        const rail = box(0.07, 0.07, len, M.trim, sx * (width / 2 + 0.05), topY / 2 + 0.85, -run / 2);
        rail.rotation.x = ang;
        g.add(rail);
        for (let i = 0; i <= steps; i += 2) {
            const t = i / steps;
            g.add(box(0.055, 0.85, 0.055, M.trimDark, sx * (width / 2 + 0.05), topY - t * topY + 0.42, -t * run - 0.1));
        }
        const newel = box(0.16, 1.05, 0.16, M.trim, sx * (width / 2 + 0.06), 0.52, 0.1);
        g.add(newel);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), M.trim);
        ball.position.set(sx * (width / 2 + 0.06), 1.12, 0.1);
        ball.castShadow = true;
        g.add(ball);
    }
    return g;
}

// Paneled front door with transom window. Faces +z.
export function makeDoor(): any {
    const g = new THREE.Group();
    g.add(box(1.3, 2.95, 0.12, M.trim, 0, 1.475, 0.02));
    const slab = box(1.02, 2.3, 0.07, M.door, 0, 1.17, 0.07);
    g.add(slab);
    for (const py of [0.62, 1.72]) {
        for (const px of [-0.25, 0.25]) {
            g.add(box(0.34, 0.78, 0.03, std('#732f23', 0.55), px, py, 0.11));
        }
    }
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), M.brass);
    knob.position.set(0.4, 1.15, 0.13);
    g.add(knob);
    // transom
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.42), M.glass);
    tr.position.set(0, 2.56, 0.09);
    g.add(tr);
    g.add(box(1.06, 0.05, 0.05, M.trim, 0, 2.56, 0.1));
    g.add(box(0.05, 0.42, 0.05, M.trim, 0, 2.56, 0.1));
    // hood cap
    g.add(box(1.5, 0.1, 0.3, M.trim, 0, 3.02, 0.08));
    g.add(box(0.14, 0.3, 0.24, M.trim, -0.62, 2.86, 0.06));
    g.add(box(0.14, 0.3, 0.24, M.trim, 0.62, 2.86, 0.06));
    return g;
}

// Angled bay window, one story tall. Faces +z, attaches to facade at z=0.
export function makeBayStory(width: number, proj: number, h: number, bodyMat: any, accent: any): any {
    const g = new THREE.Group();
    const frontW = width * 0.55;
    const dx = (width - frontW) / 2;
    const L = Math.sqrt(proj * proj + dx * dx);
    const ang = Math.atan2(proj, dx); // panel tilt from x-axis
    const front = box(frontW, h, 0.12, bodyMat, 0, 0, proj);
    g.add(front);
    const left = box(L, h, 0.12, bodyMat, -(width / 2 + frontW / 2) / 2, 0, proj / 2);
    left.rotation.y = -ang;
    g.add(left);
    const right = box(L, h, 0.12, bodyMat, (width / 2 + frontW / 2) / 2, 0, proj / 2);
    right.rotation.y = ang;
    g.add(right);
    // windows on each face
    const fw = makeWindow(frontW - 0.28, h * 0.62);
    fw.position.set(0, h * 0.1, proj + 0.07);
    g.add(fw);
    const sw = h * 0.62;
    for (const s of [-1, 1]) {
        const w = makeWindow(L - 0.3, sw);
        w.position.set(s * (width / 2 + frontW / 2) / 2, h * 0.1, proj / 2 + 0.02);
        w.rotation.y = s > 0 ? ang : -ang;
        w.translateZ(0.05);
        g.add(w);
    }
    // apron panels below windows
    g.add(box(frontW - 0.3, h * 0.28, 0.05, accent, 0, -h * 0.3, proj + 0.08));
    return g;
}

export function makeCornice(width: number, depth: number, y: number, accent: any): any {
    const g = new THREE.Group();
    g.add(box(width + 0.25, 0.5, depth + 0.25, M.trim, 0, y + 0.25, 0));      // frieze
    g.add(box(width + 0.75, 0.16, depth + 0.75, M.trim, 0, y + 0.58, 0));     // cornice slab
    g.add(box(width + 0.5, 0.3, depth + 0.5, M.trimDark, 0, y + 0.81, 0));    // parapet cap
    // brackets
    const n = Math.floor(width / 0.85);
    for (let i = 0; i <= n; i++) {
        const x = -width / 2 + (i / n) * width;
        g.add(box(0.14, 0.42, 0.3, accent, x, y + 0.21, depth / 2 + 0.2));
        g.add(box(0.14, 0.42, 0.3, accent, x, y + 0.21, -depth / 2 - 0.2));
    }
    const ns = Math.floor(depth / 0.85);
    for (let i = 0; i <= ns; i++) {
        const z = -depth / 2 + (i / ns) * depth;
        g.add(box(0.3, 0.42, 0.14, accent, width / 2 + 0.2, y + 0.21, z));
        g.add(box(0.3, 0.42, 0.14, accent, -width / 2 - 0.2, y + 0.21, z));
    }
    return g;
}

export function makeFlowers(n: number): any {
    const g = new THREE.Group();
    const colors = ['#d45a6a', '#e8913f', '#e5d24b', '#c95d9e'];
    for (let i = 0; i < n; i++) {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.07 + Math.random() * 0.04, 8, 6), std(colors[i % colors.length], 0.8));
        f.position.set((Math.random() - 0.5) * 1.2, 0.32 + Math.random() * 0.1, (Math.random() - 0.5) * 0.5);
        g.add(f);
    }
    return g;
}

export function makeHedge(w: number): any {
    const g = new THREE.Group();
    const n = Math.max(3, Math.round(w / 0.55));
    for (let i = 0; i < n; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), i % 2 ? M.leaf : M.leaf2);
        s.scale.set(1, 0.75, 0.8);
        s.position.set(-w / 2 + (i + 0.5) * (w / n), 0.26, 0);
        s.castShadow = true;
        g.add(s);
    }
    return g;
}

// The hero Painted Lady. Origin: facade center at sidewalk level, faces +z.
export function makeHeroHouse(bodyColor: string, accentColor: string): any {
    initShared();
    const W = 10, D = 7.4, baseH = 1.5, floorH = 3.15, floors = 3;
    const H = floors * floorH;
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ map: sidingTexture(6, 14), color: bodyColor, roughness: 0.9 });
    const accent = std(accentColor, 0.8);
    const bodySide = new THREE.MeshStandardMaterial({ map: sidingTexture(5, 14), color: bodyColor, roughness: 0.9 });

    // raised basement
    g.add(box(W, baseH, D, M.brick, 0, baseH / 2, -D / 2));
    g.add(box(W + 0.2, 0.16, D + 0.2, M.trimDark, 0, baseH + 0.08, -D / 2));
    for (const bx of [-3.2, 0.6]) {
        const bw = makeWindow(0.85, 0.75);
        bw.position.set(bx, baseH * 0.55, 0.01);
        g.add(bw);
    }

    // main body
    g.add(box(W, H, D, body, 0, baseH + H / 2, -D / 2));

    // corner boards
    for (const sx of [-1, 1]) {
        g.add(box(0.26, H, 0.26, M.trim, sx * (W / 2 - 0.05), baseH + H / 2, 0.05));
        g.add(box(0.26, H, 0.26, M.trim, sx * (W / 2 - 0.05), baseH + H / 2, -D - 0.05));
    }
    // floor bands
    for (let f = 1; f < floors; f++) {
        g.add(box(W + 0.15, 0.22, D + 0.15, M.trim, 0, baseH + f * floorH, -D / 2));
    }

    // cornice + parapet
    g.add(makeCornice(W, D, baseH + H, accent));

    // stacked 3-story bay on the left
    const bayW = 2.9, bayProj = 0.95, bayX = -2.75;
    for (let f = 0; f < floors; f++) {
        const story = makeBayStory(bayW, bayProj, floorH - 0.25, body, accent);
        story.position.set(bayX, baseH + f * floorH + floorH / 2, 0);
        g.add(story);
        // dentil band between bay floors
        const band = new THREE.Group();
        band.add(box(2.2, 0.2, 0.14, M.trim, 0, 0, bayProj + 0.02));
        for (let i = 0; i < 9; i++) band.add(box(0.1, 0.1, 0.16, M.trimDark, -1 + i * 0.25, -0.14, bayProj + 0.02));
        band.position.set(bayX, baseH + (f + 1) * floorH - 0.12, 0);
        g.add(band);
    }
    // bay skirt to ground
    g.add(box(bayW + 0.15, baseH, bayProj + 0.15, M.brick, bayX, baseH / 2, bayProj / 2));
    // bay roof: shallow pyramid cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 2.15, 0.7, 4, 1), M.roof);
    cap.rotation.y = Math.PI / 4;
    cap.scale.set(1, 1, 0.66);
    cap.position.set(bayX, baseH + H + 0.35, bayProj / 2);
    cap.castShadow = true;
    g.add(cap);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), accent);
    finial.position.set(bayX, baseH + H + 0.78, bayProj / 2);
    g.add(finial);

    // flat facade windows (right side), floors 2-3
    for (let f = 1; f < floors; f++) {
        for (const wx of [0.9, 3.3]) {
            const w = makeWindow(1.15, 2.05);
            w.position.set(wx, baseH + f * floorH + floorH / 2 - 0.1, 0.02);
            g.add(w);
        }
    }
    // floor-1 window beside the porch
    const w1 = makeWindow(1.15, 2.05);
    w1.position.set(0.9, baseH + floorH / 2 - 0.1, 0.02);
    g.add(w1);

    // porch: covered landing + high stoop
    const px = 3.3;
    const landing = box(2.3, 0.22, 1.5, M.trimDark, px, baseH - 0.11, 0.85);
    g.add(landing);
    const door = makeDoor();
    door.position.set(px, baseH, 0.06);
    g.add(door);
    for (const sx of [-1, 1]) {
        const col = makeColumn(floorH - 0.35);
        col.position.set(px + sx * 0.95, baseH, 1.45);
        g.add(col);
    }
    g.add(box(2.7, 0.32, 1.9, M.trim, px, baseH + floorH - 0.2, 0.95));   // porch frieze
    g.add(box(2.9, 0.12, 2.1, M.roof, px, baseH + floorH - 0.02, 0.95));  // porch roof
    for (let i = 0; i < 4; i++) {
        g.add(box(0.12, 0.3, 0.24, accent, px - 1.2 + i * 0.8, baseH + floorH - 0.42, 1.82));
    }
    // stoop down to the sidewalk
    const stairs = makeStairs(1.7, baseH, 2.0, 8, M.trimDark);
    stairs.position.set(px, 0, 1.6 + 2.0);
    stairs.rotation.y = Math.PI; // steps descend toward +z
    g.add(stairs);

    // side windows
    for (let f = 0; f < floors; f++) {
        for (const wz of [-2.0, -5.0]) {
            for (const sx of [-1, 1]) {
                const w = makeWindow(1.05, 1.85);
                w.rotation.y = sx * Math.PI / 2;
                w.position.set(sx * (W / 2 + 0.01), baseH + f * floorH + floorH / 2, wz);
                g.add(w);
            }
        }
    }
    // rear windows
    for (let f = 0; f < floors; f++) {
        for (const wx of [-2.5, 2.5]) {
            const w = makeWindow(1.05, 1.85);
            w.rotation.y = Math.PI;
            w.position.set(wx, baseH + f * floorH + floorH / 2, -D - 0.01);
            g.add(w);
        }
    }

    // chimney
    g.add(box(0.65, 1.6, 0.65, M.brick, -W / 2 + 1.2, baseH + H + 1.4, -D + 1.4));
    g.add(box(0.85, 0.18, 0.85, M.trimDark, -W / 2 + 1.2, baseH + H + 2.2, -D + 1.4));

    return g;
}

// Simpler neighbor row-house. Faces +z.
export function makeNeighbor(cfg: any): any {
    initShared();
    const { color, accent: accentColor, hasBay, garage } = cfg;
    const W = cfg.w || 8, D = cfg.d || 6.6, baseH = 1.6, floorH = 3.0, floors = 2;
    const H = floors * floorH;
    const g = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ map: sidingTexture(5, 11), color, roughness: 0.9 });
    const accent = std(accentColor, 0.8);

    g.add(box(W, baseH, D, M.brick, 0, baseH / 2, -D / 2));
    g.add(box(W + 0.2, 0.15, D + 0.2, M.trimDark, 0, baseH + 0.07, -D / 2));
    g.add(box(W, H, D, body, 0, baseH + H / 2, -D / 2));
    for (const sx of [-1, 1]) {
        g.add(box(0.24, H, 0.24, M.trim, sx * (W / 2 - 0.05), baseH + H / 2, 0.05));
    }
    g.add(box(W + 0.14, 0.2, D + 0.14, M.trim, 0, baseH + floorH, -D / 2));
    g.add(makeCornice(W, D, baseH + H, accent));

    if (garage) {
        // paneled garage door at basement level
        const gd = new THREE.Group();
        gd.add(box(2.5, 1.5, 0.1, accent, 0, 0.85, 0));
        for (let ix = 0; ix < 4; ix++) for (let iy = 0; iy < 2; iy++) {
            gd.add(box(0.5, 0.55, 0.05, M.trimDark, -0.92 + ix * 0.62, 0.5 + iy * 0.68, 0.06));
        }
        gd.position.set(cfg.garageX ?? -2.2, 0, 0.03);
        g.add(gd);
    }

    if (hasBay) {
        const bayX = -W / 4 - 0.4;
        for (let f = 0; f < floors; f++) {
            const story = makeBayStory(2.5, 0.85, floorH - 0.2, body, accent);
            story.position.set(bayX, baseH + f * floorH + floorH / 2, 0);
            g.add(story);
        }
        g.add(box(2.65, baseH, 1.0, M.brick, bayX, baseH / 2, 0.45));
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1.9, 0.55, 4, 1), M.roof);
        cap.rotation.y = Math.PI / 4;
        cap.scale.set(1, 1, 0.6);
        cap.position.set(bayX, baseH + H + 0.28, 0.42);
        cap.castShadow = true;
        g.add(cap);
    } else {
        for (let f = 0; f < floors; f++) {
            for (const wx of [-W / 4 - 0.6, -W / 4 + 1.0]) {
                const w = makeWindow(1.05, 1.9);
                w.position.set(wx, baseH + f * floorH + floorH / 2, 0.02);
                g.add(w);
            }
        }
    }

    // entry side: door + straight stoop
    const px = W / 4 + 0.7;
    for (let f = 0; f < floors; f++) {
        const w = makeWindow(1.05, 1.9);
        w.position.set(px, baseH + f * floorH + floorH / 2, 0.02);
        g.add(w);
    }
    const door = makeDoor();
    door.scale.setScalar(0.92);
    door.position.set(px, baseH, 0.06);
    g.add(door);
    const stairs = makeStairs(1.5, baseH, 1.7, 8, M.trimDark);
    stairs.position.set(px, 0, 1.35 + 1.7);
    stairs.rotation.y = Math.PI;
    g.add(stairs);

    // side + rear windows
    for (let f = 0; f < floors; f++) {
        for (const sx of [-1, 1]) {
            const w = makeWindow(1.0, 1.7);
            w.rotation.y = sx * Math.PI / 2;
            w.position.set(sx * (W / 2 + 0.01), baseH + f * floorH + floorH / 2, -D / 2);
            g.add(w);
        }
        const wr = makeWindow(1.0, 1.7);
        wr.rotation.y = Math.PI;
        wr.position.set(0, baseH + f * floorH + floorH / 2, -D - 0.01);
        g.add(wr);
    }
    return g;
}
