import { Book } from "@/domain/Book";
import { BookRepository } from "@/infrastructure/repositories/BookRepository";

export class GetAllBooksUseCase {
    constructor(private bookRepository: BookRepository) {}

    async execute(): Promise<Book[]> {
        return await this.bookRepository.findAll();
    }
}
