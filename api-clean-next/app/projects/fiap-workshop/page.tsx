import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { PageContainer } from '@/app/components/layout/PageHeader'
import { FadeIn } from '@/app/components/motion/FadeIn'
import { BrowserWindow, Phone, ProductStage } from '@/app/components/projects/Devices'
import { FIAP_SHOTS } from '@/lib/projects'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
    title: 'A car repair shop, run from one screen',
    description:
        'Fiap Workshop: a service-order system for a car repair shop. DDD backend in .NET 10, deployed to Kubernetes on Azure with Terraform, 97.5% test coverage.',
}

const REPO = 'https://github.com/HumbertoVitalino/fiap-postgraduated-workshop'
const FRONTEND = 'https://github.com/HumbertoVitalino/fiap-workshop-frontend'
const VIDEO = 'https://youtu.be/8Ne0b6VGG2g'

const FACTS = [
    { label: 'Tests', value: '408' },
    { label: 'Coverage', value: '97.5', unit: '%' },
    { label: 'Bugs · vulns (Sonar)', value: '0 · 0' },
    { label: 'Pods under load', value: '1–3', unit: 'HPA' },
]

// the stage colours are the frontend's own, so the diagram matches its screens
const STAGES = {
    received: { label: 'Received', swatch: 'bg-white ring-1 ring-black/20' },
    diagnosing: { label: 'Diagnosing', swatch: 'bg-[#e8792b]' },
    awaiting: { label: 'Awaiting approval', swatch: 'bg-[repeating-linear-gradient(-45deg,#f2c230_0_2px,#1a1e22_2px_4px)]' },
    progress: { label: 'In progress', swatch: 'bg-[#2e6fd8]' },
    finished: { label: 'Finished', swatch: 'bg-[#34a862]' },
    rejected: { label: 'Rejected', swatch: 'bg-[#cc3a31]' },
    delivered: { label: 'Delivered', swatch: 'bg-[#4a5259]' },
}
type Stage = keyof typeof STAGES

function Flow({ stages, className }: { stages: Stage[]; className?: string }) {
    return (
        <ol className={cn('flex flex-wrap items-center gap-x-1.5 gap-y-2', className)}>
            {stages.map((key, i) => (
                <li key={key} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden className="text-muted-foreground">→</span>}
                    <span className="inline-flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-foreground shadow-xs ring-1 ring-border">
                        <span aria-hidden className={cn('size-2.5 rounded-[3px]', STAGES[key].swatch)} />
                        {STAGES[key].label}
                    </span>
                </li>
            ))}
        </ol>
    )
}

function Ext({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-[0.97]',
                primary ? 'bg-foreground text-background hover:bg-foreground/85' : 'bg-muted text-foreground hover:bg-muted/70 dark:hover:bg-muted/80',
            )}
        >
            {children}
            <ArrowUpRight aria-hidden className="size-3.5 opacity-60" />
        </a>
    )
}

function PipelineBox({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('rounded-xl bg-card p-4 text-[13px] ring-1 ring-border', className)}>
            <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
            <p className="leading-relaxed text-foreground">{children}</p>
        </div>
    )
}

const Then = () => <span aria-hidden className="mx-1 text-muted-foreground">→</span>

/** Reading column, left-aligned with the page title; figures between them use the full width. */
function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('prose-note max-w-2xl', className)}>{children}</div>
}

export default function FiapWorkshopPage() {
    return (
        <PageContainer>
            <div className="relative pt-16 sm:pt-24">
                <Link
                    href="/projects"
                    aria-label="Back to projects"
                    className="group mb-8 grid size-10 place-items-center rounded-full bg-card shadow-md shadow-foreground/5 ring-1 ring-border transition dark:bg-muted xl:absolute xl:-left-20 xl:top-24 xl:mb-0"
                >
                    <ArrowLeft className="size-4 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-brand-accent" />
                </Link>

                <FadeIn>
                    <header className="max-w-2xl">
                        <p className="flex items-center gap-3 text-base text-muted-foreground">
                            <span aria-hidden className="h-4 w-0.5 rounded-full bg-border" />
                            June 2026 — Present · FIAP postgrad in Software Architecture
                        </p>
                        <h1 className="mt-6 text-[2rem] font-semibold leading-10 tracking-tight text-balance sm:text-5xl sm:leading-14">
                            A car repair shop, run from one screen
                        </h1>
                        <p className="mt-6 text-base text-muted-foreground text-pretty">
                            My postgrad’s Tech Challenge: replace the notebooks and spreadsheets of a mid-sized repair
                            shop with one flow, from the car arriving to the car leaving, where customers follow their
                            order from their phone and approve the quote themselves.
                        </p>
                    </header>
                </FadeIn>
            </div>

            <FadeIn index={1} className="mt-14">
                <ProductStage desktop={FIAP_SHOTS.board} phone={FIAP_SHOTS.boardPhone} priority settle />
            </FadeIn>

            <div className="max-w-2xl">
                <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-4">
                    {FACTS.map(fact => (
                        <div key={fact.label} className="bg-card px-4 py-4">
                            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                            <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                                {fact.value}
                                {fact.unit && <span className="ml-1 text-[13px] font-medium tracking-normal text-muted-foreground">{fact.unit}</span>}
                            </dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                    <Ext href={REPO} primary>Backend on GitHub</Ext>
                    <Ext href={FRONTEND}>Frontend on GitHub</Ext>
                    <Ext href={VIDEO}>Demo video</Ext>
                </div>
            </div>

            <Prose className="mt-16">
                <h2>The problem</h2>
                <p>
                    The shop runs on paper. Orders get prioritized by whoever shouts loudest, parts run out without
                    anyone noticing, the history of a car lives in someone’s head, and every quote means a phone call.
                    The brief asked for a backend that fixes that, built with Domain-Driven Design and treated like
                    production code: layered architecture, automated tests, JWT auth, and validation of the sensitive
                    bits (CPF/CNPJ, license plates).
                </p>

                <h2>The service order is the product</h2>
                <p>
                    Everything orbits one aggregate. A service order moves through a state machine, and each transition
                    declares which states it can leave from, behind a single guard (<code>EnsureCanTransitionTo</code>)
                    instead of six copies of the same check. The quote is built from the services and parts the
                    mechanic adds during diagnosis, which reserves stock; approval consumes it for real.
                </p>
            </Prose>

            <figure className="mt-8 max-w-2xl rounded-2xl bg-muted p-5">
                <Flow stages={['received', 'diagnosing', 'awaiting', 'progress', 'finished', 'delivered']} />
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">If the customer says no</span>
                    <Flow stages={['awaiting', 'rejected', 'delivered']} />
                </div>
                <figcaption className="sr-only">
                    The service order’s stages: received, diagnosing, awaiting approval, in progress, finished, delivered.
                    A rejected quote goes from awaiting approval to rejected, then delivered.
                </figcaption>
            </figure>

            <figure className="mt-14">
                <div className="product-stage px-4 pt-4 sm:px-10 sm:pt-10">
                    <BrowserWindow
                        shot={FIAP_SHOTS.order}
                        flushBottom
                        imageClassName="max-h-[34rem] object-cover object-top"
                    />
                </div>
                <figcaption className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted-foreground text-pretty">
                    Every order shows where it is and the one thing it needs next. Finishing asks the mechanic for the
                    real minutes spent on each service, and that feeds the catalog: a service’s estimated duration is a
                    running average that updates every time an order closes.
                </figcaption>
            </figure>

            <Prose className="mt-14">
                <p>
                    The customer’s decision on the quote arrives through a webhook from an external system,
                    authenticated by API key, and nobody at the shop approves on the customer’s behalf. Every status
                    change emails the customer. Around the order sit the supporting contexts: customers and vehicles (a
                    customer with cars can’t be deleted, a plate never changes) and parts whose stock only moves
                    through reservations.
                </p>

                <h2>A screen for every role</h2>
                <p>
                    The frontend is Next.js with a screen per role: the admin’s board, the attendant’s queue, the
                    mechanic’s work list. Customers get a public page where their document and plate show the stage,
                    the diagnosis and the itemized quote, without that page ever revealing whether a customer or car
                    exists. The browser only talks to a server-side proxy, so tokens never leave httpOnly cookies.
                </p>
            </Prose>

            <figure className="mt-12">
                <div className="product-stage flex h-96 justify-center gap-4 px-6 pt-7 sm:h-[34rem] sm:gap-12 sm:pt-12">
                    <Phone shot={FIAP_SHOTS.boardPhone} className="w-[46%] flex-none sm:w-62" />
                    <Phone shot={FIAP_SHOTS.track} className="mt-12 w-[46%] flex-none sm:w-62" />
                </div>
                <figcaption className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                    The board from the shop floor, and the customer checking on their car. Every flow works on a phone.
                </figcaption>
            </figure>

            <Prose className="mt-14">
                <h2>Running it like a real system</h2>
                <p>
                    Phase 2 asked for the same app to scale and deploy itself. I provisioned everything on Azure with
                    Terraform: a VM running k3s, a managed Azure SQL database that pauses when idle, and a firewall
                    that only lets SSH in from my IP. A merge into <code>release</code> runs the pipeline.
                </p>
            </Prose>

            <figure className="mt-8 max-w-2xl rounded-2xl bg-muted p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <PipelineBox title="GitHub Actions · on merge to release" className="sm:col-span-2">
                        Build<Then />Unit tests<Then />Integration tests<Then />Docker image<Then />GHCR
                    </PipelineBox>
                    <PipelineBox title="Azure VM · k3s">
                        Traefik ingress<Then />API, 1 to 3 pods, scaled by an HPA on CPU and memory
                    </PipelineBox>
                    <PipelineBox title="Azure SQL">
                        Schema and seed applied by a self-hosted runner on the VM
                    </PipelineBox>
                </div>
                <figcaption className="sr-only">
                    The pipeline: GitHub Actions builds, tests and pushes an image to GHCR; a runner on the Azure VM
                    deploys it to k3s and applies the schema to Azure SQL.
                </figcaption>
            </figure>

            <Prose className="mt-8 pb-8">
                <p>
                    The deploy job runs on a GitHub runner inside the VM: it applies the schema, applies the Kubernetes
                    manifests and checks the health endpoints before calling it done. The{' '}
                    <a href={VIDEO} target="_blank" rel="noopener noreferrer">demo video</a> shows the autoscaler adding
                    pods under a k6 load test.
                </p>

                <h2>Quality as a requirement</h2>
                <ul>
                    <li>
                        Clean Architecture with the dependency rule enforced: <code>Domain</code> references nothing,{' '}
                        <code>Application</code> has no EF Core or ASP.NET.
                    </li>
                    <li>
                        Unit tests on Domain and Application, integration tests against a real SQL Server in Docker:
                        97.5% coverage on SonarQube Cloud, against a target of 80%.
                    </li>
                    <li>
                        CodeQL and SonarQube on every run. The medium findings (log forging, sensitive data in logs)
                        were fixed, not suppressed.
                    </li>
                    <li>Refresh tokens with rotation, BCrypt at work factor 12, role policies for admin, attendant and mechanic.</li>
                </ul>

                <h2>What’s next</h2>
                <p>
                    Phase 3 takes it to multiple shops: an API gateway, a serverless function that authenticates
                    customers by CPF and issues the JWT, the database and the cluster in their own repositories with
                    their own pipelines, and monitoring to catch bottlenecks as they happen.
                </p>
            </Prose>
        </PageContainer>
    )
}
