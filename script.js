/* D.C. ALACRITY — interactive layer
 * - telemetry scroll bar
 * - custom cursor halo + magnetic buttons
 * - hero lightning canvas (animated neural bolts)
 * - story-graph node visualizer (branching narrative)
 * - terminal typewriter w/ highlighted token
 * - tilt cards, meters, scramble text, reveal-on-scroll, marquee duplication
 */
(() => {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = matchMedia('(pointer: coarse)').matches;

  /* ---------- telemetry ---------- */
  const tele = document.querySelector('.telemetry__fill');
  const onScroll = () => {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (tele) tele.style.setProperty('--scroll', `${(pct * 100).toFixed(2)}%`);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- year ---------- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.nav__menu');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('.nav__links a').forEach(a =>
      a.addEventListener('click', () => { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); })
    );
  }

  /* ---------- cursor halo + magnetic ---------- */
  const halo = document.querySelector('.halo');
  if (halo && !isCoarse) {
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y2 = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    const loop = () => {
      x += (tx - x) * 0.18; y2 += (ty - y2) * 0.18;
      halo.style.transform = `translate(${x}px, ${y2}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('a, button, [data-magnetic], .tilt, .eco-card, .venture, .market, .shields li, input, textarea').forEach(el => {
      el.addEventListener('pointerenter', () => halo.classList.add('halo--hover'));
      el.addEventListener('pointerleave', () => halo.classList.remove('halo--hover'));
    });
  }

  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- tilt cards ---------- */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        if (en.target.classList.contains('meter')) en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal], .meter').forEach(el => io.observe(el));

  /* ---------- text scramble ---------- */
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const scramble = (el) => {
    const finalText = el.dataset.scramble || el.textContent;
    const len = finalText.length;
    let frame = 0;
    const total = 40;
    const tick = () => {
      frame++;
      let out = '';
      for (let i = 0; i < len; i++) {
        const progress = (frame - i * 0.8) / (total - i);
        if (progress >= 1) out += finalText[i];
        else if (progress > 0) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else out += ' ';
      }
      el.textContent = out;
      if (frame < total + len) requestAnimationFrame(tick);
      else el.textContent = finalText;
    };
    tick();
  };
  const scrambleIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { scramble(en.target); scrambleIO.unobserve(en.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-scramble]').forEach(el => scrambleIO.observe(el));

  /* ---------- terminal typewriter ---------- */
  const term = document.querySelector('[data-typer]');
  if (term) {
    const original = term.innerHTML;
    const startTyper = () => {
      term.innerHTML = '';
      const buf = [];
      let i = 0; let inTag = false; let tag = '';
      const src = original;
      const step = () => {
        if (i >= src.length) { term.innerHTML = original; return; }
        const c = src[i++];
        if (c === '<') { inTag = true; tag = '<'; }
        else if (inTag) { tag += c; if (c === '>') { inTag = false; buf.push(tag); tag=''; } }
        else { buf.push(c); }
        term.innerHTML = buf.join('') + '<span class="cursor">▋</span>';
        setTimeout(step, c === '\n' ? 40 : (Math.random() * 14 + 6));
      };
      step();
    };
    const tio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { startTyper(); tio.unobserve(en.target); } });
    }, { threshold: 0.25 });
    tio.observe(term);
  }

  /* ---------- HERO LIGHTNING CANVAS ---------- */
  const boltCanvas = document.querySelector('.hero__bolt');
  if (boltCanvas) {
    const ctx = boltCanvas.getContext('2d');
    const DPR = Math.min(2, devicePixelRatio || 1);
    let w = 0, h = 0, nodes = [], pointer = { x: .5, y: .5, active: false };

    const resize = () => {
      const r = boltCanvas.getBoundingClientRect();
      w = r.width; h = r.height;
      boltCanvas.width = Math.floor(w * DPR);
      boltCanvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    };
    const seed = () => {
      const count = Math.max(36, Math.floor((w * h) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - .5) * 0.25,
        vy: (Math.random() - .5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };

    const drawLightning = (x1, y1, x2, y2, life) => {
      const segments = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const jx = (Math.random() - .5) * 22 * (1 - Math.abs(t - .5) * 2);
        const jy = (Math.random() - .5) * 22 * (1 - Math.abs(t - .5) * 2);
        ctx.lineTo(x1 + (x2 - x1) * t + jx, y1 + (y2 - y1) * t + jy);
      }
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(89,240,255,${0.35 * life})`;
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(89,240,255,.8)';
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    let bolts = [];
    const spawnBolt = () => {
      if (nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a === b) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 260) return;
      bolts.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, life: 1 });
    };

    const frame = () => {
      if (prefersReduced) return;
      ctx.clearRect(0, 0, w, h);

      // connection fog
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        // gentle pull toward pointer
        if (pointer.active) {
          const px = pointer.x * w, py = pointer.y * h;
          const dx = px - n.x, dy = py - n.y;
          const dd = dx*dx + dy*dy;
          if (dd < 180*180) { n.vx += dx * 0.00008; n.vy += dy * 0.00008; }
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 140) {
            const alpha = (1 - d / 140) * 0.18;
            ctx.strokeStyle = `rgba(140,160,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        ctx.beginPath();
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 6);
        g.addColorStop(0, 'rgba(89,240,255,.9)');
        g.addColorStop(1, 'rgba(89,240,255,0)');
        ctx.fillStyle = g;
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }

      if (Math.random() < 0.08) spawnBolt();
      bolts = bolts.filter(b => {
        drawLightning(b.x1, b.y1, b.x2, b.y2, b.life);
        b.life -= 0.06;
        return b.life > 0;
      });

      // central arc from pointer (or center)
      const cx = (pointer.x || .5) * w;
      const cy = (pointer.y || .5) * h;
      const ring = (ctx.createRadialGradient(cx, cy, 0, cx, cy, 240));
      ring.addColorStop(0, 'rgba(122,92,255,.18)');
      ring.addColorStop(1, 'rgba(122,92,255,0)');
      ctx.fillStyle = ring;
      ctx.beginPath(); ctx.arc(cx, cy, 240, 0, Math.PI * 2); ctx.fill();

      requestAnimationFrame(frame);
    };

    addEventListener('resize', resize);
    boltCanvas.addEventListener('pointermove', e => {
      const r = boltCanvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
      pointer.active = true;
    });
    boltCanvas.addEventListener('pointerleave', () => { pointer.active = false; });
    resize();
    if (!prefersReduced) requestAnimationFrame(frame);
  }

  /* ---------- STORY GRAPH CANVAS ---------- */
  const graph = document.querySelector('.storygraph__canvas');
  if (graph) {
    const ctx = graph.getContext('2d');
    const DPR = Math.min(2, devicePixelRatio || 1);
    let w = 0, h = 0;

    // layered node graph: columns = acts
    const cols = [
      [{ id: 'open', kind: 'scene', label: 'COLD OPEN · ACT 1' }],
      [
        { id: 'a1', kind: 'decision', label: 'TRUST THE SIGNAL?' }
      ],
      [
        { id: 'b1', kind: 'scene', label: 'UPLINK · WAREHOUSE' },
        { id: 'b2', kind: 'scene', label: 'BLACKOUT · ROOFTOP' },
      ],
      [
        { id: 'c1', kind: 'decision', label: 'ENCRYPT / BROADCAST' },
        { id: 'c2', kind: 'decision', label: 'FLEE / CONFRONT' },
      ],
      [
        { id: 'd1', kind: 'scene', label: 'INTERCEPT' },
        { id: 'd2', kind: 'scene', label: 'REVEAL' },
        { id: 'd3', kind: 'scene', label: 'FRAGMENT' },
      ],
      [
        { id: 'e1', kind: 'terminal', label: 'ENDING · ASCENT' },
        { id: 'e2', kind: 'terminal', label: 'ENDING · COLLAPSE' },
        { id: 'e3', kind: 'terminal', label: 'ENDING · LOOP' },
      ],
    ];
    const links = [
      ['open', 'a1'],
      ['a1', 'b1'], ['a1', 'b2'],
      ['b1', 'c1'], ['b2', 'c2'],
      ['c1', 'd1'], ['c1', 'd2'],
      ['c2', 'd2'], ['c2', 'd3'],
      ['d1', 'e1'], ['d2', 'e2'], ['d3', 'e3'],
    ];

    const byId = {};
    cols.forEach((col, ci) => col.forEach((n, ni) => {
      n._col = ci; n._row = ni; n._rowCount = col.length;
      byId[n.id] = n;
    }));

    const palette = {
      scene:    '#7a5cff',
      decision: '#59f0ff',
      terminal: '#ff3cf0',
    };

    let t0 = performance.now();
    const resize = () => {
      const r = graph.getBoundingClientRect();
      w = r.width; h = r.height;
      graph.width = Math.floor(w * DPR);
      graph.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      position();
    };
    const position = () => {
      const padX = 60, padY = 30;
      const colW = (w - padX * 2) / (cols.length - 1 || 1);
      cols.forEach((col, ci) => {
        const rowH = (h - padY * 2) / col.length;
        col.forEach((n, ri) => {
          n.x = padX + colW * ci;
          n.y = padY + rowH * ri + rowH / 2;
        });
      });
    };
    resize();
    addEventListener('resize', resize);

    const drawLink = (a, b, activity) => {
      const midX = (a.x + b.x) / 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.bezierCurveTo(midX, a.y, midX, b.y, b.x, b.y);
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, palette[a.kind] + 'cc');
      grad.addColorStop(1, palette[b.kind] + 'cc');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 + activity * 1.5;
      ctx.shadowBlur = 10 + activity * 12;
      ctx.shadowColor = palette[a.kind];
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawNode = (n, pulse) => {
      const color = palette[n.kind];
      ctx.fillStyle = 'rgba(6,8,18,0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 16 + pulse * 18;
      ctx.shadowColor = color;
      roundRect(ctx, n.x - 62, n.y - 18, 124, 36, 10);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(n.x - 50, n.y, 4, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#e8ecff';
      ctx.font = '500 10.5px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const label = n.label.length > 18 ? n.label.slice(0, 17) + '…' : n.label;
      ctx.fillText(label, n.x - 40, n.y + 0.5);
    };

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    // animated "playhead" traveling a random path each pass
    let activePath = [];
    let phase = 0;
    const pickPath = () => {
      const starts = cols[0];
      let current = starts[Math.floor(Math.random() * starts.length)];
      const path = [current];
      while (true) {
        const outs = links.filter(l => l[0] === current.id).map(l => byId[l[1]]);
        if (!outs.length) break;
        const next = outs[Math.floor(Math.random() * outs.length)];
        path.push(next);
        current = next;
      }
      activePath = path;
      phase = 0;
    };
    pickPath();

    const loop = () => {
      if (prefersReduced) { renderStatic(); return; }
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // background glow
      const bg = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, Math.max(w,h)/1.3);
      bg.addColorStop(0, 'rgba(89,240,255,.04)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

      // links
      links.forEach(([aId, bId]) => {
        const a = byId[aId], b = byId[bId];
        let activity = 0;
        for (let i = 0; i < activePath.length - 1; i++) {
          if (activePath[i].id === aId && activePath[i + 1].id === bId) activity = 1;
        }
        drawLink(a, b, activity * (0.5 + 0.5 * Math.sin(t * 4)));
      });

      // playhead progress along active path
      phase += 0.012;
      const pathIdx = phase;
      const segIndex = Math.floor(pathIdx);
      const segT = pathIdx - segIndex;
      if (segIndex >= activePath.length - 1) { setTimeout(pickPath, 900); }
      else {
        const a = activePath[segIndex];
        const b = activePath[segIndex + 1];
        const midX = (a.x + b.x) / 2;
        const hx = bezier(a.x, midX, midX, b.x, segT);
        const hy = bezier(a.y, a.y,    b.y, b.y, segT);
        const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 22);
        grd.addColorStop(0, 'rgba(255,255,255,.95)');
        grd.addColorStop(0.5, 'rgba(89,240,255,.6)');
        grd.addColorStop(1, 'rgba(89,240,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); ctx.fill();
      }

      // nodes
      cols.flat().forEach(n => {
        const onPath = activePath.includes(n);
        const pulse = onPath ? (0.5 + 0.5 * Math.sin(t * 5)) : 0;
        drawNode(n, pulse);
      });

      requestAnimationFrame(loop);
    };

    const renderStatic = () => {
      ctx.clearRect(0,0,w,h);
      links.forEach(([aId, bId]) => drawLink(byId[aId], byId[bId], 0.3));
      cols.flat().forEach(n => drawNode(n, 0));
    };

    const bezier = (p0, p1, p2, p3, t) => {
      const mt = 1 - t;
      return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
    };

    const gio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { requestAnimationFrame(loop); gio.unobserve(en.target); } });
    }, { threshold: 0.25 });
    gio.observe(graph);
  }

})();
