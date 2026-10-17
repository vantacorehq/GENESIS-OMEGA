/* Software point-splatter into a Uint32 buffer + GPU compositing for trails and bloom. */
(function (g) {
  'use strict';
  class Renderer {
    constructor(cv) {
      this.cv = cv; this.ctx = cv.getContext('2d');
      this.star = document.createElement('canvas'); this.glow = document.createElement('canvas');
      this.yaw = 0.6; this.pitch = 0.95; this.zoom = 1; this.resize();
    }
    resize() {
      const d = this.d = Math.min(window.devicePixelRatio || 1, 1.5), cv = this.cv;
      const W = this.W = cv.width = Math.max(2, Math.floor(cv.clientWidth * d));
      const H = this.H = cv.height = Math.max(2, Math.floor(cv.clientHeight * d));
      this.star.width = W; this.star.height = H; this.glow.width = W >> 2; this.glow.height = H >> 2;
      this.sctx = this.star.getContext('2d'); this.gctx = this.glow.getContext('2d');
      this.img = this.sctx.createImageData(W, H); this.buf = new Uint32Array(this.img.data.buffer);
      this.ctx.fillStyle = '#000008'; this.ctx.fillRect(0, 0, W, H);
    }
    get scale() { return Math.min(this.W, this.H) * 0.16 * this.zoom; }
    unproject(cx, cy) {                                   // screen -> world plane z=0
      const sc = this.scale, d = this.d, x1 = (cx * d - this.W / 2) / sc, y1 = ((cy * d - this.H / 2) / sc) / Math.cos(this.pitch);
      const c = Math.cos(this.yaw), s = Math.sin(this.yaw);
      return [x1 * c + y1 * s, -x1 * s + y1 * c];
    }
    project(x, y, z) {
      const c = Math.cos(this.yaw), s = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), sc = this.scale;
      const x1 = x * c - y * s, y1 = x * s + y * c;
      return [this.W / 2 + x1 * sc, this.H / 2 + (y1 * cp - z * sp) * sc, y1 * sp + z * cp];
    }
    render(U) {
      const { W, H, buf, ctx } = this, sc = this.scale;
      const c = Math.cos(this.yaw), s = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      buf.fill(0xFF000000);
      const { x, y, z, col, n } = U, hw = W / 2, hh = H / 2;
      for (let i = 0; i < n; i++) {
        const px = x[i], py = y[i], pz = z[i];
        const x1 = px * c - py * s, y1 = px * s + py * c;
        const sx = (hw + x1 * sc) | 0, sy = (hh + (y1 * cp - pz * sp) * sc) | 0;
        if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
        const k = 54 + 30 * Math.max(-1, Math.min(1, (y1 * sp + pz * cp) * 0.4)), j = i * 3, p = sy * W + sx, o = buf[p];
        let r = (o & 255) + ((col[j] * k) >> 8), gg = ((o >> 8) & 255) + ((col[j + 1] * k) >> 8), b = ((o >> 16) & 255) + ((col[j + 2] * k) >> 8);
        buf[p] = 0xFF000000 | ((b > 255 ? 255 : b) << 16) | ((gg > 255 ? 255 : gg) << 8) | (r > 255 ? 255 : r);
      }
      this.sctx.putImageData(this.img, 0, 0);
      this.gctx.drawImage(this.star, 0, 0, W >> 2, H >> 2);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(0,0,8,0.3)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.star, 0, 0); ctx.globalAlpha = 0.9; ctx.drawImage(this.glow, 0, 0, W, H); ctx.globalAlpha = 1;
      for (const q of U.cores) {                          // black holes with accretion glow
        const [qx, qy] = this.project(q.x, q.y, q.z), r = sc * 0.1 * Math.sqrt(q.m);
        const gr = ctx.createRadialGradient(qx, qy, 0, qx, qy, r);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,190,90,.6)'); gr.addColorStop(1, 'rgba(255,80,0,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(qx, qy, r, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  g.OMEGA.Renderer = Renderer;
})(window);
