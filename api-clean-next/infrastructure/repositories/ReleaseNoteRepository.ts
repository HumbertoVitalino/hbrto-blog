import { ReleaseNote } from "@/domain/ReleaseNote"
import { supabase } from "../supabase/client"

export class ReleaseNoteRepository {
    async findAll(): Promise<ReleaseNote[]> {
        const { data, error } = await supabase
            .from("release_notes")
            .select("*")
            .order("published_at", { ascending: false })

        if (error) throw new Error(error.message)

        return data.map((item) => new ReleaseNote({
            id: item.id,
            version: item.version,
            title: item.title,
            description: item.description,
            publishedAt: new Date(item.published_at),
        }))
    }

    async findById(id: string): Promise<ReleaseNote | null> {
        const { data, error } = await supabase
            .from("release_notes")
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            if (error.code === "PGRST116") return null
            throw new Error(error.message)
        }

        return new ReleaseNote({
            id: data.id,
            version: data.version,
            title: data.title,
            description: data.description,
            publishedAt: new Date(data.published_at),
        })
    }

    async create(props: { version: string; title: string; description: string }): Promise<ReleaseNote> {
        const { data, error } = await supabase
            .from("release_notes")
            .insert({
                version: props.version,
                title: props.title,
                description: props.description,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return new ReleaseNote({
            id: data.id,
            version: data.version,
            title: data.title,
            description: data.description,
            publishedAt: new Date(data.published_at),
        })
    }

    async update(id: string, props: Partial<{ version: string; title: string; description: string }>): Promise<ReleaseNote> {
        const { data, error } = await supabase
            .from("release_notes")
            .update({
                ...(props.version && { version: props.version }),
                ...(props.title && { title: props.title }),
                ...(props.description !== undefined && { description: props.description }),
            })
            .eq("id", id)
            .select()
            .single()

        if (error) throw new Error(error.message)

        return new ReleaseNote({
            id: data.id,
            version: data.version,
            title: data.title,
            description: data.description,
            publishedAt: new Date(data.published_at),
        })
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("release_notes")
            .delete()
            .eq("id", id)

        if (error) throw new Error(error.message)
    }
}
