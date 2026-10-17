(function () {
  'use strict';
  const O = OMEGA, cv = document.getElementById('c'), R = new O.Renderer(cv), U = new O.Universe(60000);
  let sub = 3, frames = 0, last = performance.now(), fps = 60, drag = null, moved = 0, scene = 'collision';
  const hud = document.getElementById('hud');
  const load = name => { scene = name; O.scenes[name](U); document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.s === name)); };
  document.querySelectorAll('nav button').forEach(b => b.onclick = () => load(b.dataset.s));
  addEventListener('resize', () => R.resize());
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
    R.yaw += dx * 0.006; R.pitch = Math.max(0.15, Math.min(1.5, R.pitch + dy * 0.005)); drag = { x: e.clientX, y: e.clientY };
  });
  cv.addEventListener('pointerup', e => {
    drag = null; if (moved > 8) return;                   // a tap drops a new galaxy on a collision course
    const [wx, wy] = R.unproject(e.clientX, e.clientY), d = Math.hypot(wx, wy) || 1;
    O.scenes.galaxy(U, { x: wx, y: wy, vx: -wx / d * 0.5, vy: -wy / d * 0.5, M: 0.6 + Math.random() * 0.8, R: 0.7, n: 9000,
      tilt: Math.random() * 3, hue: (Math.random() * 4) | 0, spin: Math.random() < 0.5 ? 1 : -1 });
  });
  cv.addEventListener('wheel', e => { e.preventDefault(); R.zoom = Math.max(0.3, Math.min(4, R.zoom * Math.exp(-e.deltaY * 0.001))); }, { passive: false });
  function frame(now) {
    for (let i = 0; i < sub; i++) U.step(0.005);
    if (!drag) R.yaw += 0.0012;
    R.render(U);
    frames++;
    if (now - last > 1000) {
      fps = frames * 1000 / (now - last); frames = 0; last = now;
      if (fps < 40 && sub > 1) sub--; else if (fps > 57 && sub < 3) sub++;   // adaptive quality
      hud.textContent = `STARS ${U.n.toLocaleString()}  ·  BLACK HOLES ${U.cores.length}  ·  ${fps.toFixed(0)} FPS  ·  t=${U.t.toFixed(1)}`;
    }
    requestAnimationFrame(frame);
  }
  load('collision'); requestAnimationFrame(frame);
})();
