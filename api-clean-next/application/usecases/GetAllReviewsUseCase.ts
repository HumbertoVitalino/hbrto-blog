import { Review } from "@/domain/Review";
import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export class GetAllReviewsUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(): Promise<Review[]> {
        return await this.reviewRepository.findAll();
    }
}
