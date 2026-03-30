import { Book } from "@/domain/Book";
import { Review } from "@/domain/Review";

export function bookToPlain(book: Book) {
    return {
        id: book.id,
        title: book.title,
        author: book.author,
        pages: book.pages,
        genre: book.genre
    };
}

export function booksToPlain(books: Book[]) {
    return books.map(bookToPlain);
}

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

export function reviewsToPlain(reviews: Review[]) {
    return reviews.map(reviewToPlain);
}
