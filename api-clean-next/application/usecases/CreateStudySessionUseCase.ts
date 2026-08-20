import { StudySession } from "@/domain/StudySession";
import { PomodoroPhaseType } from "@/domain/PomodoroPhaseType";
import { StudySessionRepository } from "@/infrastructure/repositories/StudySessionRepository";

export interface CreateStudySessionDTO {
    topicId: string;
    phaseType: PomodoroPhaseType;
    plannedSeconds: number;
    actualSeconds: number;
    completed?: boolean;
    startedAt: string;
    endedAt?: string;
}

export class CreateStudySessionUseCase {
    constructor(private studySessionRepository: StudySessionRepository) {}

    async execute(dto: CreateStudySessionDTO): Promise<StudySession> {
        if (!dto.topicId) {
            throw new Error("Topic ID is required");
        }

        if (!dto.plannedSeconds || dto.plannedSeconds <= 0) {
            throw new Error("Planned seconds must be greater than 0");
        }

        if (dto.actualSeconds == null || dto.actualSeconds < 0) {
            throw new Error("Actual seconds must be 0 or greater");
        }

        const session = new StudySession({
            id: crypto.randomUUID(),
            topicId: dto.topicId,
            phaseType: dto.phaseType,
            plannedSeconds: dto.plannedSeconds,
            actualSeconds: dto.actualSeconds,
            completed: dto.completed ?? false,
            startedAt: new Date(dto.startedAt),
            endedAt: dto.endedAt ? new Date(dto.endedAt) : new Date()
        });

        return await this.studySessionRepository.create(session);
    }
}
