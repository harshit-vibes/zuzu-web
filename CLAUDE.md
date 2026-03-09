# CLAUDE.md — zuzu-web (Landing Page)

## Overview

Landing page for zuzu.codes. Static Next.js app with GSAP + Motion animations.
Deployed to `zuzu.codes` via Vercel.

## Dev & Deploy

```bash
npm run dev      # localhost:3000
npm run build    # verify before deploy
vercel --prod    # deploy to zuzu.codes
```

## Key Files

```
src/app/page.tsx                      # Homepage (all sections)
src/app/learn/page.tsx                # /learn — course catalog
src/components/landing/              # All landing page sections
  header.tsx                         # Nav with anchor links (use /#anchor not #anchor)
  footer.tsx                         # Footer links
  hero-section.tsx
  method-section.tsx
  pricing-section.tsx
  courses-section.tsx
  faq-section.tsx
  social-proof-section.tsx
  footer-cta-section.tsx
src/lib/learn-data.ts                 # Course data for /learn page
src/lib/constants.ts                  # WHATSAPP_URL and shared constants
```

## Styling

Tailwind CSS v4 + CSS variables. Dark mode via `next-themes`.
Custom utilities in `src/app/globals.css`:
`neural-grid`, `glass-premium`, `card-lift`, `btn-shimmer`, `gradient-border-animated`,
`text-reveal`, `fade-in-up`, `stagger-*`

## Anchor Links

All anchor links in header/footer MUST use `/#anchor` (not `#anchor`) so they
resolve correctly when on subpages like `/learn`.

## Vercel Project

Project ID: `prj_Z2zy9PWZwAUdB7YHownBWM0XBahc`
GitHub: `harshit-vibes/zuzu-web`

## Before Launch

- Replace `$XX` price placeholders in `pricing-section.tsx`
- Replace placeholder testimonials in `social-proof-section.tsx`
