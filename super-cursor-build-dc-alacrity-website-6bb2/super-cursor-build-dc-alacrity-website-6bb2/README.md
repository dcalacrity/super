# D.C. Alacrity — Website

The official marketing site for **D.C. Alacrity**, an AI-augmented, zero-trust
virtual production studio and media-tech consultancy. The site fuses the two
poles of the brand — cinematic warmth and edge-grade cybersecurity — into a
single dynamic, on-brand experience.

## Stack

Zero build tooling. Pure, hand-authored HTML / CSS / JS so it can be dropped
on any static host (Cloudflare Pages, Netlify, GitHub Pages, S3, etc.).

- `index.html` — semantic markup, all sections
- `styles.css` — complete brand system (tokens, typography, motion)
- `script.js` — dynamic interactions
- Google Fonts: Fraunces (display), Space Grotesk (body), JetBrains Mono (ui)

## Brand system

| Token | Value | Use |
|---|---|---|
| `--ink` | `#05070b` | cinema black background |
| `--bone` | `#f4ead5` | warm film bone (foreground) |
| `--ember` | `#ff8c3b` | signature cinema-warm accent |
| `--signal` | `#00e5ff` | signature cyber-cold accent |
| `--grad-seam` | ember → signal | "The Middle" — where creative meets technical |

Typography:
- **Fraunces** italic/display for poster-grade headlines
- **Space Grotesk** body for modern editorial flow
- **JetBrains Mono** for HUD, telemetry, and terminal UI

## Dynamic UI features

- Interactive hero constellation canvas (particles repel from cursor, warm/cool dual-hue connections)
- Live HUD telemetry: 23.976fps timecode, jittering edge latency, rotating edge POP
- "Alacrity Hub" interactive SVG node-graph (branching narrative with animated flow edges)
- "Alacrity Player" mocked Unity viewport with scanline sweep and hoverable choice chips
- Typewriter-replayed build + vulnerability-scan terminals (reveal on scroll)
- Four-layer animated zero-trust shield rings
- Cinematic duality panel: Creative vs Technical with a gradient "seam"
- Scroll-driven reveals, staggered pipeline reveal, hero line stagger
- Count-up stats, film grain, scanlines, vignette, editorial side-rails
- Perspective tilt on the Hub browser mock
- Marquee ticker for ecosystem keywords
- Functional-looking contact form with scope pills and uplink ack

All motion respects `prefers-reduced-motion`.

## Sections

1. Hero — manifesto headline + HUD
2. Manifesto — "we refuse to choose" + Creative/Technical duality
3. Ecosystem — four-stage pipeline (Script → Map → AI → Unity APK)
4. The Alacrity Hub — product feature + interactive node-graph
5. The Alacrity Player — product feature + Unity viewport + build terminal
6. Zero-Trust Architecture — layered shield + vuln-scan terminal
7. Markets Served — six verticals
8. Original Work — Sidequest, One Friday Night, Inside the Narrative
9. Founder — David-Chuku Agwu
10. Outlook — SaaS Flip, Immersive Consumption, Freelance Collective
11. Uplink — contact form

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No install, no build step, no framework. Just open `index.html`.
