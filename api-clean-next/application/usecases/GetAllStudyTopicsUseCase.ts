import { StudyTopic } from "@/domain/StudyTopic";
import { StudyTopicRepository } from "@/infrastructure/repositories/StudyTopicRepository";

export class GetAllStudyTopicsUseCase {
    constructor(private studyTopicRepository: StudyTopicRepository) {}

    async execute(): Promise<StudyTopic[]> {
        return await this.studyTopicRepository.findAll();
    }
}
