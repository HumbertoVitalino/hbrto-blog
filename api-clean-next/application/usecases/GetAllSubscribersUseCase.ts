import { Subscriber } from "@/domain/Subscriber";
import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";

export class GetAllSubscribersUseCase {
    constructor(private subscriberRepository: SubscriberRepository) {}

    async execute(): Promise<Subscriber[]> {
        return await this.subscriberRepository.findAll();
    }
}
