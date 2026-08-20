import { StudySession } from "@/domain/StudySession";
import { PomodoroPhaseType } from "@/domain/PomodoroPhaseType";
import { supabase } from "../supabase/client";

interface StudySessionRow {
    id: string
    topic_id: string
    phase_type: string
    planned_seconds: number
    actual_seconds: number
    completed: boolean
    started_at: string
    ended_at: string
}

function toStudySession(item: StudySessionRow): StudySession {
    return new StudySession({
        id: item.id,
        topicId: item.topic_id,
        phaseType: item.phase_type as PomodoroPhaseType,
        plannedSeconds: item.planned_seconds,
        actualSeconds: item.actual_seconds,
        completed: item.completed,
        startedAt: new Date(item.started_at),
        endedAt: new Date(item.ended_at)
    })
}

export class StudySessionRepository {
    async findAll(): Promise<StudySession[]> {
        const { data, error } = await supabase
            .from("study_sessions")
            .select("*")
            .order("started_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(toStudySession)
    }

    async findByTopicId(topicId: string): Promise<StudySession[]> {
        const { data, error } = await supabase
            .from("study_sessions")
            .select("*")
            .eq("topic_id", topicId)
            .order("started_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(toStudySession)
    }

    async create(session: Omit<StudySession, "id">): Promise<StudySession> {
        const { data, error } = await supabase
            .from("study_sessions")
            .insert({
                topic_id: session.topicId,
                phase_type: session.phaseType,
                planned_seconds: session.plannedSeconds,
                actual_seconds: session.actualSeconds,
                completed: session.completed,
                started_at: session.startedAt.toISOString(),
                ended_at: session.endedAt.toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return toStudySession(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("study_sessions")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
