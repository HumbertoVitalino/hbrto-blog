import { BookRepository } from "@/infrastructure/repositories/BookRepository";

export class DeleteBookUseCase {
    constructor(private bookRepository: BookRepository) {}

    async execute(id: string): Promise<void> {
        if (!id) {
            throw new Error("Book ID is required");
        }

        const book = await this.bookRepository.findById(id);
        if (!book) {
            throw new Error("Book not found");
        }

        await this.bookRepository.delete(id);
    }
}
