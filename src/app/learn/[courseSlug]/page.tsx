import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicCourseComplete, getAllPublicCourseSlugs } from '@/lib/learn-data'
import { LessonMarkdown } from '@/components/learn/lesson-markdown'
import { SIGN_IN_URL } from '@/lib/get-sign-up-url'
import type { Metadata } from 'next'
import type { PublicCourseComplete, QuizQuestion } from '@/lib/learn-data'

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
    // Quiz questions → highest quality FAQ (real questions + authoritative answers)
    for (const q of mod.quizQuestions as QuizQuestion[]) {
      const correctOption = q.options.find(o => o.id === q.correctOption)
      if (correctOption && q.explanation) {
        items.push({
          q: q.statement,
          a: `${correctOption.text}. ${q.explanation}`,
        })
      }
    }
    // Lesson problem summaries → practical FAQ
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

export default async function CourseLearnPage({ params }: Props) {
  const { courseSlug } = await params
  const course = await getPublicCourseComplete(courseSlug)
  if (!course) notFound()

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0)
  const faqItems = buildFaqItems(course)
  const jsonLd = buildJsonLd(course, faqItems)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container mx-auto px-6 py-16 max-w-2xl">

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 flex items-center gap-1.5">
          <Link href="/learn" className="hover:text-foreground transition-colors">Lessons</Link>
          <span>/</span>
          <span className="text-foreground">{course.title}</span>
        </nav>

        {/* Course header */}
        <div className="mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-2 block">{course.tag}</span>
          <h1 className="font-display text-4xl font-semibold tracking-tight mb-3">{course.title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-3">{course.description}</p>
          <p className="text-sm text-muted-foreground/50 font-mono">
            {course.modules.length} modules · {totalLessons} lessons · free to read
          </p>
        </div>

        {/* Outcomes */}
        {course.outcomes.length > 0 && (
          <div className="mb-10 rounded-xl border border-border/40 bg-muted/10 p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">What you&apos;ll learn</p>
            <ul className="space-y-2">
              {course.outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-primary mt-0.5">✓</span>{o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Table of contents */}
        <nav className="mb-12 rounded-xl border border-border/40 bg-muted/10 p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">Contents</p>
          <ol className="space-y-3">
            {course.modules.map((mod, modIdx) => (
              <li key={mod.slug}>
                <a href={`#${mod.slug}`}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground/40 w-4 text-right">{modIdx + 1}</span>
                  {mod.title}
                </a>
                <ol className="mt-1.5 ml-6 space-y-1">
                  {mod.lessons.map(lesson => (
                    <li key={lesson.order}>
                      <a href={`#${mod.slug}--${lesson.slug}`}
                        className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2">
                        <span className="font-mono w-3 text-right text-muted-foreground/30">{lesson.order}</span>
                        {lesson.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
            {faqItems.length > 0 && (
              <li>
                <a href="#faq" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground/40 w-4 text-right">Q</span>
                  Frequently Asked Questions
                </a>
              </li>
            )}
          </ol>
        </nav>

        {/* All modules + lessons */}
        <div className="space-y-20">
          {course.modules.map((mod, modIdx) => (
            <section key={mod.slug} id={mod.slug}>

              {/* Module heading */}
              <h2 className="font-display text-2xl font-semibold tracking-tight mb-2 pb-3 border-b border-border/40">
                <span className="text-primary/30 font-mono text-sm mr-2">{String(modIdx + 1).padStart(2, '0')}</span>
                {mod.title}
              </h2>
              <p className="text-muted-foreground text-sm mb-10 leading-relaxed">{mod.description}</p>

              {/* Lessons */}
              <div className="space-y-14">
                {mod.lessons.map(lesson => (
                  <section key={lesson.order} id={`${mod.slug}--${lesson.slug}`}>
                    <h3 className="font-display text-xl font-semibold tracking-tight mb-5">
                      <span className="text-muted-foreground/30 font-mono text-xs mr-1.5">{lesson.order}.</span>
                      {lesson.title}
                    </h3>

                    <LessonMarkdown content={lesson.content} />

                    {lesson.problemConstraints.length > 0 && (
                      <div className="mt-4 rounded-lg border border-border/30 bg-muted/10 px-4 py-3">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-2">Constraints</p>
                        <ul className="space-y-1">
                          {lesson.problemConstraints.map((c, i) => (
                            <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                              <span className="text-primary/40 shrink-0 mt-0.5">–</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <a href={SIGN_IN_URL}
                      className="mt-4 inline-flex items-center gap-1 text-xs text-primary/50 hover:text-primary transition-colors font-mono">
                      Practice Lesson {lesson.order} →
                    </a>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ section — quiz questions + lesson problem summaries */}
        {faqItems.length > 0 && (
          <section id="faq" className="mt-20 pt-10 border-t border-border/30">
            <h2 className="font-display text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
            <dl className="space-y-7">
              {faqItems.map((item, i) => (
                <div key={i}>
                  <dt className="font-semibold text-foreground mb-2">{item.q}</dt>
                  <dd className="text-muted-foreground text-sm leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Course-level CTA */}
        <div className="mt-16 rounded-xl border border-primary/20 bg-primary/[0.04] p-6 text-center">
          <p className="text-sm font-medium mb-1">Ready to write code?</p>
          <p className="text-muted-foreground text-sm mb-4">
            Theory is just the start. Write real code, run tests, build the habit.
          </p>
          <a href={SIGN_IN_URL}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Open the playground →
          </a>
        </div>

      </div>
    </>
  )
}
