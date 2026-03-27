import { Book } from "@/domain/Book";
import { BookRepository } from "@/infrastructure/repositories/BookRepository";

export class GetBookByIdUseCase {
    constructor(private bookRepository: BookRepository) {}

    async execute(id: string): Promise<Book | null> {
        return await this.bookRepository.findById(id);
    }
}
