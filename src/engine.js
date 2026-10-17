/* OMEGA engine: restricted N-body. Massive cores attract each other (direct sum, merge on contact);
   tens of thousands of stars are test particles in the cores' gravity (symplectic Euler, softened). */
(function (g) {
  'use strict';
  const EPS2 = 0.0016;
  class Universe {
    constructor(cap) {
      this.cap = cap;
      this.x = new Float32Array(cap); this.y = new Float32Array(cap); this.z = new Float32Array(cap);
      this.vx = new Float32Array(cap); this.vy = new Float32Array(cap); this.vz = new Float32Array(cap);
      this.col = new Uint8Array(cap * 3);
      this.reset();
    }
    reset() { this.n = 0; this.ptr = 0; this.cores = []; this.t = 0; }
    addCore(m, x, y, z, vx, vy, vz) {
      if (this.cores.length >= 8) this.cores.shift();
      this.cores.push({ m, x, y, z, vx, vy, vz });
    }
    addStar(x, y, z, vx, vy, vz, r, gr, b) {           // ring buffer: oldest stars get recycled
      const i = this.ptr, c = i * 3;
      this.x[i] = x; this.y[i] = y; this.z[i] = z; this.vx[i] = vx; this.vy[i] = vy; this.vz[i] = vz;
      this.col[c] = r; this.col[c + 1] = gr; this.col[c + 2] = b;
      this.ptr = (i + 1) % this.cap; if (this.n < this.cap) this.n++;
    }
    step(dt) {
      const C = this.cores, k = C.length;
      for (let i = 0; i < k; i++) {                     // cores: mutual gravity
        const a = C[i]; let ax = 0, ay = 0, az = 0;
        for (let j = 0; j < k; j++) if (i !== j) {
          const b = C[j], dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          const r2 = dx * dx + dy * dy + dz * dz + 0.01, f = b.m / (r2 * Math.sqrt(r2));
          ax += f * dx; ay += f * dy; az += f * dz;
        }
        a.vx += ax * dt; a.vy += ay * dt; a.vz += az * dt;
      }
      for (const a of C) { a.x += a.vx * dt; a.y += a.vy * dt; a.z += a.vz * dt; }
      for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {   // supermassive mergers
        const a = C[i], b = C[j], dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        if (dx * dx + dy * dy + dz * dz < 0.004) {
          const m = a.m + b.m;
          a.x = (a.x * a.m + b.x * b.m) / m; a.y = (a.y * a.m + b.y * b.m) / m; a.z = (a.z * a.m + b.z * b.m) / m;
          a.vx = (a.vx * a.m + b.vx * b.m) / m; a.vy = (a.vy * a.m + b.vy * b.m) / m; a.vz = (a.vz * a.m + b.vz * b.m) / m;
          a.m = m; C.splice(j, 1); j--;
        }
      }
      const { x, y, z, vx, vy, vz, n } = this, K = C.length;
      for (let i = 0; i < n; i++) {                     // stars: the hot loop
        const px = x[i], py = y[i], pz = z[i]; let ax = 0, ay = 0, az = 0;
        for (let c = 0; c < K; c++) {
          const q = C[c], dx = q.x - px, dy = q.y - py, dz = q.z - pz;
          const r2 = dx * dx + dy * dy + dz * dz + EPS2, f = q.m / (r2 * Math.sqrt(r2));
          ax += f * dx; ay += f * dy; az += f * dz;
        }
        const nx = vx[i] += ax * dt, ny = vy[i] += ay * dt, nz = vz[i] += az * dt;
        x[i] = px + nx * dt; y[i] = py + ny * dt; z[i] = pz + nz * dt;
      }
      this.t += dt;
    }
  }
  g.OMEGA = g.OMEGA || {}; g.OMEGA.Universe = Universe; g.OMEGA.EPS2 = EPS2;
})(typeof window !== 'undefined' ? window : globalThis);
