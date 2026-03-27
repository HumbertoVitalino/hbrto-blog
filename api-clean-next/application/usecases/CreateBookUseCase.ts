import { Book } from "@/domain/Book";
import { BookGenre } from "@/domain/BookGenre";
import { BookRepository } from "@/infrastructure/repositories/BookRepository";

export interface CreateBookDTO {
    title: string;
    author: string;
    pages: number;
    genre?: BookGenre;
}

export class CreateBookUseCase {
    constructor(private bookRepository: BookRepository) {}

    async execute(dto: CreateBookDTO): Promise<Book> {
        if (!dto.title || !dto.author || !dto.pages) {
            throw new Error("Title, author and pages are required");
        }

        if (dto.pages <= 0) {
            throw new Error("Pages must be greater than 0");
        }

        const book = new Book({
            id: crypto.randomUUID(),
            title: dto.title,
            author: dto.author,
            pages: dto.pages,
            genre: dto.genre
        });

        return await this.bookRepository.create(book);
    }
}
