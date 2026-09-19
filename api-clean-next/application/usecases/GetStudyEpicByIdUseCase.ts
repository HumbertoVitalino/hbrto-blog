import { StudyEpic } from "@/domain/StudyEpic";
import { StudyEpicRepository } from "@/infrastructure/repositories/StudyEpicRepository";

export class GetStudyEpicByIdUseCase {
    constructor(private studyEpicRepository: StudyEpicRepository) {}

    async execute(id: string): Promise<StudyEpic | null> {
        return await this.studyEpicRepository.findById(id);
    }
}
