import { ReviewRepository } from "@/infrastructure/repositories/ReviewRepository";

export class DeleteReviewUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) {
            throw new Error("Review ID is required");
        }

        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new Error("Review not found");
        }

        await this.reviewRepository.delete(id);
    }
}
