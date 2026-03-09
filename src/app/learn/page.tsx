import Link from 'next/link'
import { getPublicCoursesWithStats } from '@/lib/learn-data'
import type { PublicCourseWithStats } from '@/lib/learn-data'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Python Lessons | zuzu.codes',
  description: 'Free Python tutorials — functions, control flow, and more. Structured for beginners. Read free, practice in the playground.',
  alternates: { canonical: 'https://zuzu.codes/learn' },
}

const TRACK_META: Record<string, { name: string; description: string; colorClass: string }> = {
  'python-foundations': {
    name: 'Python Foundations',
    description: 'Build a solid base — variables, types, functions, and control flow.',
    colorClass: 'bg-amber-500',
  },
  'pydantic-ai': {
    name: 'Pydantic & AI',
    description: 'Data validation, type safety, and AI-ready Python patterns.',
    colorClass: 'bg-orange-600',
  },
  'agent-builders': {
    name: 'Agent Builders',
    description: 'From APIs to production AI agents.',
    colorClass: 'bg-indigo-500',
  },
}

// Ordered track slugs — controls display order on the page
const TRACK_ORDER = ['python-foundations', 'pydantic-ai', 'agent-builders']

export default async function LearnIndexPage() {
  const courses = await getPublicCoursesWithStats()

  // Group courses by track slug
  const trackMap = new Map<string, PublicCourseWithStats[]>()
  const standalone: PublicCourseWithStats[] = []

  for (const course of courses) {
    const trackSlug = course.tag
    if (trackSlug && TRACK_META[trackSlug]) {
      if (!trackMap.has(trackSlug)) trackMap.set(trackSlug, [])
      trackMap.get(trackSlug)!.push(course)
    } else {
      standalone.push(course)
    }
  }

  // Build ordered track list
  const tracks = TRACK_ORDER
    .filter(slug => trackMap.has(slug))
    .map(slug => ({
      slug,
      ...TRACK_META[slug],
      courses: trackMap.get(slug)!,
    }))

  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      {/* Page header */}
      <div className="mb-14">
        <p className="text-sm font-mono text-primary/70 tracking-wider uppercase mb-2">Free lessons</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight mb-3">Python Lessons</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Structured Python tutorials. Read the theory free. Practice in the playground.
        </p>
      </div>

      {/* Track sections */}
      <div className="space-y-16">
        {tracks.map(track => (
          <section key={track.slug} id={track.slug}>
            {/* Track header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-1 h-8 rounded-full ${track.colorClass}`} />
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{track.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{track.description}</p>
              </div>
            </div>

            {/* Course cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {track.courses.map(course => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>
        ))}

        {/* Standalone courses (no track) */}
        {standalone.length > 0 && (
          <section id="more-courses">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-muted-foreground/30" />
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">More Courses</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Additional tutorials and guides.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {standalone.map(course => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: PublicCourseWithStats }) {
  return (
    <Link
      href={`/learn/${course.slug}`}
      className="group block rounded-xl border border-border/50 bg-card p-5 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1.5 block">
        {course.tag}
      </span>
      <h3 className="text-base font-semibold group-hover:text-primary transition-colors leading-snug">
        {course.title}
      </h3>
      <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed line-clamp-2">
        {course.description}
      </p>
      <p className="text-xs text-muted-foreground/50 font-mono mt-3">
        {course.moduleCount} modules · {course.lessonCount} lessons
      </p>
    </Link>
  )
}
