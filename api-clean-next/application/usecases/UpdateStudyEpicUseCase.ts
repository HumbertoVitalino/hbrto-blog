import { StudyEpic } from "@/domain/StudyEpic";
import { StudyEpicStatus } from "@/domain/StudyEpicStatus";
import { StudyEpicRepository } from "@/infrastructure/repositories/StudyEpicRepository";

export interface UpdateStudyEpicDTO {
    title?: string;
    description?: string;
    status?: StudyEpicStatus;
    color?: string;
    targetSeconds?: number | null;
}

export class UpdateStudyEpicUseCase {
    constructor(private studyEpicRepository: StudyEpicRepository) {}

    async execute(id: string, dto: UpdateStudyEpicDTO): Promise<StudyEpic> {
        if (!id) {
            throw new Error("Study epic ID is required");
        }

        const epic = await this.studyEpicRepository.findById(id);
        if (!epic) {
            throw new Error("Study epic not found");
        }

        return await this.studyEpicRepository.update(id, {
            title: dto.title ?? epic.title,
            description: dto.description !== undefined ? dto.description : epic.description,
            status: dto.status ?? epic.status,
            color: dto.color ?? epic.color,
            targetSeconds: dto.targetSeconds !== undefined ? (dto.targetSeconds ?? undefined) : epic.targetSeconds
        });
    }
}
