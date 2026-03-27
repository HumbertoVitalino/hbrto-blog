'use client'

import { Button } from '@/components/ui/button'
import { FiArrowRight, FiLinkedin, FiMail } from 'react-icons/fi'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative py-32">
        <div className="max-w-6xl mx-auto px-6">

          <div className="max-w-3xl">

            <p className="text-sm text-muted-foreground mb-4">
              Software Engineer — Brazil
            </p>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
              I design backend systems
              <br />
              for real-world complexity.
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
              Specialized in .NET and distributed systems, I build APIs and architectures
              that stay reliable under pressure — not just in theory, but in production.
            </p>

            <div className="flex gap-4 flex-wrap">

              <a
                href="https://github.com/humbertovitalino"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2">
                  View GitHub
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </a>

              <a href="mailto:humbertovitalino@gmail.com">
                <Button size="lg" variant="outline">
                  Contact Me
                </Button>
              </a>

            </div>

          </div>
        </div>
      </section>

      {/* SOCIAL (mais discreto e alinhado) */}
      <section className="border-y py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

          <p className="text-sm text-muted-foreground">
            Connect
          </p>

          <div className="flex items-center gap-6">

            <a
              href="https://www.linkedin.com/in/humbertovitalino"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              LinkedIn
            </a>

            <a
              href="mailto:humbertovitalino@gmail.com"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Email
            </a>

          </div>

        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold mb-12">
            Experience
          </h2>

          <div className="space-y-12">

            {/* ITAU */}
            <div>
              <h3 className="text-xl font-semibold">
                Software Engineer — Itaú Unibanco
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Aug 2025 – Present
              </p>

              <ul className="text-muted-foreground space-y-2">
                <li>Designing scalable backend services</li>
                <li>Applying Clean Architecture and DDD</li>
                <li>Improving production reliability</li>
              </ul>
            </div>

            {/* TEGY (NOVO - MUITO FORTE) */}
            <div>
              <h3 className="text-xl font-semibold">
                Founder / Engineer — Tegy
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Jan 2026 – Present
              </p>

              <p className="text-muted-foreground mb-3">
                Intelligent pricing engine designed to optimize decision-making
                based on real-world data and business rules.
              </p>

              <ul className="text-muted-foreground space-y-2">
                <li>Designing the system architecture from scratch</li>
                <li>Building pricing logic and domain models</li>
                <li>Focusing on scalability and real-world applicability</li>
              </ul>

              <a
                href="https://www.tegy.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm hover:underline"
              >
                Visit tegy.com.br
                <FiArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* XP */}
            <div>
              <h3 className="text-xl font-semibold">
                Software Engineer — XP Inc.
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sep 2024 – Aug 2025
              </p>

              <ul className="text-muted-foreground space-y-2">
                <li>Built production apps with React + TypeScript</li>
                <li>Worked in cross-functional teams</li>
                <li>Focused on maintainability</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}