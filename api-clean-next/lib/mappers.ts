import { Book } from "@/domain/Book";
import { Review } from "@/domain/Review";

/**
 * Converte uma instância de Book para um objeto plano
 * Necessário porque propriedades private não são serializadas em JSON
 */
export function bookToPlain(book: Book) {
    return {
        id: book.id,
        title: book.title,
        author: book.author,
        pages: book.pages,
        genre: book.genre
    };
}

/**
 * Converte um array de Books para objetos planos
 */
export function booksToPlain(books: Book[]) {
    return books.map(bookToPlain);
}

/**
 * Converte uma instância de Review para um objeto plano
 */
export function reviewToPlain(review: Review) {
    return {
        id: review.id,
        title: review.title,
        bookId: review.bookId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
    };
}

/**
 * Converte um array de Reviews para objetos planos
 */
export function reviewsToPlain(reviews: Review[]) {
    return reviews.map(reviewToPlain);
}
