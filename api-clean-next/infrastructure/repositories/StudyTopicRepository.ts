import { StudyTopic } from "@/domain/StudyTopic";
import { supabase } from "../supabase/client";

export class StudyTopicRepository {
    async findAll(): Promise<StudyTopic[]> {
        const { data, error } = await supabase
            .from("study_topics")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map(
            (item) =>
                new StudyTopic({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    status: item.status,
                    priority: item.priority,
                    resourceUrl: item.resource_url,
                    createdAt: item.created_at ? new Date(item.created_at) : new Date()
                })
        )
    }

    async findById(id: string): Promise<StudyTopic | null> {
        const { data, error } = await supabase
            .from("study_topics")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            throw new Error(error.message);
        }

        return new StudyTopic({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            resourceUrl: data.resource_url,
            createdAt: data.created_at ? new Date(data.created_at) : new Date()
        });
    }

    async create(topic: Omit<StudyTopic, "id" | "createdAt">): Promise<StudyTopic> {
        const { data, error } = await supabase
            .from("study_topics")
            .insert({
                title: topic.title,
                description: topic.description,
                status: topic.status,
                priority: topic.priority,
                resource_url: topic.resourceUrl
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new StudyTopic({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            resourceUrl: data.resource_url,
            createdAt: data.created_at ? new Date(data.created_at) : new Date()
        });
    }

    async update(id: string, updates: Partial<Omit<StudyTopic, "id" | "createdAt">>): Promise<StudyTopic> {
        const { data, error } = await supabase
            .from("study_topics")
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.priority !== undefined && { priority: updates.priority }),
                ...(updates.resourceUrl !== undefined && { resource_url: updates.resourceUrl || null })
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new StudyTopic({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            resourceUrl: data.resource_url,
            createdAt: data.created_at ? new Date(data.created_at) : new Date()
        });
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("study_topics")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
