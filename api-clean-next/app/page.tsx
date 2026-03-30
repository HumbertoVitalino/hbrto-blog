'use client'

import { Button } from '@/components/ui/button'
import { SocialFooter } from '@/app/components/layout/Footer'
import { FiArrowRight } from 'react-icons/fi'
import { Server, Layout, Cloud, Database, Activity } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <section className="relative py-32 overflow-hidden">
        {/* Efeito de brilho de fundo opcional (glow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground mb-6">
              Software Engineer — Brazil
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
              I design <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">backend systems</span>
              <br />
              for real-world complexity.
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Specialized in .NET and distributed systems, I build APIs and architectures
              that stay reliable under pressure — not just in theory, but in production.
            </p>

            <div className="flex gap-4 flex-wrap">
              <a
                href="https://github.com/humbertovitalino"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                  View GitHub
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </a>

              <a href="mailto:humbertovitalino01@gmail.com">
                <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm">
                  Contact Me
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGIES */}
      <section className="py-24 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Technologies</h2>
            <p className="text-muted-foreground mt-2">The tools I use to bring architectures to life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Backend Card */}
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Backend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['.NET 10', 'C#', 'Node.js', 'REST APIs', 'Microservices', 'Distributed Systems'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Frontend Card */}
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Layout className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Frontend</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Cloud & Infra Card */}
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Cloud & Infra</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['AWS', 'Azure', 'Docker', 'YARP', 'CI/CD'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Data Card */}
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Data</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['MySQL', 'SQL Server', 'Entity Framework', 'Relational Modeling'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Messaging Card */}
            <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Messaging</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Kafka', 'RabbitMQ', 'Event-driven Architecture'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium border border-border/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EXPERIENCE TIMELINE */}
      <section className="py-24 border-t">
        <div className="max-w-3xl mx-auto px-6">

          <h2 className="text-3xl font-bold tracking-tight mb-12">
            Experience
          </h2>

          <div className="space-y-12 border-l-2 border-muted ml-3 pl-8 relative">

            {/* Tegy */}
            <div className="relative">
              <span className="absolute -left-10.25 top-1.5 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Founder / Engineer <span className="text-muted-foreground font-normal">— Tegy</span>
                </h3>
                <span className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">
                  Jan 2026 – Present
                </span>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Intelligent pricing engine designed to optimize decision-making
                based on real-world data and business rules.
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4 list-disc list-inside marker:text-muted">
                <li>Designing the system architecture from scratch (Microservices)</li>
                <li>Building pricing logic and domain models</li>
                <li>Focusing on scalability and real-world applicability</li>
              </ul>
              <a
                href="https://www.tegy.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Visit tegy.com.br
                <FiArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Itaú Unibanco */}
            <div className="relative">
              <span className="absolute -left-10.25 top-1.5 h-4 w-4 rounded-full bg-muted ring-4 ring-background" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Software Engineer <span className="text-muted-foreground font-normal">— Itaú Unibanco</span>
                </h3>
                <span className="text-sm text-muted-foreground mt-2 sm:mt-0">
                  Aug 2025 – Present
                </span>
              </div>
              <ul className="text-muted-foreground space-y-2 mt-4 list-disc list-inside marker:text-muted">
                <li>Designing scalable backend services</li>
                <li>Applying Clean Architecture and DDD</li>
                <li>Improving production reliability</li>
              </ul>
            </div>

            {/* XP Inc. */}
            <div className="relative">
              <span className="absolute -left-10.25 top-1.5 h-4 w-4 rounded-full bg-muted ring-4 ring-background" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Software Engineer <span className="text-muted-foreground font-normal">— XP Inc.</span>
                </h3>
                <span className="text-sm text-muted-foreground mt-2 sm:mt-0">
                  Sep 2024 – Aug 2025
                </span>
              </div>
              <ul className="text-muted-foreground space-y-2 mt-4 list-disc list-inside marker:text-muted">
                <li>Built production apps with React + TypeScript</li>
                <li>Worked in cross-functional teams</li>
                <li>Focused on maintainability</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <SocialFooter />

    </div>
  )
}