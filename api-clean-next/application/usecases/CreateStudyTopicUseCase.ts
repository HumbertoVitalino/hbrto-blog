import { StudyTopic } from "@/domain/StudyTopic";
import { StudyTopicStatus } from "@/domain/StudyTopicStatus";
import { StudyPriority } from "@/domain/StudyPriority";
import { StudyTopicRepository } from "@/infrastructure/repositories/StudyTopicRepository";

export interface CreateStudyTopicDTO {
    title: string;
    description?: string;
    status?: StudyTopicStatus;
    priority?: StudyPriority;
    resourceUrl?: string;
}

export class CreateStudyTopicUseCase {
    constructor(private studyTopicRepository: StudyTopicRepository) {}

    async execute(dto: CreateStudyTopicDTO): Promise<StudyTopic> {
        if (!dto.title) {
            throw new Error("Title is required");
        }

        const topic = new StudyTopic({
            id: crypto.randomUUID(),
            title: dto.title,
            description: dto.description,
            status: dto.status || StudyTopicStatus.Planned,
            priority: dto.priority || StudyPriority.Medium,
            resourceUrl: dto.resourceUrl
        });

        return await this.studyTopicRepository.create(topic);
    }
}
