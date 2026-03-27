import { Review } from "@/domain/Review";
import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export class GetReviewByIdUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(id: string): Promise<Review | null> {
        if (!id) {
            throw new Error("Review ID is required");
        }

        return await this.reviewRepository.findById(id);
    }
}
