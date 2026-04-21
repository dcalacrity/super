/* =============================================================
   D.C. ALACRITY — dynamic interactions
   Hero constellation canvas · HUD telemetry · node-graph ·
   scroll reveals · typed title · count-ups · nav state ·
   pipeline playback · form pills · live timecode
   ============================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Utilities ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Year / build hash ----------
  $('#year').textContent = new Date().getFullYear();
  const buildHash = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(b => b.toString(16).padStart(2, '0')).join('.') + '.zta';
  $('#buildHash').textContent = buildHash;

  // ---------- Nav scroll state ----------
  const nav = $('#nav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Hero reveal + line stagger ----------
  const hero = $('#hero');
  $$('.hero__title .line').forEach((el, i) => el.style.setProperty('--i', i));
  requestAnimationFrame(() => hero.classList.add('is-in'));

  // ---------- Typed accent on final hero line ----------
  const typeTarget = $('[data-type]');
  if (typeTarget && !prefersReducedMotion) {
    const finalText = typeTarget.textContent.trim();
    typeTarget.textContent = '';
    let i = 0;
    const tick = () => {
      if (i <= finalText.length) {
        typeTarget.textContent = finalText.slice(0, i);
        i++;
        setTimeout(tick, 55 + Math.random() * 40);
      } else {
        typeTarget.insertAdjacentHTML('beforeend', '<span class="caret">▌</span>');
      }
    };
    setTimeout(tick, 1400);
  }

  // ---------- Count-ups ----------
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(v) : v.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        runCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  // ---------- Generic reveal ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  $$('[data-reveal], .pipeline').forEach(el => revealObserver.observe(el));

  // ---------- Live HUD: timecode + jittery latency + edge rotation ----------
  const tcEl   = $('#hudTC');
  const latEl  = $('#hudLat');
  const edgeEl = $('#hudEdge');
  const edges = ['IAD1', 'SFO3', 'LHR2', 'FRA1', 'NRT1', 'SYD1'];
  const frameRate = 23.976;
  let tcFrame = 0;
  const tickHud = () => {
    tcFrame++;
    const totalFrames = tcFrame;
    const totalSeconds = totalFrames / frameRate;
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = Math.floor(totalSeconds % 60);
    const ff = Math.floor(totalFrames % frameRate);
    const pad = n => String(n).padStart(2, '0');
    if (tcEl) tcEl.textContent = `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
  };
  setInterval(tickHud, 1000 / frameRate);
  setInterval(() => {
    if (latEl)  latEl.textContent  = String(8 + Math.floor(Math.random() * 14));
    if (edgeEl) edgeEl.textContent = edges[Math.floor(Math.random() * edges.length)];
  }, 2200);

  // ---------- Hero constellation canvas ----------
  const canvas = $('#heroCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, DPR, nodes, mouse = { x: -9999, y: -9999 };

    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth = hero.offsetWidth;
      H = canvas.clientHeight = hero.offsetHeight;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const density = Math.max(50, Math.round((W * H) / 22000));
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
        hue: Math.random() < 0.5 ? 'warm' : 'cool'
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, W, H);

      // nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        // mouse repel
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160) {
          const d = Math.sqrt(d2) || 1;
          n.x += (dx / d) * 0.8;
          n.y += (dy / d) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.hue === 'warm'
          ? 'rgba(255,140,59,.7)'
          : 'rgba(0,229,255,.7)';
        ctx.fill();
      }

      // connections
      const maxDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.35;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(255,140,59,${alpha})`);
            grad.addColorStop(1, `rgba(0,229,255,${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(step);
    };

    resize();
    step();
    window.addEventListener('resize', resize);
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  }

  // ---------- Node graph (Alacrity Hub mockup) ----------
  const edgesG = $('#graphEdges');
  const nodesG = $('#graphNodes');
  if (edgesG && nodesG) {
    /** Branching narrative: start → 2 → 4 → 1 */
    const nodeData = [
      { id: 'S',  x:  50, y: 180, label: 'OPEN',     kind: 'start' },
      { id: 'A1', x: 190, y:  80, label: 'MEET_X',   kind: 'scene' },
      { id: 'A2', x: 190, y: 280, label: 'INTERCEPT',kind: 'scene' },
      { id: 'B1', x: 340, y:  40, label: 'BETRAY',   kind: 'scene' },
      { id: 'B2', x: 340, y: 130, label: 'ALLY',     kind: 'scene' },
      { id: 'B3', x: 340, y: 240, label: 'ENCRYPT',  kind: 'scene' },
      { id: 'B4', x: 340, y: 320, label: 'FLEE',     kind: 'scene' },
      { id: 'E',  x: 510, y: 180, label: 'EPILOGUE', kind: 'end'   }
    ];
    const edgeData = [
      ['S','A1'], ['S','A2'],
      ['A1','B1'], ['A1','B2'],
      ['A2','B3'], ['A2','B4'],
      ['B1','E'], ['B2','E'], ['B3','E'], ['B4','E']
    ];

    const byId = Object.fromEntries(nodeData.map(n => [n.id, n]));

    // edges
    for (const [a,b] of edgeData) {
      const n1 = byId[a], n2 = byId[b];
      const mx = (n1.x + n2.x) / 2;
      const d = `M ${n1.x+56} ${n1.y} C ${mx} ${n1.y}, ${mx} ${n2.y}, ${n2.x} ${n2.y}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'graph-edge');
      path.setAttribute('d', d);
      edgesG.appendChild(path);
    }

    // nodes
    nodeData.forEach((n, idx) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'graph-node' + (n.kind === 'start' ? ' is-start' : n.kind === 'end' ? ' is-end' : ''));
      g.setAttribute('transform', `translate(${n.x}, ${n.y - 14})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', 56);
      rect.setAttribute('height', 28);
      rect.setAttribute('rx', 6);
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', 28);
      text.setAttribute('y', 18);
      text.setAttribute('text-anchor', 'middle');
      text.textContent = n.label;
      g.appendChild(text);

      g.addEventListener('mouseenter', () => g.classList.add('is-active'));
      g.addEventListener('mouseleave', () => g.classList.remove('is-active'));

      nodesG.appendChild(g);
    });

    // cycle highlight to feel alive
    let cycle = 0;
    setInterval(() => {
      const all = nodesG.querySelectorAll('.graph-node');
      all.forEach(n => n.classList.remove('is-active'));
      const pick = all[cycle % all.length];
      if (pick) pick.classList.add('is-active');
      cycle++;
    }, 1400);
  }

  // ---------- Terminal: replay when visible ----------
  const replayTerminal = (el) => {
    if (!el || prefersReducedMotion) return;
    const original = el.innerHTML;
    el.innerHTML = '';
    const plain = el;
    // Build character stream preserving inline spans
    const stream = [];
    const tmp = document.createElement('div');
    tmp.innerHTML = original;
    const walk = (node) => {
      if (node.nodeType === 3) {
        for (const ch of node.textContent) stream.push({ t: 'char', v: ch });
      } else if (node.nodeType === 1) {
        stream.push({ t: 'open', tag: node.tagName.toLowerCase(), cls: node.className });
        node.childNodes.forEach(walk);
        stream.push({ t: 'close' });
      }
    };
    tmp.childNodes.forEach(walk);

    let cursor = plain;
    let i = 0;
    const stack = [plain];
    const type = () => {
      if (i >= stream.length) return;
      const token = stream[i++];
      if (token.t === 'open') {
        const tag = document.createElement(token.tag);
        if (token.cls) tag.className = token.cls;
        stack[stack.length - 1].appendChild(tag);
        stack.push(tag);
      } else if (token.t === 'close') {
        stack.pop();
      } else {
        stack[stack.length - 1].appendChild(document.createTextNode(token.v));
      }
      // speed per char
      const delay = token.t === 'char' ? (token.v === '\n' ? 40 : 6 + Math.random() * 12) : 0;
      setTimeout(type, delay);
    };
    type();
  };

  const termObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        replayTerminal(e.target);
        termObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.35 });
  const buildTerm = $('#buildTerm');
  const scanTerm  = $('#scanTerm');
  if (buildTerm) termObs.observe(buildTerm);
  if (scanTerm)  termObs.observe(scanTerm);

  // ---------- Scope pills (contact form) ----------
  $$('.pill').forEach(p => {
    p.addEventListener('click', () => p.classList.toggle('is-active'));
  });

  // ---------- Parallax shift on hero HUD ----------
  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      const t = y / window.innerHeight;
      const hud = $('.hero__hud');
      if (hud) hud.style.transform = `translateY(${t * -40}px)`;
    }, { passive: true });
  }

  // ---------- Smooth anchor focus ----------
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- Subtle tilt on node-graph browser ----------
  const browser = $('.browser');
  if (browser && !prefersReducedMotion) {
    const rect = () => browser.getBoundingClientRect();
    browser.addEventListener('mousemove', (e) => {
      const r = rect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      browser.style.transform = `perspective(1200px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    });
    browser.addEventListener('mouseleave', () => {
      browser.style.transform = '';
    });
  }

  // ---------- Caret helper style (typed text) ----------
  const caretStyle = document.createElement('style');
  caretStyle.textContent = `
    .caret{ display:inline-block; margin-left:.08em; color:var(--ember);
      animation: blink 1s steps(2) infinite; font-style:normal;
      -webkit-text-fill-color: var(--ember); background:none;
    }
  `;
  document.head.appendChild(caretStyle);

})();
