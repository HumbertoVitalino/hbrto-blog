import { Book } from "@/domain/Book";
import { BookRepository } from "@/infrastructure/repositories/BookRepository";

export interface UpdateBookDTO {
    title?: string;
    author?: string;
    pages?: number;
}

export class UpdateBookUseCase {
    constructor(private bookRepository: BookRepository) {}

    async execute(id: string, dto: UpdateBookDTO): Promise<Book> {
        if (!id) {
            throw new Error("Book ID is required");
        }

        const book = await this.bookRepository.findById(id);
        if (!book) {
            throw new Error("Book not found");
        }

        if (dto.pages !== undefined && dto.pages <= 0) {
            throw new Error("Pages must be greater than 0");
        }

        return await this.bookRepository.update(id, {
            title: dto.title ?? book.title,
            author: dto.author ?? book.author,
            pages: dto.pages ?? book.pages
        });
    }
}
