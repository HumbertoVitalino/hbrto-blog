import { BookRepository } from "@/infrastructure/repositories/BookRepository";
import { deleteBookCover } from "@/lib/uploadBookCover";

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

        // Deletar imagem do storage se existir
        if (book.coverImageUrl) {
            // Extrair o path da URL pública
            const match = book.coverImageUrl.match(/book-covers\/(.+)$/);
            if (match) {
                await deleteBookCover(match[1]);
            }
        }

        await this.bookRepository.delete(id);
    }
}
