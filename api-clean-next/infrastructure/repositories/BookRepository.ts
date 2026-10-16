import { Book } from "@/domain/Book";
import { supabase } from "../supabase/client";

type BookUpdate = Partial<Omit<Book, "id" | "completedAt">> & {
    // null clears the date; undefined leaves it untouched
    completedAt?: string | null
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDomain(row: any): Book {
    return new Book({
        id: row.id,
        title: row.title,
        author: row.author,
        pages: row.pages,
        genre: row.genre,
        coverImageUrl: row.cover_image_url,
        affiliateUrl: row.affiliate_url,
        status: row.status,
        completedAt: row.completed_at
    });
}

export class BookRepository {
    async findAll(): Promise<Book[]> {
        const { data, error } = await supabase
            .from("books")
            .select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data.map(toDomain);
    }

    async findById(id: string): Promise<Book | null> {
        const { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            throw new Error(error.message);
        }

        return toDomain(data);
    }

    async create(book: Omit<Book, "id">): Promise<Book> {
        const { data, error } = await supabase
            .from("books")
            .insert({
                title: book.title,
                author: book.author,
                pages: book.pages,
                genre: book.genre,
                cover_image_url: book.coverImageUrl,
                affiliate_url: book.affiliateUrl,
                status: book.status,
                completed_at: book.completedAt ?? null
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return toDomain(data);
    }

    async update(id: string, updates: BookUpdate): Promise<Book> {
        const { data, error } = await supabase
            .from("books")
            .update({
                ...(updates.title && { title: updates.title }),
                ...(updates.author && { author: updates.author }),
                ...(updates.pages !== undefined && { pages: updates.pages }),
                ...(updates.genre && { genre: updates.genre }),
                ...(updates.coverImageUrl && { cover_image_url: updates.coverImageUrl }),
                ...(updates.affiliateUrl !== undefined && { affiliate_url: updates.affiliateUrl || null }),
                ...(updates.status && { status: updates.status }),
                ...(updates.completedAt !== undefined && { completed_at: updates.completedAt })
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return toDomain(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("books")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
