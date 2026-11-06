// @ts-nocheck
import * as THREE from './vendor/three.module.js';

function canvasTexture(size: number, draw: (ctx: any, s: number) => void, rx = 1, ry = 1): any {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    draw(ctx, size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
}

function noise(ctx: any, s: number, n: number, alpha: number, dark = true, light = true) {
    for (let i = 0; i < n; i++) {
        const a = Math.random() * alpha;
        if (dark && Math.random() < 0.5) ctx.fillStyle = `rgba(0,0,0,${a})`;
        else if (light) ctx.fillStyle = `rgba(255,255,255,${a})`;
        else continue;
        ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
}

// Horizontal clapboard siding, near-white so material.color tints it.
export function sidingTexture(rx = 5, ry = 10): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#f2efe9'; ctx.fillRect(0, 0, s, s);
        for (let y = 0; y < s; y += 22) {
            ctx.fillStyle = 'rgba(60,50,40,0.30)'; ctx.fillRect(0, y, s, 2);
            ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(0, y + 2, s, 2);
            ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0, y + 10, s, 5);
        }
        noise(ctx, s, 500, 0.05);
    }, rx, ry);
}

// Fish-scale shingles for gables / decorative bands.
export function fishScaleTexture(rx = 4, ry = 3): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#efe9dd'; ctx.fillRect(0, 0, s, s);
        const r = 16, rowH = 14;
        for (let row = 0; row * rowH < s + r; row++) {
            const off = (row % 2) * r;
            for (let x = -r; x < s + r; x += r * 2) {
                ctx.beginPath();
                ctx.arc(x + off, row * rowH + r, r, 0, Math.PI);
                ctx.strokeStyle = 'rgba(70,55,40,0.45)'; ctx.lineWidth = 2.5; ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + off, row * rowH + r, r - 3, 0, Math.PI);
                ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1.5; ctx.stroke();
            }
        }
        noise(ctx, s, 400, 0.05);
    }, rx, ry);
}

export function roofTexture(rx = 8, ry = 4): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#c9cdd4'; ctx.fillRect(0, 0, s, s);
        const w = 32, h = 18;
        for (let row = 0; row * h < s + h; row++) {
            const off = (row % 2) * (w / 2);
            for (let x = -w; x < s + w; x += w) {
                ctx.fillStyle = 'rgba(40,42,50,0.55)'; ctx.fillRect(x + off, row * h, w - 2, h - 2);
                ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + off, row * h, w - 2, 2);
            }
        }
        noise(ctx, s, 900, 0.10);
    }, rx, ry);
}

export function asphaltTexture(rx = 10, ry = 3): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#43464c'; ctx.fillRect(0, 0, s, s);
        noise(ctx, s, 2600, 0.16);
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.06})`;
            ctx.fillRect(Math.random() * s, Math.random() * s, 30 + Math.random() * 60, 20 + Math.random() * 40);
        }
    }, rx, ry);
}

export function sidewalkTexture(rx = 14, ry = 2): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#b9b2a4'; ctx.fillRect(0, 0, s, s);
        noise(ctx, s, 1500, 0.08);
        ctx.strokeStyle = 'rgba(60,55,45,0.5)'; ctx.lineWidth = 3;
        for (let x = 0; x <= s; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(60,55,45,0.35)';
        ctx.beginPath(); ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2); ctx.stroke();
    }, rx, ry);
}

export function glassTexture(): any {
    return canvasTexture(128, (ctx, s) => {
        const g = ctx.createLinearGradient(0, 0, 0, s);
        g.addColorStop(0, '#8ba3b8');
        g.addColorStop(0.45, '#4d5e70');
        g.addColorStop(1, '#2e3a46');
        ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.moveTo(s * 0.1, 0); ctx.lineTo(s * 0.42, 0); ctx.lineTo(s * 0.1, s); ctx.lineTo(0, s); ctx.lineTo(0, s * 0.4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,235,200,0.14)'; ctx.fillRect(0, s * 0.72, s, s * 0.28);
    });
}

export function brickTexture(rx = 6, ry = 2): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#e8ddd2'; ctx.fillRect(0, 0, s, s);
        const w = 42, h = 16;
        for (let row = 0; row * h < s + h; row++) {
            const off = (row % 2) * (w / 2);
            for (let x = -w; x < s + w; x += w) {
                ctx.fillStyle = `rgba(${120 + Math.random() * 40},${60 + Math.random() * 18},${48 + Math.random() * 14},1)`;
                ctx.fillRect(x + off + 2, row * h + 2, w - 4, h - 4);
            }
        }
        noise(ctx, s, 800, 0.08);
    }, rx, ry);
}

export function lawnTexture(rx = 6, ry = 2): any {
    return canvasTexture(256, (ctx, s) => {
        ctx.fillStyle = '#5d7a43'; ctx.fillRect(0, 0, s, s);
        for (let i = 0; i < 2200; i++) {
            const g = 90 + Math.random() * 70;
            ctx.fillStyle = `rgba(${g * 0.55},${g},${g * 0.42},0.5)`;
            ctx.fillRect(Math.random() * s, Math.random() * s, 2, 3);
        }
    }, rx, ry);
}

export function skyTexture(): any {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#6f9fd2');
    g.addColorStop(0.42, '#a9c6e2');
    g.addColorStop(0.62, '#e9d9c2');
    g.addColorStop(0.78, '#f4cfa4');
    g.addColorStop(1, '#e8b98a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

export function skylineTexture(rx = 3, ry = 1): any {
    return canvasTexture(128, (ctx, s) => {
        ctx.fillStyle = '#6d7d8d'; ctx.fillRect(0, 0, s, s);
        for (let y = 6; y < s - 4; y += 10) {
            for (let x = 5; x < s - 4; x += 9) {
                if (Math.random() < 0.4) {
                    ctx.fillStyle = Math.random() < 0.6 ? 'rgba(255,230,170,0.75)' : 'rgba(30,38,48,0.8)';
                    ctx.fillRect(x, y, 4, 6);
                }
            }
        }
    }, rx, ry);
}

export function glowTexture(): any {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,230,180,0.9)');
    g.addColorStop(0.35, 'rgba(255,205,130,0.35)');
    g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

export function cableCarSignTexture(text: string): any {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 96;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f0e4c6'; ctx.fillRect(0, 0, 512, 96);
    ctx.strokeStyle = '#7a2e2a'; ctx.lineWidth = 6; ctx.strokeRect(6, 6, 500, 84);
    ctx.fillStyle = '#5d2320';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 52);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}
