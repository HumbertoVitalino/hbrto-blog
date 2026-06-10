import { Review, ReviewLanguage } from "@/domain/Review";
import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export interface CreateReviewDTO {
    title: string;
    bookId?: string | null;
    rating: number;
    comment: string;
    language?: ReviewLanguage;
}

export class CreateReviewUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(dto: CreateReviewDTO): Promise<Review> {
        if (!dto.title) {
            throw new Error("Title is required");
        }

        if (!dto.comment) {
            throw new Error("Comment is required");
        }

        if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        const bookId = dto.bookId?.trim() || null;

        const review = new Review({
            id: crypto.randomUUID(),
            title: dto.title,
            bookId,
            rating: dto.rating,
            comment: dto.comment,
            language: dto.language ?? 'en',
        });

        return await this.reviewRepository.create(review);
    }
}
