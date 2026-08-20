import { StudyTopic } from "@/domain/StudyTopic";
import { StudyTopicStatus } from "@/domain/StudyTopicStatus";
import { StudyPriority } from "@/domain/StudyPriority";
import { StudyTopicRepository } from "@/infrastructure/repositories/StudyTopicRepository";

export interface UpdateStudyTopicDTO {
    title?: string;
    description?: string;
    status?: StudyTopicStatus;
    priority?: StudyPriority;
    resourceUrl?: string;
}

export class UpdateStudyTopicUseCase {
    constructor(private studyTopicRepository: StudyTopicRepository) {}

    async execute(id: string, dto: UpdateStudyTopicDTO): Promise<StudyTopic> {
        if (!id) {
            throw new Error("Study topic ID is required");
        }

        const topic = await this.studyTopicRepository.findById(id);
        if (!topic) {
            throw new Error("Study topic not found");
        }

        return await this.studyTopicRepository.update(id, {
            title: dto.title ?? topic.title,
            description: dto.description !== undefined ? dto.description : topic.description,
            status: dto.status ?? topic.status,
            priority: dto.priority ?? topic.priority,
            resourceUrl: dto.resourceUrl !== undefined ? dto.resourceUrl : topic.resourceUrl
        });
    }
}
