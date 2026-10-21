import type { Metadata } from 'next'
import { PageContainer } from '@/app/components/layout/PageHeader'
import { FadeIn } from '@/app/components/motion/FadeIn'
import { PhotoCard } from '@/app/components/home/PhotoCard'
import { ABOUT_PHOTO } from '@/app/components/home/photos'
import { SocialList } from '@/app/components/home/SocialLinks'

export const metadata: Metadata = {
    title: 'About',
    description: 'I’m Humberto, a software engineer building backend systems in São Paulo.',
}

const inline = 'text-foreground underline decoration-foreground/25 underline-offset-3 transition-colors hover:text-brand-accent hover:decoration-brand-accent'

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={inline}>{children}</a>
}

export default function AboutPage() {
    return (
        <PageContainer>
            <div className="grid grid-cols-1 gap-y-16 pt-14 sm:pt-22 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
                <div className="lg:pl-20">
                    <div className="max-w-76 px-2.5 lg:max-w-none">
                        <PhotoCard photo={ABOUT_PHOTO} priority draggable={false} className="rotate-3" />
                    </div>
                </div>

                <FadeIn className="lg:order-first lg:row-span-2">
                    <h1 className="text-[2rem] font-semibold leading-10 tracking-tight text-pretty sm:text-5xl sm:leading-14">
                        I’m Humberto. I build backend systems in São Paulo.
                    </h1>
                    <div className="mt-6 space-y-7 text-base text-muted-foreground">
                        <p>
                            I started at FIAP studying Systems Analysis and Development, and by the end of it I was
                            at <Ext href="https://www.xpinc.com">XP Inc.</Ext> on the Billing squad: .NET REST APIs in
                            a microservice architecture, Kafka between services, and the unit, integration and
                            functional tests that let a team ship without fear.
                        </p>
                        <p>
                            Today I’m a Software Engineer at <Ext href="https://www.itau.com.br">Itaú Unibanco</Ext>,
                            building .NET APIs on AWS (Lambda, ECS, SQS, SNS, DynamoDB) with Terraform, and React and
                            Next.js webviews when the mobile app needs them. Most of the work is making financial
                            domains read clearly in code.
                        </p>
                        <p>
                            On the side I started <Ext href="https://www.tegy.com.br">Tegy</Ext>, a pricing engine I
                            designed from the architecture up; it’s on pause for now. I’m also doing a postgrad in
                            Software Architecture at FIAP. My first project there is{' '}
                            <Ext href="https://github.com/humbertovitalino/fiap-postgraduated-workshop">a backend for a car repair shop</Ext>{' '}
                            in .NET 10 with Clean Architecture and DDD, a full service-order state machine, and 97%
                            test coverage.
                        </p>
                        <p>
                            Away from work I read a lot, mostly philosophy, with Dostoyevsky on repeat. I play rapid
                            chess on Chess.com and finish the odd Zelda on the Switch. This site is where all of that
                            lives, built and run by me.
                        </p>
                    </div>
                </FadeIn>

                <FadeIn index={1} className="lg:pl-20">
                    <SocialList />
                </FadeIn>
            </div>
        </PageContainer>
    )
}
