import { Note } from "@/domain/Note";
import { SubscriberRepository } from "@/infrastructure/repositories/SubscriberRepository";
import { EmailService } from "@/infrastructure/email/EmailService";

export class NotifySubscribersOfNoteUseCase {
    constructor(
        private subscriberRepository: SubscriberRepository,
        private emailService: EmailService,
    ) {}

    /** Returns how many subscribers the email went to. Throws when the provider rejects it. */
    async execute(note: Note): Promise<number> {
        const subscribers = await this.subscriberRepository.findAll();
        const emails = subscribers.map((s) => s.email);
        return await this.emailService.sendNewNote(emails, note.title, note.id);
    }
}
