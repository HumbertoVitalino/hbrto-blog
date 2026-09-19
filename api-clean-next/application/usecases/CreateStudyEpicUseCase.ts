import { StudyEpic } from "@/domain/StudyEpic";
import { StudyEpicStatus } from "@/domain/StudyEpicStatus";
import { StudyEpicRepository } from "@/infrastructure/repositories/StudyEpicRepository";

export interface CreateStudyEpicDTO {
    title: string;
    description?: string;
    status?: StudyEpicStatus;
    color?: string;
    targetSeconds?: number;
}

export class CreateStudyEpicUseCase {
    constructor(private studyEpicRepository: StudyEpicRepository) {}

    async execute(dto: CreateStudyEpicDTO): Promise<StudyEpic> {
        if (!dto.title) {
            throw new Error("Title is required");
        }

        const epic = new StudyEpic({
            id: crypto.randomUUID(),
            title: dto.title,
            description: dto.description,
            status: dto.status || StudyEpicStatus.Planned,
            color: dto.color,
            targetSeconds: dto.targetSeconds
        });

        return await this.studyEpicRepository.create(epic);
    }
}
