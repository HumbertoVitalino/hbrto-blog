import { StudySession } from "@/domain/StudySession";
import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";

export class GetAllStudySessionsUseCase {
    constructor(private studySessionRepository: StudySessionRepository) {}

    async execute(topicId?: string): Promise<StudySession[]> {
        if (topicId) {
            return await this.studySessionRepository.findByTopicId(topicId);
        }
        return await this.studySessionRepository.findAll();
    }
}
