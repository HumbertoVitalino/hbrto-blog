import { Review } from "@/domain/Review";
import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export class GetReviewsByBookIdUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(bookId: string): Promise<Review[]> {
        if (!bookId) {
            throw new Error("Book ID is required");
        }

        return await this.reviewRepository.findByBookId(bookId);
    }
}
