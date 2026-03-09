import postgres from 'postgres'

// Module-level singleton — calling postgres() on every request creates a new
// pool each time, stacking up open connections that exhaust the Session mode
// limit. One client per module lifetime; max:1 keeps the footprint serverless-safe.
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

// ── Slug helper ─────────────────────────────────────────────────────────────

export function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface PublicLesson {
  lessonIndex: number  // 0-based
  order: number        // 1-based
  title: string
  slug: string         // derived from title
  content: string
  problemSummary: string | null
  problemConstraints: string[]
}

interface QuizOption { id: string; text: string }
export interface QuizQuestion {
  id: string
  statement: string
  options: QuizOption[]
  correctOption: string
  explanation: string
}

export interface PublicModuleSection {
  id: string
  slug: string
  title: string
  description: string
  order: number
  lessons: PublicLesson[]
  quizQuestions: QuizQuestion[]
}

export interface PublicCourse {
  id: string
  title: string
  slug: string
  description: string
  outcomes: string[]
  tag: string
}

export interface PublicCourseWithStats extends PublicCourse {
  moduleCount: number
  lessonCount: number
}

export interface PublicCourseComplete extends PublicCourse {
  modules: PublicModuleSection[]
}

// ── Queries (unified nodes table) ────────────────────────────────────────────

export async function getPublicCourses(): Promise<PublicCourse[]> {
  const rows = await sql`
    SELECT id, title, slug, description, metadata, ordering
    FROM nodes
    WHERE type = 'group' AND parent_id IS NULL
    ORDER BY ordering
  `
  return rows.map(r => {
    const meta = (r.metadata ?? {}) as Record<string, unknown>
    return {
      id: r.id as string,
      title: r.title as string,
      slug: r.slug as string,
      description: (r.description ?? '') as string,
      outcomes: (meta.outcomes ?? []) as string[],
      tag: (meta.track ?? '') as string,
    }
  })
}

/** Courses with module + lesson counts, for the learn index page */
export async function getPublicCoursesWithStats(): Promise<PublicCourseWithStats[]> {
  const rows = await sql`
    SELECT
      c.id, c.title, c.slug, c.description, c.metadata, c.ordering,
      (SELECT COUNT(*)::int FROM nodes m WHERE m.type = 'group' AND m.parent_id = c.id) AS module_count,
      (SELECT COUNT(*)::int FROM nodes l
       JOIN nodes m ON m.id = l.parent_id
       WHERE l.type = 'content' AND m.type = 'group' AND m.parent_id = c.id) AS lesson_count
    FROM nodes c
    WHERE c.type = 'group' AND c.parent_id IS NULL
    ORDER BY c.ordering
  `
  return rows.map(r => {
    const meta = (r.metadata ?? {}) as Record<string, unknown>
    return {
      id: r.id as string,
      title: r.title as string,
      slug: r.slug as string,
      description: (r.description ?? '') as string,
      outcomes: (meta.outcomes ?? []) as string[],
      tag: (meta.track ?? '') as string,
      moduleCount: r.module_count as number,
      lessonCount: r.lesson_count as number,
    }
  })
}

/** Primary query — full course with all modules, all lessons, and all quiz questions */
export async function getPublicCourseComplete(courseSlug: string): Promise<PublicCourseComplete | null> {
  // Fetch course
  const courseRows = await sql`
    SELECT id, title, slug, description, metadata
    FROM nodes
    WHERE type = 'group' AND parent_id IS NULL AND slug = ${courseSlug}
  `
  if (courseRows.length === 0) return null
  const c = courseRows[0]
  const courseMeta = (c.metadata ?? {}) as Record<string, unknown>

  // Fetch modules (group nodes whose parent is this course)
  const moduleRows = await sql`
    SELECT id, slug, title, description, ordering, schemas
    FROM nodes
    WHERE type = 'group' AND parent_id = ${c.id}
    ORDER BY ordering
  `

  // Fetch all lessons for this course in one query (content nodes whose parent is a module of this course)
  const lessonRows = await sql`
    SELECT l.parent_id AS module_id, l.ordering, l.title, l.sections, l.metadata
    FROM nodes l
    JOIN nodes m ON m.id = l.parent_id
    WHERE l.type = 'content' AND m.type = 'group' AND m.parent_id = ${c.id}
    ORDER BY m.ordering, l.ordering
  `

  // Group lessons by module_id
  const lessonsByModule = new Map<string, PublicLesson[]>()
  for (const l of lessonRows) {
    const moduleId = l.module_id as string
    if (!lessonsByModule.has(moduleId)) lessonsByModule.set(moduleId, [])
    const idx = l.ordering as number
    const sections = (l.sections ?? {}) as Record<string, unknown>
    const meta = (l.metadata ?? {}) as Record<string, unknown>
    lessonsByModule.get(moduleId)!.push({
      lessonIndex: idx,
      order: idx + 1,
      title: l.title as string,
      slug: toSlug(l.title as string),
      content: (sections.content ?? '') as string,
      problemSummary: (meta.problemSummary as string | null) ?? null,
      problemConstraints: (meta.problemConstraints as string[]) ?? [],
    })
  }

  const modules: PublicModuleSection[] = moduleRows.map(m => {
    const schemas = (m.schemas ?? {}) as Record<string, unknown>
    const quizForm = schemas.quizForm as { questions?: QuizQuestion[] } | null
    return {
      id: m.id as string,
      slug: m.slug as string,
      title: m.title as string,
      description: (m.description ?? '') as string,
      order: m.ordering as number,
      lessons: lessonsByModule.get(m.id as string) ?? [],
      quizQuestions: quizForm?.questions ?? [],
    }
  })

  return {
    id: c.id as string,
    title: c.title as string,
    slug: c.slug as string,
    description: (c.description ?? '') as string,
    outcomes: (courseMeta.outcomes ?? []) as string[],
    tag: (courseMeta.track ?? '') as string,
    modules,
  }
}

/** For generateStaticParams on course page */
export async function getAllPublicCourseSlugs(): Promise<{ courseSlug: string }[]> {
  const rows = await sql`
    SELECT slug FROM nodes
    WHERE type = 'group' AND parent_id IS NULL
    ORDER BY ordering
  `
  return rows.map(r => ({ courseSlug: r.slug as string }))
}
