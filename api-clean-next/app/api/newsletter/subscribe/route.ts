import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import { SubscribeUseCase } from "@/application/usecases";
import { EmailService } from "@/infrastructure/email/EmailService";
import { subscriberToPlain } from "@/lib/mappers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const repo = new SubscriberRepository();
        const useCase = new SubscribeUseCase(repo);
        const subscriber = await useCase.execute({ email: body.email });

        const emailService = new EmailService();
        await emailService.sendWelcome(subscriber.email);

        return NextResponse.json(subscriberToPlain(subscriber), { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
