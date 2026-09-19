import { StudyEpicRepository } from "@/infrastructure/repositories/StudyEpicRepository";

export class DeleteStudyEpicUseCase {
    constructor(private studyEpicRepository: StudyEpicRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) {
            throw new Error("Study epic ID is required");
        }

        const epic = await this.studyEpicRepository.findById(id);
        if (!epic) {
            throw new Error("Study epic not found");
        }

        await this.studyEpicRepository.delete(id);
    }
}
