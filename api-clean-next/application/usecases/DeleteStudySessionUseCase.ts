import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";

export class DeleteStudySessionUseCase {
    constructor(private studySessionRepository: StudySessionRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) {
            throw new Error("Study session ID is required");
        }

        await this.studySessionRepository.delete(id);
    }
}
