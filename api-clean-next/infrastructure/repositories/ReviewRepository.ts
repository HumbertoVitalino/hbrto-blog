import { Review } from "@/domain/Review";
import { supabase } from "../supabase/client";

export class ReviewRepository {
    async findAll(): Promise<Review[]> {
        const { data, error } = await supabase
            .from("reviews")
            .select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data.map(
            (item) =>
                new Review({
                    id: item.id,
                    bookId: item.book_id,
                    rating: item.rating,
                    comment: item.comment
                }))
    }

    async findById(id: string): Promise<Review | null> {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            throw new Error(error.message);
        }

        return new Review({
            id: data.id,
            bookId: data.book_id,
            rating: data.rating,
            comment: data.comment
        });
    }

    async findByBookId(bookId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("book_id", bookId);

        if (error) {
            throw new Error(error.message);
        }

        return data.map(
            (item) =>
                new Review({
                    id: item.id,
                    bookId: item.book_id,
                    rating: item.rating,
                    comment: item.comment
                }))
    }

    async create(review: Omit<Review, "id">): Promise<Review> {
        const { data, error } = await supabase
            .from("reviews")
            .insert({
                book_id: review.bookId,
                rating: review.rating,
                comment: review.comment
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Review({
            id: data.id,
            bookId: data.book_id,
            rating: data.rating,
            comment: data.comment
        });
    }

    async update(id: string, updates: Partial<Omit<Review, "id">>): Promise<Review> {
        const { data, error } = await supabase
            .from("reviews")
            .update({
                ...(updates.rating !== undefined && { rating: updates.rating }),
                ...(updates.comment && { comment: updates.comment })
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return new Review({
            id: data.id,
            bookId: data.book_id,
            rating: data.rating,
            comment: data.comment
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