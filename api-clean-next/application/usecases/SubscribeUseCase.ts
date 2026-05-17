import { Subscriber } from "@/domain/Subscriber";
import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";

export interface SubscribeDTO {
    email: string;
}

export class SubscribeUseCase {
    constructor(private subscriberRepository: SubscriberRepository) {}

    async execute(dto: SubscribeDTO): Promise<Subscriber> {
        const email = dto.email.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Invalid email");
        }

        const existing = await this.subscriberRepository.findByEmail(email);

        if (existing) {
            if (existing.isActive) {
                throw new Error("This email is already subscribed");
            }
            await this.subscriberRepository.reactivate(email);
            return existing;
        }

        const subscriber = new Subscriber({
            id: crypto.randomUUID(),
            email
        });

        return await this.subscriberRepository.create(subscriber);
    }
}
