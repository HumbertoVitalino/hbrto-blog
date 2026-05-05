import { Book } from "@/domain/Book";
import { supabase } from "../supabase/client";

export class BookRepository {
    async findAll(): Promise<Book[]> {
        const { data, error } = await supabase
            .from("books")
            .select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data.map(
            (item) =>
                new Book({
                    id: item.id,
                    title: item.title,
                    author: item.author,
                    pages: item.pages,
                    genre: item.genre,
                    coverImageUrl: item.cover_image_url,
                    affiliateUrl: item.affiliate_url,
                    status: item.status
                })
        )
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

        return new Book({
            id: data.id,
            title: data.title,
            author: data.author,
            pages: data.pages,
            genre: data.genre,
            coverImageUrl: data.cover_image_url,
            status: data.status
        });
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
                status: book.status
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Book({
            id: data.id,
            title: data.title,
            author: data.author,
            pages: data.pages,
            genre: data.genre,
            coverImageUrl: data.cover_image_url,
            status: data.status
        });
    }

    async update(id: string, updates: Partial<Omit<Book, "id">>): Promise<Book> {
        const { data, error } = await supabase
            .from("books")
            .update({
                ...(updates.title && { title: updates.title }),
                ...(updates.author && { author: updates.author }),
                ...(updates.pages !== undefined && { pages: updates.pages }),
                ...(updates.genre && { genre: updates.genre }),
                ...(updates.coverImageUrl && { cover_image_url: updates.coverImageUrl }),
                ...(updates.affiliateUrl !== undefined && { affiliate_url: updates.affiliateUrl || null }),
                ...(updates.status && { status: updates.status })
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Book({
            id: data.id,
            title: data.title,
            author: data.author,
            pages: data.pages,
            genre: data.genre,
            coverImageUrl: data.cover_image_url,
            status: data.status
        });
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