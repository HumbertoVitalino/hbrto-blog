import { StudyTopic } from "@/domain/StudyTopic";
import { StudyTopicRepository } from "@/infrastructure/repositories/StudyTopicRepository";

export class GetStudyTopicByIdUseCase {
    constructor(private studyTopicRepository: StudyTopicRepository) {}

    async execute(id: string): Promise<StudyTopic | null> {
        return await this.studyTopicRepository.findById(id);
    }
}
