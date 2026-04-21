# D.C. Alacrity — Website

A dynamic, brand-forward single-page site for **D.C. Alacrity**, the AI-augmented, zero-trust virtual production studio & media-tech consultancy founded by David-Chuku Agwu.

## On-brand pillars reflected in the UI

- **Zero-trust cinema** — a four-layer defense model panel (Cloudflare Worker, TLS 1.3, Firebase Auth, Realtime DB rules) with an animated terminal typing a live vulnerability-scan that resolves to `0 / 0 critical · high`.
- **Alacrity Hub + Player ecosystem** — a live, animated **story-graph** canvas that mirrors the Hub's node-based branching narrative visualizer, with a "playhead" traveling random paths across scenes, decisions, and endings.
- **AI-augmented energy** — a neural lightning canvas in the hero, pointer-reactive, with arcing bolts between drifting nodes.
- **Aerospace-grade precision** — HUD overlay, telemetry scroll bar, scramble-text, monospace chrome, and graded meter bars for the founder's discipline stack.
- **Interactive VR / branching future** — the marquee, glitch posters for _Sidequest_, _One Friday Night_, and the VR R&D pipeline, plus a markets grid (B2B tech, HR/compliance, defense, healthcare/legal, SaaS flip, VR).

## Stack

Pure static site — zero build step, zero dependencies.

- `index.html` — full page structure with semantic sections (Hero, Philosophy, Ecosystem, Story Graph, Security, Ventures, Markets, Founder, Contact).
- `styles.css` — brand system (deep-space blue / electric cyan / violet plasma / magenta edge), typography (Space Grotesk display + Inter body + JetBrains Mono for code), reveals, tilt cards, glitch posters, terminal chrome.
- `script.js` — scroll telemetry, custom cursor halo, magnetic CTAs, reveal-on-scroll, text scramble, terminal typewriter, hero lightning canvas, and a procedural story-graph renderer.
- `assets/favicon.svg`, `assets/og.svg` — brand mark + OpenGraph card.

## Run locally

Just open `index.html` in a browser, or serve:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Accessibility

- Respects `prefers-reduced-motion` (static graph render, disabled canvas animation).
- Focusable form controls with visible focus glow.
- Semantic landmarks (`header`, `main`, `section`, `footer`) and `aria-label`s on interactive icons.
