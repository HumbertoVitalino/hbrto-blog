import { Review, ReviewLanguage } from "@/domain/Review";
import { supabase } from "../supabase/client";

export class ReviewRepository {
    async findAll(): Promise<Review[]> {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map((item) => new Review({
            id: item.id,
            title: item.title,
            bookId: item.book_id,
            rating: item.rating,
            comment: item.comment,
            createdAt: item.created_at ? new Date(item.created_at) : new Date(),
            language: (item.language as ReviewLanguage) ?? 'en',
        }))
    }

    async findById(id: string): Promise<Review | null> {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(error.message);
        }

        return new Review({
            id: data.id,
            title: data.title,
            bookId: data.book_id,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            language: (data.language as ReviewLanguage) ?? 'en',
        });
    }

    async findByBookId(bookId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("book_id", bookId)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data.map((item) => new Review({
            id: item.id,
            title: item.title,
            bookId: item.book_id,
            rating: item.rating,
            comment: item.comment,
            createdAt: item.created_at ? new Date(item.created_at) : new Date(),
            language: (item.language as ReviewLanguage) ?? 'en',
        }))
    }

    async create(review: Omit<Review, "id">): Promise<Review> {
        const { data, error } = await supabase
            .from("reviews")
            .insert({
                title: review.title,
                book_id: review.bookId,
                rating: review.rating,
                comment: review.comment,
                language: review.language,
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Review({
            id: data.id,
            title: data.title,
            bookId: data.book_id,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            language: (data.language as ReviewLanguage) ?? 'en',
        });
    }

    async update(id: string, updates: Partial<Omit<Review, "id">>): Promise<Review> {
        const { data, error } = await supabase
            .from("reviews")
            .update({
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.rating !== undefined && { rating: updates.rating }),
                ...(updates.comment !== undefined && { comment: updates.comment }),
                ...(updates.language !== undefined && { language: updates.language }),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Review({
            id: data.id,
            title: data.title,
            bookId: data.book_id,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.created_at ? new Date(data.created_at) : new Date(),
            language: (data.language as ReviewLanguage) ?? 'en',
        });
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("reviews")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }
    }
}