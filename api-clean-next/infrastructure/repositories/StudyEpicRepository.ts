import { StudyEpic } from "@/domain/StudyEpic";
import { supabase } from "../supabase/client";

export class StudyEpicRepository {
    async findAll(): Promise<StudyEpic[]> {
        const { data, error } = await supabase
            .from("study_epics")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(
            (item) =>
                new StudyEpic({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    status: item.status,
                    color: item.color,
                    targetSeconds: item.target_seconds ?? undefined,
                    createdAt: item.created_at ? new Date(item.created_at) : new Date()
                })
        )
    }

    async findById(id: string): Promise<StudyEpic | null> {
        const { data, error } = await supabase
            .from("study_epics")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            throw new Error(error.message);
        }

        return new StudyEpic({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status,
            color: data.color,
            targetSeconds: data.target_seconds ?? undefined,
            createdAt: data.created_at ? new Date(data.created_at) : new Date()
        });
    }

    async create(epic: Omit<StudyEpic, "id" | "createdAt">): Promise<StudyEpic> {
        const { data, error } = await supabase
            .from("study_epics")
            .insert({
                title: epic.title,
                description: epic.description,
                status: epic.status,
                color: epic.color,
                target_seconds: epic.targetSeconds ?? null
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new StudyEpic({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status,
            color: data.color,
            targetSeconds: data.target_seconds ?? undefined,
            createdAt: data.created_at ? new Date(data.created_at) : new Date()
        });
    }

    async update(id: string, updates: Partial<Omit<StudyEpic, "id" | "createdAt">>): Promise<StudyEpic> {
        const { data, error } = await supabase
            .from("study_epics")
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.color !== undefined && { color: updates.color }),
                ...(updates.targetSeconds !== undefined && { target_seconds: updates.targetSeconds })
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new StudyEpic({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status,
            color: data.color,
            targetSeconds: data.target_seconds ?? undefined,
            createdAt: data.created_at ? new Date(data.created_at) : new Date()
        });
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("study_epics")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
