import { StudyEpic } from "@/domain/StudyEpic";
import { StudyEpicRepository } from "@/infrastructure/repositories/StudyEpicRepository";

export class GetAllStudyEpicsUseCase {
    constructor(private studyEpicRepository: StudyEpicRepository) {}

    async execute(): Promise<StudyEpic[]> {
        return await this.studyEpicRepository.findAll();
    }
}
