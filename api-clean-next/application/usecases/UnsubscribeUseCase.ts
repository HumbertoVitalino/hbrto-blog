import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";

export interface UnsubscribeDTO {
    email: string;
}

export class UnsubscribeUseCase {
    constructor(private subscriberRepository: SubscriberRepository) {}

    async execute(dto: UnsubscribeDTO): Promise<void> {
        const email = dto.email.trim().toLowerCase();

        if (!email) {
            throw new Error("Email is required");
        }

        const existing = await this.subscriberRepository.findByEmail(email);

        if (!existing || !existing.isActive) {
            throw new Error("Email not found in subscribers list");
        }

        await this.subscriberRepository.deactivate(email);
    }
}
