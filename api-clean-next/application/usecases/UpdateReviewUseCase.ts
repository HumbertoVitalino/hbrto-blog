import { Review } from "@/domain/Review";
import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export interface UpdateReviewDTO {
    rating?: number;
    comment?: string;
}

export class UpdateReviewUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(id: string, dto: UpdateReviewDTO): Promise<Review> {
        if (!id) {
            throw new Error("Review ID is required");
        }

        if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
            throw new Error("Rating must be between 1 and 5");
        }

        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new Error("Review not found");
        }

        return await this.reviewRepository.update(id, {
            rating: dto.rating ?? review.rating,
            comment: dto.comment ?? review.comment,
            bookId: review.bookId
        });
    }
}
