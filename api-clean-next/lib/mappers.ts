import { Book } from "@/domain/Book";
import { Review } from "@/domain/Review";
import { ReleaseNote } from "@/domain/ReleaseNote";
import { Subscriber } from "@/domain/Subscriber";
import { Game } from "@/domain/Game";
import { StudyTopic } from "@/domain/StudyTopic";
import { StudySession } from "@/domain/StudySession";

export function bookToPlain(book: Book) {
    return {
        id: book.id,
        title: book.title,
        author: book.author,
        pages: book.pages,
        genre: book.genre,
        coverImageUrl: book.coverImageUrl,
        affiliateUrl: book.affiliateUrl,
        status: book.status
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
        createdAt: review.createdAt,
        language: review.language,
    };
}

export function reviewsToPlain(reviews: Review[]) {
    return reviews.map(reviewToPlain);
}

export function releaseNoteToPlain(note: ReleaseNote) {
    return {
        id: note.id,
        version: note.version,
        title: note.title,
        description: note.description,
        publishedAt: note.publishedAt,
    };
}

export function releaseNotesToPlain(notes: ReleaseNote[]) {
    return notes.map(releaseNoteToPlain);
}

export function subscriberToPlain(subscriber: Subscriber) {
    return {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
        isActive: subscriber.isActive
    };
}

export function subscribersToPlain(subscribers: Subscriber[]) {
    return subscribers.map(subscriberToPlain);
}

export function gameToPlain(game: Game) {
    return {
        id: game.id,
        title: game.title,
        platform: game.platform,
        genre: game.genre,
        status: game.status,
        coverImageUrl: game.coverImageUrl,
        totalHours: game.totalHours,
    };
}

export function gamesToPlain(games: Game[]) {
    return games.map(gameToPlain);
}

export function studyTopicToPlain(topic: StudyTopic) {
    return {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        status: topic.status,
        priority: topic.priority,
        resourceUrl: topic.resourceUrl,
        createdAt: topic.createdAt,
    };
}

export function studyTopicsToPlain(topics: StudyTopic[]) {
    return topics.map(studyTopicToPlain);
}

export function studySessionToPlain(session: StudySession) {
    return {
        id: session.id,
        topicId: session.topicId,
        phaseType: session.phaseType,
        plannedSeconds: session.plannedSeconds,
        actualSeconds: session.actualSeconds,
        completed: session.completed,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
    };
}

export function studySessionsToPlain(sessions: StudySession[]) {
    return sessions.map(studySessionToPlain);
}
