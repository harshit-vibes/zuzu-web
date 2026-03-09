# Learn Style Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 15-opacity-value, 30-color-variant jungle in the /learn pages with 8 CSS semantic primitives in globals.css, and collapse two component directories into one.

**Architecture:** Add a `LEARN — SEMANTIC PRIMITIVES` section to `globals.css` with `@apply`-based utility classes. Move `reading-progress.tsx` and `toc-sidebar.tsx` from `components/learn-reader/` into `components/learn/`. Rewrite both page files to use the new primitives and the 4-step opacity scale (/20 ghost · /50 subtle · /70 muted · /90 soft).

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (`@apply` in `globals.css`), TypeScript. No new packages.

---

### Task 1: Add LEARN PRIMITIVES section to globals.css

**Files:**
- Modify: `web/src/app/globals.css` — insert before the `/* Reduced Motion Support */` block (line ~412)

**Step 1: Insert the primitives block**

Add this block immediately before the `/* Reduced Motion Support */` comment:

```css
/* ═══════════════════════════════════════════════════════════════════
   LEARN — SEMANTIC PRIMITIVES
   Opacity scale: /20 ghost · /50 subtle · /70 muted · /90 soft
   ═══════════════════════════════════════════════════════════════════ */

/* Typography */
.label-track { @apply font-mono text-[10px] uppercase tracking-[0.18em] text-primary; }
.label-meta  { @apply font-mono text-xs text-muted-foreground/70 tabular-nums; }
.label-index { @apply font-mono text-[11px] tabular-nums text-muted-foreground/50; }
.text-body   { @apply text-sm text-muted-foreground leading-relaxed; }

/* Surfaces */
.card-outline { @apply rounded-xl border border-border/50 bg-card/50; }
.card-inset   { @apply rounded-xl border border-border/50 bg-muted/20; }
.card-cta     { @apply rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] to-transparent; }

/* Divider */
.divider { @apply border-b border-border/50; }

```

**Step 2: Verify build**

```bash
cd web && npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add learn semantic primitives to globals.css"
```

---

### Task 2: Move toc-sidebar.tsx → components/learn/ and apply 4-step opacity

**Files:**
- Delete: `web/src/components/learn-reader/toc-sidebar.tsx`
- Create: `web/src/components/learn/toc-sidebar.tsx`

**Step 1: Write the new file at the correct path**

`web/src/components/learn/toc-sidebar.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'

export interface TocItem {
  id: string
  label: string
  level: 'module' | 'lesson'
  orderLabel: string
}

interface TocSidebarProps {
  items: TocItem[]
}

export function TocSidebar({ items }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const topmost = visible.reduce((prev, cur) =>
            prev.boundingClientRect.top < cur.boundingClientRect.top ? prev : cur
          )
          setActiveId(topmost.target.id)
        }
      },
      { rootMargin: '-10% 0% -65% 0%', threshold: 0 }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
        <p className="label-index text-[9px] tracking-[0.18em] mb-3 px-2">Contents</p>
        <nav aria-label="Table of contents">
          <ol className="space-y-0.5">
            {items.map(item => {
              const isActive = activeId === item.id
              const isModule = item.level === 'module'
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`flex items-center gap-2 rounded-md py-1.5 text-[11px] leading-snug transition-all duration-150 ${
                      isModule ? 'px-2' : 'px-2 pl-6'
                    } ${
                      isActive
                        ? 'text-primary bg-primary/10 font-medium'
                        : isModule
                        ? 'text-foreground/50 hover:text-foreground hover:bg-muted/50'
                        : 'text-muted-foreground/50 hover:text-foreground/70 hover:bg-muted/20'
                    }`}
                  >
                    <span className={`font-mono shrink-0 text-[9px] w-5 text-right tabular-nums ${
                      isActive ? 'text-primary/50' : 'text-muted-foreground/20'
                    }`}>
                      {item.orderLabel}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </aside>
  )
}
```

Key opacity changes vs old file:
- `text-foreground/55` → `text-foreground/50`
- `text-foreground/45` → `text-foreground/50`
- `text-muted-foreground/45` → `text-muted-foreground/50`
- `bg-primary/[0.08]` → `bg-primary/10`
- `text-muted-foreground/25` → `text-muted-foreground/20`

**Step 2: Delete old file**

```bash
rm web/src/components/learn-reader/toc-sidebar.tsx
```

**Step 3: Verify**

```bash
cd web && npx tsc --noEmit
```
Expected: error on `app/learn/[courseSlug]/page.tsx` — import still points to old path. That's fixed in Task 5.

**Step 4: Commit**

```bash
git add src/components/learn/toc-sidebar.tsx
git rm src/components/learn-reader/toc-sidebar.tsx
git commit -m "refactor: move toc-sidebar into components/learn/, apply 4-step opacity"
```

---

### Task 3: Move reading-progress.tsx → components/learn/

**Files:**
- Delete: `web/src/components/learn-reader/reading-progress.tsx`
- Create: `web/src/components/learn/reading-progress.tsx`

**Step 1: Write the new file**

`web/src/components/learn/reading-progress.tsx` — content is identical, only the path changes:

```tsx
'use client'
import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[2px] bg-primary transition-[width] duration-75 ease-linear"
      style={{ width: `${progress}%` }}
    />
  )
}
```

**Step 2: Delete old file and directory**

```bash
rm web/src/components/learn-reader/reading-progress.tsx
rmdir web/src/components/learn-reader
```

**Step 3: Commit**

```bash
git add src/components/learn/reading-progress.tsx
git rm src/components/learn-reader/reading-progress.tsx
git commit -m "refactor: move reading-progress into components/learn/, delete learn-reader/"
```

---

### Task 4: Apply primitives in learn/page.tsx

**Files:**
- Modify: `web/src/app/learn/page.tsx`

**Step 1: Rewrite the file**

Full replacement of `web/src/app/learn/page.tsx`:

```tsx
import Link from 'next/link'
import { getPublicCourses } from '@/lib/learn-data'
import type { Metadata } from 'next'
import type { PublicCourse } from '@/lib/learn-data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Learn | zuzu.codes',
  description: 'Free Python tutorials — functions, control flow, and more. Read the theory free, practice in the playground.',
  alternates: { canonical: 'https://zuzu.codes/learn' },
}

export default async function LearnIndexPage() {
  const courses = await getPublicCourses()

  const trackMap = new Map<string, PublicCourse[]>()
  for (const course of courses) {
    const key = course.tag || 'General'
    if (!trackMap.has(key)) trackMap.set(key, [])
    trackMap.get(key)!.push(course)
  }

  return (
    <div className="min-h-screen">

      {/* Page header */}
      <div className="divider">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <p className="label-track mb-4">zuzu.codes / learn</p>
          <h1 className="font-display text-5xl font-semibold tracking-tight mb-4 leading-tight">
            Learning Tracks
          </h1>
          <p className="text-body text-lg">
            Structured lessons on Python and beyond. Read the theory free — then write real code in the playground.
          </p>
        </div>
      </div>

      {/* Track sections */}
      <div className="container mx-auto px-6 py-14 max-w-4xl">
        <div className="space-y-16">
          {Array.from(trackMap.entries()).map(([track, trackCourses], trackIdx) => (
            <section key={track}>

              {/* Track label + rule */}
              <div className="flex items-center gap-4 mb-7">
                <span className="label-index text-[10px] shrink-0">
                  {String(trackIdx + 1).padStart(2, '0')}
                </span>
                <span className="label-track bg-primary/10 border border-primary/20 rounded-full px-3 py-1 shrink-0">
                  {track}
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              {/* Course cards */}
              <div className="space-y-3 ml-9">
                {trackCourses.map((course, courseIdx) => (
                  <Link
                    key={course.slug}
                    href={`/learn/${course.slug}`}
                    className="card-outline group flex items-start gap-5 px-6 py-5 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200"
                  >
                    <span className="font-mono text-3xl font-light text-muted-foreground/20 leading-none tabular-nums select-none shrink-0 pt-0.5">
                      {String(courseIdx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors leading-snug">
                        {course.title}
                      </h2>
                      <p className="text-body line-clamp-2">{course.description}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/70 transition-all group-hover:translate-x-0.5 shrink-0 mt-1"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify**

```bash
cd web && npx tsc --noEmit
```
Expected: no new errors (existing import error from Task 2 still present, fixed in Task 5).

**Step 3: Commit**

```bash
git add src/app/learn/page.tsx
git commit -m "refactor: apply learn primitives in learn/page.tsx"
```

---

### Task 5: Apply primitives + fix imports in learn/[courseSlug]/page.tsx

**Files:**
- Modify: `web/src/app/learn/[courseSlug]/page.tsx`

**Step 1: Rewrite the file**

Full replacement of `web/src/app/learn/[courseSlug]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicCourseComplete, getAllPublicCourseSlugs, toSlug } from '@/lib/learn-data'
import { LessonMarkdown } from '@/components/learn/lesson-markdown'
import { ReadingProgress } from '@/components/learn/reading-progress'
import { TocSidebar } from '@/components/learn/toc-sidebar'
import { SIGN_IN_URL } from '@/lib/get-sign-up-url'
import type { Metadata } from 'next'
import type { PublicCourseComplete, QuizQuestion } from '@/lib/learn-data'
import type { TocItem } from '@/components/learn/toc-sidebar'

export const revalidate = 3600

interface Props { params: Promise<{ courseSlug: string }> }

export async function generateStaticParams() {
  return getAllPublicCourseSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params
  const course = await getPublicCourseComplete(courseSlug)
  if (!course) return {}
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0)
  return {
    title: `${course.title} — Complete Python Tutorial | zuzu.codes`,
    description: `${course.description} ${totalLessons} lessons across ${course.modules.length} modules. Free to read.`,
    alternates: { canonical: `https://zuzu.codes/learn/${courseSlug}` },
    openGraph: {
      type: 'article',
      title: `${course.title} | zuzu.codes`,
      description: course.description,
      url: `https://zuzu.codes/learn/${courseSlug}`,
    },
  }
}

function buildFaqItems(course: PublicCourseComplete) {
  const items: { q: string; a: string }[] = []
  for (const mod of course.modules) {
    for (const q of mod.quizQuestions as QuizQuestion[]) {
      const correctOption = q.options.find(o => o.id === q.correctOption)
      if (correctOption && q.explanation) {
        items.push({ q: q.statement, a: `${correctOption.text}. ${q.explanation}` })
      }
    }
    for (const lesson of mod.lessons) {
      if (!lesson.problemSummary) continue
      const firstLine = lesson.content.split('\n').find(l => l.trim() && !l.startsWith('#'))
      if (firstLine) {
        const q = lesson.problemSummary.endsWith('?')
          ? lesson.problemSummary
          : `How do I ${lesson.problemSummary.charAt(0).toLowerCase() + lesson.problemSummary.slice(1)}?`
        items.push({ q, a: firstLine.trim() })
      }
    }
  }
  return items
}

function buildJsonLd(course: PublicCourseComplete, faqItems: { q: string; a: string }[]) {
  const url = `https://zuzu.codes/learn/${course.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: course.title,
        description: course.description,
        url,
        provider: { '@type': 'Organization', name: 'zuzu.codes', url: 'https://zuzu.codes' },
        teaches: course.outcomes,
        educationalLevel: 'beginner',
        inLanguage: 'en',
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: `PT${course.modules.reduce((s, m) => s + m.lessons.length, 0)}H`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Learn', item: 'https://zuzu.codes/learn' },
          { '@type': 'ListItem', position: 2, name: course.title, item: url },
        ],
      },
      ...(faqItems.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }] : []),
    ],
  }
}

function buildTocItems(course: PublicCourseComplete, hasFaq: boolean): TocItem[] {
  const items: TocItem[] = []
  course.modules.forEach((mod, modIdx) => {
    items.push({
      id: mod.slug,
      label: mod.title,
      level: 'module',
      orderLabel: String(modIdx + 1).padStart(2, '0'),
    })
    mod.lessons.forEach(lesson => {
      items.push({
        id: `${mod.slug}--${toSlug(lesson.title)}`,
        label: lesson.title,
        level: 'lesson',
        orderLabel: String(lesson.order),
      })
    })
  })
  if (hasFaq) {
    items.push({ id: 'faq', label: 'FAQ', level: 'module', orderLabel: 'Q' })
  }
  return items
}

export default async function CourseLearnPage({ params }: Props) {
  const { courseSlug } = await params
  const course = await getPublicCourseComplete(courseSlug)
  if (!course) notFound()

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0)
  const faqItems = buildFaqItems(course)
  const jsonLd = buildJsonLd(course, faqItems)
  const tocItems = buildTocItems(course, faqItems.length > 0)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      <div className="container mx-auto px-6 py-12 max-w-6xl">

        {/* Breadcrumb */}
        <nav className="label-meta mb-10 flex items-center gap-1.5">
          <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
          <span className="text-border">/</span>
          <span className="text-foreground/70">{course.title}</span>
        </nav>

        {/* Course header */}
        <div className="divider mb-12 pb-10">
          <span className="label-track bg-primary/10 border border-primary/20 rounded-full px-3 py-1 inline-block mb-4">
            {course.tag}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4 leading-tight">
            {course.title}
          </h1>
          <p className="text-body text-lg mb-5 max-w-2xl">{course.description}</p>
          <p className="label-meta mb-5">
            {course.modules.length} modules · {totalLessons} lessons · free to read
          </p>
        </div>

        {/* Header CTA */}
        <div className="card-cta mb-12 p-8">
          <p className="font-display text-xl font-semibold mb-2 tracking-tight">
            Ready to write real code?
          </p>
          <p className="text-body mb-6 max-w-md">
            Theory is just the start. Write actual Python, run your tests, and build the problem-solving habit that sticks.
          </p>
          <a
            href={SIGN_IN_URL}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Open the playground →
          </a>
        </div>

        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-14">

          <TocSidebar items={tocItems} />

          <div className="min-w-0">

            {/* Outcomes */}
            {course.outcomes.length > 0 && (
              <div className="card-inset mb-12 p-6">
                <p className="label-index text-[10px] tracking-[0.15em] mb-4">
                  What you&apos;ll learn
                </p>
                <ul className="space-y-2.5">
                  {course.outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span className="text-primary mt-0.5 shrink-0 font-mono text-xs">✓</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modules */}
            <div className="space-y-20">
              {course.modules.map((mod, modIdx) => (
                <section key={mod.slug} id={mod.slug}>

                  <div className="divider mb-8 pb-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="label-index">{String(modIdx + 1).padStart(2, '0')}</span>
                      <h2 className="font-display text-2xl font-semibold tracking-tight">
                        {mod.title}
                      </h2>
                    </div>
                    <p className="text-body ml-8">{mod.description}</p>
                  </div>

                  <div className="space-y-16">
                    {mod.lessons.map(lesson => (
                      <section key={lesson.order} id={`${mod.slug}--${lesson.slug}`}>
                        <div className="flex items-baseline gap-3 mb-6">
                          <span className="label-index shrink-0">{lesson.order}.</span>
                          <h3 className="font-display text-xl font-semibold tracking-tight leading-snug">
                            {lesson.title}
                          </h3>
                        </div>

                        <div className="ml-7">
                          <LessonMarkdown content={lesson.content} />

                          {lesson.problemConstraints.length > 0 && (
                            <div className="card-inset mt-5 px-5 py-4">
                              <p className="label-index text-[10px] tracking-[0.15em] mb-3">
                                Constraints
                              </p>
                              <ul className="space-y-1.5">
                                {lesson.problemConstraints.map((c, i) => (
                                  <li key={i} className="text-sm text-foreground/70 flex items-start gap-2.5">
                                    <span className="text-primary/50 shrink-0 mt-0.5 font-mono text-xs">–</span>
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* FAQ */}
            {faqItems.length > 0 && (
              <section id="faq" className="mt-20 pt-10 border-t border-border/50">
                <h2 className="font-display text-2xl font-semibold mb-8 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <dl className="space-y-8">
                  {faqItems.map((item, i) => (
                    <div key={i} className="border-b border-border/50 pb-8 last:border-0 last:pb-0">
                      <dt className="font-semibold text-foreground mb-2.5 leading-snug">{item.q}</dt>
                      <dd className="text-body">{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* End CTA */}
            <div className="card-cta mt-16 p-8">
              <p className="font-display text-xl font-semibold mb-2 tracking-tight">
                Ready to write real code?
              </p>
              <p className="text-body mb-6 max-w-md">
                Theory is just the start. Write actual Python, run your tests, and build the problem-solving habit that sticks.
              </p>
              <a
                href={SIGN_IN_URL}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Open the playground →
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
```

**Step 2: Verify — type check must pass clean**

```bash
cd web && npx tsc --noEmit
```
Expected: **no errors**.

**Step 3: Commit**

```bash
git add src/app/learn/[courseSlug]/page.tsx
git commit -m "refactor: apply learn primitives in [courseSlug]/page.tsx, fix imports to components/learn/"
```

---

### Task 6: Final cleanup and verification

**Step 1: Confirm learn-reader/ is fully deleted**

```bash
ls web/src/components/learn-reader 2>/dev/null && echo "ERROR: dir still exists" || echo "OK: deleted"
```
Expected: `OK: deleted`

**Step 2: Confirm components/learn/ has all three files**

```bash
ls web/src/components/learn/
```
Expected: `lesson-markdown.tsx  reading-progress.tsx  toc-sidebar.tsx`

**Step 3: Confirm no remaining learn-reader imports**

```bash
grep -r "learn-reader" web/src/ && echo "ERROR: stale imports" || echo "OK: clean"
```
Expected: `OK: clean`

**Step 4: Confirm opacity scale — no banned values in /learn pages**

```bash
grep -En "/(15|25|30|40|45|55|60|65|75|80|85)" web/src/app/learn/page.tsx web/src/app/learn/[courseSlug]/page.tsx web/src/components/learn/toc-sidebar.tsx
```
Expected: **no output** (banned opacity values gone).

**Step 5: Final type check**

```bash
cd web && npx tsc --noEmit
```
Expected: no errors.

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: learn style simplification complete — 8 primitives, 4-step opacity, single components/learn/"
```
