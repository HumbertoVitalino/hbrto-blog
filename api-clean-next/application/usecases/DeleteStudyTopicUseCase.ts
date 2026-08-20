import { StudyTopicRepository } from "@/infrastructure/repositories/StudyTopicRepository";

export class DeleteStudyTopicUseCase {
    constructor(private studyTopicRepository: StudyTopicRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) {
            throw new Error("Study topic ID is required");
        }

        const topic = await this.studyTopicRepository.findById(id);
        if (!topic) {
            throw new Error("Study topic not found");
        }

        await this.studyTopicRepository.delete(id);
    }
}
