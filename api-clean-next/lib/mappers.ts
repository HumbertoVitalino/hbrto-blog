import { Book } from "@/domain/Book";
import { Note } from "@/domain/Note";
import { Subscriber } from "@/domain/Subscriber";
import { Game } from "@/domain/Game";
import { StudyTopic } from "@/domain/StudyTopic";
import { StudySession } from "@/domain/StudySession";
import { StudyEpic } from "@/domain/StudyEpic";

export function bookToPlain(book: Book) {
    return {
        id: book.id,
        title: book.title,
        author: book.author,
        pages: book.pages,
        genre: book.genre,
        coverImageUrl: book.coverImageUrl,
        affiliateUrl: book.affiliateUrl,
        status: book.status,
        completedAt: book.completedAt ?? null
    };
}

export function booksToPlain(books: Book[]) {
    return books.map(bookToPlain);
}

export function noteToPlain(note: Note) {
    return {
        id: note.id,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        entries: note.entries,
        subjects: note.subjects,
    };
}

export function notesToPlain(notes: Note[]) {
    return notes.map(noteToPlain);
}

/** A note as it crosses to the browser: the API's JSON and server-rendered props share this shape. */
export type NoteData = ReturnType<typeof noteToPlain>;

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
        epicId: topic.epicId,
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

export function studyEpicToPlain(epic: StudyEpic) {
    return {
        id: epic.id,
        title: epic.title,
        description: epic.description,
        status: epic.status,
        color: epic.color,
        targetSeconds: epic.targetSeconds,
        createdAt: epic.createdAt,
    };
}

export function studyEpicsToPlain(epics: StudyEpic[]) {
    return epics.map(studyEpicToPlain);
}
