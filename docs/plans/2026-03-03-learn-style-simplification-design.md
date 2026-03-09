# Learn Pages Style Simplification Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to implement this plan task-by-task.

**Goal:** Eliminate the opacity/color variant jungle in the /learn pages by adding a small CSS semantic primitive layer to globals.css, and flatten the component directory structure.

**Architecture:** Add intent-based utility classes to globals.css that encode repeated Tailwind combos. Move all learn-related components into a single `components/learn/` folder. No new abstraction layers — the primitives are plain CSS utility classes.

**Scope:** `web/` app only — `src/app/globals.css`, `src/components/learn/`, `src/components/learn-reader/`, `src/app/learn/`.

---

## Problem

- **15 unique opacity values** used across 6 files (/10 /15 /20 /25 /30 /40 /45 /50 /55 /60 /65 /70 /75 /80 /85 /90)
- **30 distinct color token variants** — same semantic intent expressed differently each time
- **2 micro-components** (`reading-progress.tsx`, `toc-sidebar.tsx`) isolated in a `learn-reader/` subfolder that only the course page uses
- Repeated Tailwind combos with no named intent: `font-mono text-[10px] uppercase tracking-[0.18em]` appears 8+ times inline

---

## Design

### 1. CSS Primitive Layer (globals.css additions)

Add a new `LEARN PRIMITIVES` section after the existing utilities. Four categories:

#### Typography intent classes
```css
/* Replaces: font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60 */
.label-track { @apply font-mono text-[10px] uppercase tracking-[0.18em] text-primary; }

/* Replaces: font-mono text-xs text-muted-foreground/60 tabular-nums */
.label-meta  { @apply font-mono text-xs text-muted-foreground/60 tabular-nums; }

/* Replaces: font-mono text-[11px] tabular-nums text-muted-foreground/50 */
.label-index { @apply font-mono text-[11px] tabular-nums text-muted-foreground/50; }

/* Replaces: text-sm text-muted-foreground leading-relaxed */
.text-body   { @apply text-sm text-muted-foreground leading-relaxed; }
```

#### Opacity scale — 4 steps only
Replace the 15-value opacity zoo with 4 semantic levels:
```css
/* Ghost: decorative-only elements (large index numbers, dividers) */
/* → use /20 */

/* Subtle: quiet but present (secondary borders, inactive ToC items) */
/* → use /50 */

/* Muted: readable secondary text (labels, meta info) */
/* → use /70 */

/* Soft: near-full (body text softening, hover states) */
/* → use /90 */
```
Eliminate: /10, /15, /25, /30, /40, /45, /55, /60, /65, /75, /80, /85
Consolidate to: /20, /50, /70, /90 — plus full opacity (no modifier) for primary text.

#### Card / surface patterns
```css
/* Replaces: rounded-xl border border-border/50 bg-card/50 */
.card-outline { @apply rounded-xl border border-border/50 bg-card/50; }

/* Replaces: rounded-xl border border-border/50 bg-muted/20 px-5 py-4 */
.card-inset   { @apply rounded-xl border border-border/50 bg-muted/20; }

/* Replaces: rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] to-transparent */
.card-cta     { @apply rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] to-transparent; }
```

#### Divider
```css
/* Replaces: border-b border-border/50 */
.divider      { @apply border-b border-border/50; }
```

### 2. Component Directory Flattening

**Before:**
```
components/
  learn/
    lesson-markdown.tsx
  learn-reader/
    reading-progress.tsx
    toc-sidebar.tsx
```

**After:**
```
components/
  learn/
    lesson-markdown.tsx
    reading-progress.tsx    ← moved from learn-reader/
    toc-sidebar.tsx         ← moved from learn-reader/
```

Delete `components/learn-reader/`. Update imports in `app/learn/[courseSlug]/page.tsx`.

### 3. Apply Primitives in /learn Pages

Update `app/learn/page.tsx` and `app/learn/[courseSlug]/page.tsx` to use the new primitive classes:
- Replace inline opacity combos with the 4-step scale (/20, /50, /70, /90)
- Replace repeated Tailwind combos with `.label-track`, `.label-meta`, `.label-index`, `.text-body`
- Replace card surface patterns with `.card-outline`, `.card-inset`, `.card-cta`
- Replace border-b combos with `.divider`

Update `toc-sidebar.tsx` similarly — replace opacity variants with the 4-step scale.

### 4. No Changes To

- `lesson-markdown.tsx` — the zinc-950 code block colors are intentional (not part of the semantic token system), keep as-is
- `reading-progress.tsx` — already minimal (23 lines), keep as-is
- `globals.css` existing utilities — landing page classes stay, we only ADD the learn primitives section
- `learn-data.ts` — data layer untouched

---

## Success Criteria

- Opacity values in /learn pages: 15 → 4
- Color token variants: 30 → ~15
- Component directories for /learn: 2 → 1
- `components/learn-reader/` deleted
- Type check passes (`npx tsc --noEmit`)
- No visual regressions — same design, cleaner source

---

## Files Touched

| File | Change |
|------|--------|
| `src/app/globals.css` | Add `LEARN PRIMITIVES` section with 8 utility classes |
| `src/components/learn/reading-progress.tsx` | Moved (import path only) |
| `src/components/learn/toc-sidebar.tsx` | Moved + apply 4-step opacity |
| `src/components/learn-reader/` | Deleted |
| `src/app/learn/page.tsx` | Apply primitives |
| `src/app/learn/[courseSlug]/page.tsx` | Apply primitives + update imports |
