import { Review } from "@/domain/Review";
import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export interface CreateReviewDTO {
    bookId?: string | null;
    rating: number;
    comment: string;
}

export class CreateReviewUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(dto: CreateReviewDTO): Promise<Review> {
        if (!dto.comment) {
            throw new Error("Comment is required");
        }

        if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Handle bookId: convert empty string or whitespace to null
        const bookId = dto.bookId?.trim() || null;

        const review = new Review({
            id: crypto.randomUUID(),
            bookId: bookId,
            rating: dto.rating,
            comment: dto.comment
        });

        return await this.reviewRepository.create(review);
    }
}
