'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { SocialFooter } from '@/app/components/layout/Footer'
import { NewsletterBanner } from '@/app/components/newsletter/NewsletterBanner'
import { FiGithub } from 'react-icons/fi'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { useBooks } from '@/app/hooks/useBooks'
import { useReviews } from '@/app/hooks/useReviews'
import { useNowPlaying } from '@/app/hooks/useNowPlaying'
import { useReleaseNotes } from '@/app/hooks/useReleaseNotes'
import { BookStatus } from '@/domain/BookStatus'
import {
  Server, Layout, Cloud, Database, Activity,
  BookOpen, Star, Music, Zap, ArrowUpRight, ArrowRight,
  Layers, GitBranch, Cpu, GraduationCap, Briefcase, RefreshCw
} from 'lucide-react'

const techStack = {
  Backend: {
    icon: Server,
    color: 'text-primary',
    bg: 'bg-primary/10',
    barColor: 'bg-primary',
    items: ['.NET 10', 'C#', 'Node.js', 'REST APIs', 'Microservices', 'Distributed Systems'],
  },
  Frontend: {
    icon: Layout,
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    barColor: 'bg-chart-5',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  'Cloud & Infra': {
    icon: Cloud,
    color: 'text-chart-4',
    bg: 'bg-chart-4/10',
    barColor: 'bg-chart-4',
    items: ['AWS', 'Azure', 'Docker', 'YARP', 'CI/CD'],
  },
  Data: {
    icon: Database,
    color: 'text-chart-3',
    bg: 'bg-chart-3/10',
    barColor: 'bg-chart-3',
    items: ['MySQL', 'SQL Server', 'Entity Framework', 'Relational Modeling'],
  },
  Messaging: {
    icon: Activity,
    color: 'text-chart-2',
    bg: 'bg-chart-2/10',
    barColor: 'bg-chart-2',
    items: ['Kafka', 'RabbitMQ', 'Event-driven Architecture'],
  },
}

const maxStackItems = Math.max(...Object.values(techStack).map(s => s.items.length))

const specialties = [
  {
    slug: 'clean-architecture',
    icon: Layers,
    title: 'Clean Architecture',
    description: 'I structure systems so they can evolve without collapsing — separating business rules from infrastructure concerns.',
  },
  {
    slug: 'distributed-systems',
    icon: GitBranch,
    title: 'Distributed Systems',
    description: 'Event-driven services, message brokers, and APIs designed to stay consistent and reliable at scale.',
  },
  {
    slug: 'backend-engineering',
    icon: Cpu,
    title: 'Backend Engineering',
    description: 'High-throughput APIs and domain models built with .NET — focused on correctness, performance, and longevity.',
  },
]

const blogSections = [
  {
    href: '/library',
    slug: 'library',
    icon: BookOpen,
    label: 'Library',
    description: 'Books I\'ve read — annotated and reviewed.',
    color: 'text-chart-4',
  },
  {
    href: '/reviews',
    slug: 'reviews',
    icon: Star,
    label: 'Reviews',
    description: 'Honest takes on what I\'ve been reading.',
    color: 'text-chart-5',
  },
  {
    href: '/music',
    slug: 'music',
    icon: Music,
    label: 'Music',
    description: 'What\'s playing while I write and build.',
    color: 'text-chart-3',
  },
  {
    href: '/release-notes',
    slug: 'release-notes',
    icon: Zap,
    label: 'Releases',
    description: 'Changelog of what\'s new on this blog.',
    color: 'text-chart-2',
  },
]

const experience = [
  {
    role: 'Founder / Engineer',
    company: 'Tegy',
    period: 'Jan 2026 – Present',
    sortKey: 202601,
    active: true,
    description: 'Intelligent pricing engine designed to optimize decision-making based on real-world data and business rules.',
    bullets: [
      'Designing the system architecture from scratch (Microservices)',
      'Building pricing logic and domain models',
      'Focusing on scalability and real-world applicability',
    ],
    link: { href: 'https://www.tegy.com.br', label: 'Visit tegy.com.br' },
  },
  {
    role: 'Software Engineer',
    company: 'Itaú Unibanco',
    period: 'Aug 2025 – Present',
    sortKey: 202508,
    active: false,
    bullets: [
      'Building backend services with C# and .NET on AWS',
      'Applying Clean Architecture and DDD to financial domain problems',
      'Delivering frontend features with React and TypeScript when needed',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'XP Inc.',
    period: 'Sep 2024 – Aug 2025',
    sortKey: 202409,
    active: false,
    bullets: [
      'Developed backend services with C# and .NET on Azure',
      'Worked with event-driven patterns and message brokers',
      'Contributed to frontend features with React and TypeScript',
    ],
  },
]

const education = [
  {
    role: 'Software Architecture',
    company: 'FIAP · Postgraduate',
    period: '2026 – 2027',
    sortKey: 202601,
    active: true,
    description: 'Specialization in system design, microservices, distributed systems, and architectural patterns for large-scale software.',
  },
  {
    role: 'Systems Analysis and Development',
    company: 'FIAP · Bachelor\'s',
    period: '2023 – 2025',
    sortKey: 202301,
    active: false,
    description: 'Foundation in software development, databases, algorithms, and systems engineering.',
  },
]

interface JourneyItem {
  kind: 'work' | 'education'
  role: string
  company: string
  period: string
  sortKey: number
  active: boolean
  description?: string
  bullets?: string[]
  link?: { href: string; label: string }
}

// reverse-chronological by actual start date (YYYYMM), work and education interleaved as one timeline
const journey: JourneyItem[] = [
  ...experience.map((item): JourneyItem => ({ ...item, kind: 'work' })),
  ...education.map((item): JourneyItem => ({ ...item, kind: 'education' })),
].sort((a, b) => b.sortKey - a.sortKey)

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
}

/** Every panel on this page shares this chrome: a mono title bar over an
 *  instrument surface, the same grammar a real monitoring dashboard uses
 *  for "here is one measured thing." */
function Panel({
  title,
  meta,
  className = '',
  children,
}: {
  title: string
  meta?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`instrument-panel border border-border/60 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/60 bg-background/50">
        <span className="font-mono text-[11px] text-muted-foreground tracking-wide">{title}</span>
        {meta && <span className="font-mono text-[11px] text-muted-foreground/60">{meta}</span>}
      </div>
      {children}
    </div>
  )
}

function StatPanel({ label, value, barClass }: { label: string; value: string; barClass: string }) {
  return (
    <div className="instrument-panel border border-border/60 p-4 relative overflow-hidden">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <p className="font-display text-3xl font-medium tracking-tight">{value}</p>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${barClass}`} />
    </div>
  )
}

/** Small live widgets for the hero sidebar — same instrument-panel chrome,
 *  scaled down, each one showing something genuinely true right now. */
function HeroWidget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="instrument-panel border border-border/60 overflow-hidden">
      <div className="px-3.5 py-2 border-b border-border/60 bg-background/50">
        <span className="font-mono text-[10px] text-muted-foreground tracking-wide">{title}</span>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  )
}

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

const requestRoutes = ['/library', '/reviews', '/games', '/studies', '/music', '/release-notes']
const eqBarHeights = ['h-1.5', 'h-4', 'h-2.5', 'h-3.5']

export default function HomePage() {
  const { books } = useBooks()
  const { reviews } = useReviews()
  const { data: nowPlaying } = useNowPlaying()
  const { notes } = useReleaseNotes()

  const readingBook = books.find(b => b.status === BookStatus.InProgress)
  const latestReview = reviews[0]
  const latestNote = notes[0]

  // session widget — real elapsed time since this page was opened, ticking live
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  // request-log widget — a live-looking tail of this site's own real routes
  const routeCounter = useRef(3)
  const [logHistory, setLogHistory] = useState(() =>
    requestRoutes.slice(0, 3).map((path, id) => ({ path, id }))
  )
  useEffect(() => {
    const id = setInterval(() => {
      setLogHistory(prev => {
        const nextPath = requestRoutes[routeCounter.current % requestRoutes.length]
        const nextId = routeCounter.current
        routeCounter.current += 1
        return [...prev.slice(1), { path: nextPath, id: nextId }]
      })
    }, 2200)
    return () => clearInterval(id)
  }, [])

  const blogPreviews: Record<string, string | undefined> = {
    '/library': readingBook ? `Reading "${readingBook.title}"` : 'No active read right now',
    '/reviews': latestReview ? `★ ${latestReview.rating}/5 — "${latestReview.title}"` : 'No reviews published yet',
    '/music': nowPlaying?.title
      ? `${nowPlaying.isPlaying ? 'Now playing' : 'Last played'} — ${nowPlaying.title}`
      : 'Nothing playing right now',
    '/release-notes': latestNote ? `v${latestNote.version} — ${latestNote.title}` : 'No releases logged yet',
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO / DASHBOARD HEADER ── */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-24 overflow-hidden">
        {/* dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, oklch(0.5 0 0 / 0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* layered twilight glow */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-125 h-100 bg-primary/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-0 w-100 h-100 bg-brand-accent/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          className="max-w-6xl mx-auto px-6 relative z-10"
          initial="hidden"
          animate="show"
          variants={heroContainer}
        >
          {/* status bar */}
          <motion.div
            variants={heroItem}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-14 pb-5 border-b border-border/50 font-mono text-[11px] text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              <span className="text-foreground">all systems operational</span>
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>uptime <span className="text-foreground">4+ yrs</span></span>
            <span className="hidden sm:inline text-border">|</span>
            <span>last deploy <span className="text-foreground">{latestNote ? `v${latestNote.version}` : '—'}</span></span>
            <span className="ml-auto flex items-center gap-1.5 text-muted-foreground/70">
              <RefreshCw className="w-3 h-3" />
              auto-refresh
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_19rem] gap-10 lg:gap-8">
            <div className="max-w-3xl">
              <motion.span
                variants={heroItem}
                className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground border border-border/60 bg-muted/30 rounded-full px-3 py-1 mb-8 backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                Software Engineer · Brazil
              </motion.span>

              <motion.h1
                variants={heroItem}
                className="font-display text-5xl md:text-[4.5rem] font-medium tracking-tight leading-[1.08] mb-6"
              >
                I build backend systems
                <br />
                <span className="italic text-primary">
                  that don&apos;t page you at{' '}
                  <span className="font-mono not-italic text-foreground">3am</span>.
                </span>
              </motion.h1>

              <motion.p variants={heroItem} className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
                Specialized in .NET and distributed systems — I design APIs and
                architectures that stay reliable in production, not just in theory.
              </motion.p>

              <motion.div variants={heroItem} className="flex gap-3 flex-wrap mb-16 lg:mb-0">
                <Button size="lg" className="gap-2 shadow-sm hover:ring-2 hover:ring-primary/20 transition-all" asChild>
                  <a
                    href="https://github.com/humbertovitalino"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiGithub className="w-4 h-4" />
                    GitHub
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="mailto:humbertovitalino01@gmail.com">
                    Contact Me
                  </a>
                </Button>
              </motion.div>

              {/* stat panels */}
              <motion.div variants={heroItem} className="hidden lg:grid grid-cols-2 md:grid-cols-4 gap-3 mt-16">
                <StatPanel label="Experience" value="4+ yrs" barClass="bg-primary" />
                <StatPanel label="In production" value="2 cos" barClass="bg-chart-4" />
                <StatPanel label="Primary stack" value=".NET" barClass="bg-chart-5" />
                <StatPanel label="Problems solved" value="∞" barClass="bg-brand-accent" />
              </motion.div>
            </div>

            {/* live sidebar — this is not decoration, every number here is real */}
            <motion.div variants={heroItem} className="space-y-3">
              <HeroWidget title="connection">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span className="font-mono text-lg tabular-nums text-foreground">{formatElapsed(elapsed)}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">this session</span>
                </div>
              </HeroWidget>

              <HeroWidget title="signal/now">
                {nowPlaying?.title ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-end gap-0.5 h-4 shrink-0">
                      {eqBarHeights.map((h, i) => (
                        <span
                          key={i}
                          className={`w-0.5 rounded-full bg-brand-accent ${h} ${nowPlaying.isPlaying ? 'eq-bar' : 'opacity-50'}`}
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{nowPlaying.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {nowPlaying.isPlaying ? 'Now playing' : 'Last played'}
                      </p>
                    </div>
                  </div>
                ) : readingBook ? (
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-chart-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{readingBook.title}</p>
                      <p className="text-[11px] text-muted-foreground">Currently reading</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No active signal</p>
                )}
              </HeroWidget>

              <HeroWidget title="log/requests">
                <div className="space-y-1.5 font-mono text-[11px]">
                  <AnimatePresence initial={false}>
                    {logHistory.map(({ path, id }) => (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-success shrink-0">200</span>
                        <span className="text-muted-foreground shrink-0">GET</span>
                        <span className="text-foreground/80 truncate">{path}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </HeroWidget>
            </motion.div>
          </div>

          {/* stat panels — mobile/tablet position, below the sidebar */}
          <motion.div variants={heroItem} className="grid lg:hidden grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            <StatPanel label="Experience" value="4+ yrs" barClass="bg-primary" />
            <StatPanel label="In production" value="2 cos" barClass="bg-chart-4" />
            <StatPanel label="Primary stack" value=".NET" barClass="bg-chart-5" />
            <StatPanel label="Problems solved" value="∞" barClass="bg-brand-accent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── CHECKS — specialties as health checks ── */}
      <section className="py-16 border-t bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <Panel title="checks/capabilities" meta={`${specialties.length} passing`}>
            <div className="divide-y divide-border/50">
              {specialties.map(({ slug, title, description }, i) => (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.08 }}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 p-5"
                >
                  <div className="flex items-center gap-2.5 sm:w-56 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                    <span className="font-mono text-xs text-muted-foreground truncate">{slug}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* ── STACK — utilization bars instead of tag pills ── */}
      <section className="py-16 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <Panel title="metrics/stack" meta="by surface area">
            <div className="divide-y divide-border/50">
              {Object.entries(techStack).map(([name, { icon: Icon, color, bg, barColor, items }], i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 ${bg} rounded-md ${color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-semibold text-sm">{name}</h3>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                      {items.length} tools
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2.5">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(items.length / maxStackItems) * 100}%` }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.06 }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {items.map((tech) => (
                      <span key={tech} className="text-xs text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* ── DEPLOY LOG — career + education as build history ── */}
      <section className="py-16 border-t bg-muted/10">
        <div className="max-w-3xl mx-auto px-6">
          <Panel title="log/career" meta={`${journey.length} entries`}>
            <div className="p-5 space-y-8">
              {journey.map((item, i) => (
                <motion.div
                  key={`${item.kind}-${item.role}-${item.company}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: (i % 3) * 0.06 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center ${
                      item.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.kind === 'work'
                        ? <Briefcase className="w-3.5 h-3.5" />
                        : <GraduationCap className="w-3.5 h-3.5" />
                      }
                    </span>
                    {i < journey.length - 1 && <span className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-semibold">
                        {item.role}{' '}
                        <span className="text-muted-foreground font-normal">— {item.company}</span>
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded w-fit whitespace-nowrap ${
                        item.active
                          ? 'text-success bg-success/10'
                          : 'text-muted-foreground bg-muted/50'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.active ? 'bg-success' : 'bg-muted-foreground/50'}`} />
                        {item.active ? 'active' : 'complete'}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground/70 mb-2">{item.period}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2.5 leading-relaxed">{item.description}</p>
                    )}
                    {item.bullets && (
                      <ul className="space-y-1.5">
                        {item.bullets.map((b) => (
                          <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.link && (
                      <a
                        href={item.link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-3"
                      >
                        {item.link.label}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* ── SERVICES — the site's own sections as a status table ── */}
      <section className="py-16 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <Panel title="services/live" meta={`${blogSections.length}/${blogSections.length} up`}>
            <div className="divide-y divide-border/50">
              {blogSections.map(({ href, slug, icon: Icon, label, color }) => {
                const preview = blogPreviews[href]
                return (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <span className="font-mono text-xs text-muted-foreground w-28 shrink-0 truncate">{slug}</span>
                    <span className="hidden sm:inline font-semibold text-sm w-20 shrink-0">{label}</span>
                    <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">{preview}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                )
              })}
            </div>
          </Panel>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="relative py-24 border-t bg-muted/10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-75 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground mb-6">
            POST /contact
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Let&apos;s build something that lasts.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Whether it&apos;s a system architecture, a technical problem, or just an interesting conversation —
            I&apos;m always open to it.
          </p>
          <Button size="lg" className="gap-2 shadow-sm hover:ring-2 hover:ring-primary/20 transition-all" asChild>
            <a href="mailto:humbertovitalino01@gmail.com">
              Get in touch
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      <SocialFooter />
      <NewsletterBanner />
    </div>
  )
}
