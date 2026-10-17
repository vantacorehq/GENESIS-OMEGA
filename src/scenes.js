/* Procedural universes: spiral galaxies, collisions, a Big Bang. */
(function (g) {
  'use strict';
  const O = g.OMEGA, TAU = Math.PI * 2, rnd = Math.random;
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.2;
  const HUES = [[110, 160, 255], [255, 110, 200], [100, 255, 200], [255, 170, 90]];
  const tint = (t, h) => { const w = [255, 215, 150], c = HUES[h % 4]; return [0, 1, 2].map(i => w[i] + (c[i] - w[i]) * t); };

  function galaxy(U, o) {
    const { x = 0, y = 0, z = 0, vx = 0, vy = 0, vz = 0, M = 1, R = 1, n = 20000, tilt = 0, spin = 1, hue = 0 } = o;
    U.addCore(M, x, y, z, vx, vy, vz);
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < n; i++) {
      const r = R * (0.06 - Math.log(1 - rnd() * 0.985) * 0.3);
      const th = (rnd() < 0.5 ? 0 : Math.PI) + (r / R) * 4.2 + gauss() * 0.3;   // two spiral arms
      const c = Math.cos(th), s = Math.sin(th);
      const v = Math.sqrt(M * r * r / Math.pow(r * r + O.EPS2, 1.5)) * spin * (1 + gauss() * 0.02);
      const py = r * s, pz = gauss() * 0.03 * R, qy = v * c, qz = gauss() * 0.01;
      const [cr, cg, cb] = tint(Math.min(1, r / (R * 1.2)), hue);
      U.addStar(x + r * c, y + py * ct - pz * st, z + py * st + pz * ct,
        vx - v * s, vy + qy * ct - qz * st, vz + qy * st + qz * ct, cr, cg, cb);
    }
  }

  const scenes = {
    collision(U) {
      U.reset(); const n = U.cap >> 1;
      galaxy(U, { x: -2.2, y: -0.5, z: 0, vx: 0.55, vy: 0.08, n, tilt: 0.5, hue: 0 });
      galaxy(U, { x: 2.2, y: 0.5, z: 0.2, vx: -0.55, vy: -0.08, n, tilt: -0.8, spin: -1, hue: 1 });
    },
    triple(U) {
      U.reset(); const n = Math.floor(U.cap / 3);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * TAU;
        galaxy(U, { x: 2.4 * Math.cos(a), y: 2.4 * Math.sin(a), vx: -0.45 * Math.sin(a), vy: 0.45 * Math.cos(a),
          n, tilt: i * 0.7, hue: i, spin: i === 1 ? -1 : 1 });
      }
    },
    bigbang(U) {
      U.reset(); U.addCore(3, 0, 0, 0, 0, 0, 0);
      for (let i = 0; i < U.cap; i++) {
        const u = rnd() * 2 - 1, a = rnd() * TAU, s = Math.sqrt(1 - u * u), r = 0.05 + rnd() * 0.25;
        const sp = Math.sqrt(6 / r) * (0.25 + rnd() * 0.55), dx = s * Math.cos(a), dy = s * Math.sin(a);
        const [cr, cg, cb] = tint(rnd() * 0.8, (rnd() * 4) | 0);
        U.addStar(dx * r, dy * r, u * r, (dx * 0.7 - dy * 0.7) * sp, (dy * 0.7 + dx * 0.7) * sp, u * sp * 0.7, cr, cg, cb);
      }
    },
    galaxy,
  };
  O.scenes = scenes;
})(typeof window !== 'undefined' ? window : globalThis);
