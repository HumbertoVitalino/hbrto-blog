import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import { UnsubscribeUseCase } from "@/application/usecases";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const email = request.nextUrl.searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email é obrigatório" },
                { status: 400 }
            );
        }

        const repo = new SubscriberRepository();
        const useCase = new UnsubscribeUseCase(repo);
        await useCase.execute({ email });

        return NextResponse.json({ message: "Descadastrado com sucesso" });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}
