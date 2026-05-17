'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SocialFooter } from '@/app/components/layout/Footer'
import { NewsletterBanner } from '@/app/components/newsletter/NewsletterBanner'
import { FiArrowRight, FiGithub } from 'react-icons/fi'
import {
  Server, Layout, Cloud, Database, Activity,
  BookOpen, Star, Music, Zap, ArrowUpRight,
  Layers, GitBranch, Cpu
} from 'lucide-react'

const techStack = {
  Backend: {
    icon: Server,
    color: 'text-primary',
    bg: 'bg-primary/10',
    items: ['.NET 10', 'C#', 'Node.js', 'REST APIs', 'Microservices', 'Distributed Systems'],
  },
  Frontend: {
    icon: Layout,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  'Cloud & Infra': {
    icon: Cloud,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    items: ['AWS', 'Azure', 'Docker', 'YARP', 'CI/CD'],
  },
  Data: {
    icon: Database,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    items: ['MySQL', 'SQL Server', 'Entity Framework', 'Relational Modeling'],
  },
  Messaging: {
    icon: Activity,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    items: ['Kafka', 'RabbitMQ', 'Event-driven Architecture'],
  },
}

const specialties = [
  {
    icon: Layers,
    title: 'Clean Architecture',
    description: 'I structure systems so they can evolve without collapsing — separating business rules from infrastructure concerns.',
  },
  {
    icon: GitBranch,
    title: 'Distributed Systems',
    description: 'Event-driven services, message brokers, and APIs designed to stay consistent and reliable at scale.',
  },
  {
    icon: Cpu,
    title: 'Backend Engineering',
    description: 'High-throughput APIs and domain models built with .NET — focused on correctness, performance, and longevity.',
  },
]

const blogSections = [
  {
    href: '/library',
    icon: BookOpen,
    label: 'Library',
    description: 'Books I\'ve read — annotated and reviewed.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    href: '/reviews',
    icon: Star,
    label: 'Reviews',
    description: 'Honest takes on what I\'ve been reading.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    href: '/music',
    icon: Music,
    label: 'Music',
    description: 'What\'s playing while I write and build.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    href: '/release-notes',
    icon: Zap,
    label: 'Releases',
    description: 'Changelog of what\'s new on this blog.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
  },
]

const experience = [
  {
    role: 'Founder / Engineer',
    company: 'Tegy',
    period: 'Jan 2026 – Present',
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
    active: false,
    bullets: [
      'Designing scalable backend services',
      'Applying Clean Architecture and DDD',
      'Improving production reliability',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'XP Inc.',
    period: 'Sep 2024 – Aug 2025',
    active: false,
    bullets: [
      'Built production apps with React + TypeScript',
      'Worked in cross-functional teams',
      'Focused on maintainability',
    ],
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        {/* dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, oklch(0.5 0 0 / 0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground border border-border/60 bg-muted/30 rounded-full px-3 py-1 mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Software Engineer · Brazil
            </span>

            <h1 className="text-5xl md:text-[4.5rem] font-bold tracking-tight leading-[1.08] mb-6">
              I build backend systems
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground/60 to-foreground/90">
                that hold under pressure.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Specialized in .NET and distributed systems — I design APIs and
              architectures that stay reliable in production, not just in theory.
            </p>

            <div className="flex gap-3 flex-wrap">
              <a
                href="https://github.com/humbertovitalino"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 shadow-sm hover:shadow-md transition-all">
                  <FiGithub className="w-4 h-4" />
                  GitHub
                  <FiArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="mailto:humbertovitalino01@gmail.com">
                <Button size="lg" variant="outline" className="gap-2">
                  Contact Me
                </Button>
              </a>
            </div>
          </div>

          {/* stats bar */}
          <div className="mt-16 pt-10 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '4+', label: 'Years of experience' },
              { value: '2', label: 'Companies in production' },
              { value: '.NET', label: 'Primary stack' },
              { value: '∞', label: 'Distributed problems solved' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section className="py-24 border-t bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What I do</p>
            <h2 className="text-3xl font-bold tracking-tight">
              Engineering that scales with the problem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialties.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-2xl border border-border/60 bg-card hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGIES ── */}
      <section className="py-24 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Stack</p>
            <h2 className="text-3xl font-bold tracking-tight">Technologies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(techStack).map(([name, { icon: Icon, color, bg, items }]) => (
              <div key={name} className="p-6 rounded-2xl border border-border/60 bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 ${bg} rounded-lg ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm">{name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-muted/60 text-foreground/80 rounded-full text-xs font-medium border border-border/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FROM THE BLOG ── */}
      <section className="py-24 border-t bg-muted/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Beyond code</p>
            <h2 className="text-3xl font-bold tracking-tight">From the blog</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {blogSections.map(({ href, icon: Icon, label, description, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="group p-6 rounded-2xl border border-border/60 bg-card hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{label}</h3>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section className="py-24 border-t">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Career</p>
            <h2 className="text-3xl font-bold tracking-tight">Experience</h2>
          </div>

          <div className="space-y-10 border-l-2 border-border ml-3 pl-8 relative">
            {experience.map(({ role, company, period, active, description, bullets, link }) => (
              <div key={`${role}-${company}`} className="relative">
                <span
                  className={`absolute -left-10.5 top-1.5 h-4 w-4 rounded-full ring-4 ring-background ${
                    active ? 'bg-primary' : 'bg-muted-foreground/40'
                  }`}
                />
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-semibold">
                    {role}{' '}
                    <span className="text-muted-foreground font-normal">— {company}</span>
                  </h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit whitespace-nowrap ${
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground bg-muted/50'
                  }`}>
                    {period}
                  </span>
                </div>
                {description && (
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{description}</p>
                )}
                <ul className="space-y-1.5">
                  {bullets.map((b) => (
                    <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                {link && (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-4"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section className="py-24 border-t">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Education</p>
            <h2 className="text-3xl font-bold tracking-tight">Degrees</h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-border/60 bg-card hover:shadow-sm transition-shadow gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Systems Analysis and Development</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">FIAP</p>
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full w-fit whitespace-nowrap">
                2023 – 2025
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="py-24 border-t bg-muted/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Let's build something that lasts.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Whether it's a system architecture, a technical problem, or just an interesting conversation —
            I'm always open to it.
          </p>
          <a href="mailto:humbertovitalino01@gmail.com">
            <Button size="lg" className="gap-2 shadow-sm hover:shadow-md transition-all">
              Get in touch
              <FiArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      <SocialFooter />
      <NewsletterBanner />
    </div>
  )
}
