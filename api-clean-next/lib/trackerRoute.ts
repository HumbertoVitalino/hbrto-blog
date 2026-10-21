import 'server-only'

import { NextRequest, NextResponse } from "next/server";
import { adminAccessToken } from "@/lib/adminAuth";
import { clientForToken } from "@/infrastructure/supabase/userClient";
import { HabitRepository } from "@/infrastructure/repositories/HabitRepository";
import { ScheduleRepository } from "@/infrastructure/repositories/ScheduleRepository";
import { GoalRepository } from "@/infrastructure/repositories/GoalRepository";

export interface TrackerRepos {
    habits: HabitRepository;
    schedule: ScheduleRepository;
    goals: GoalRepository;
}

const NOT_FOUND = /not found/i;

/**
 * Wraps a habit-tracker route: only the admin gets in, and the repositories it hands over talk
 * to the database as the admin, so row level security applies to every query. Validation errors
 * become 400s and missing rows 404s.
 */
export function trackerRoute<P>(
    handler: (repos: TrackerRepos, request: NextRequest, params: P) => Promise<unknown>,
    successStatus = 200,
) {
    return async (request: NextRequest, context: { params: Promise<P> }) => {
        const token = await adminAccessToken(request);
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const db = clientForToken(token);
            const result = await handler({ habits: new HabitRepository(db), schedule: new ScheduleRepository(db), goals: new GoalRepository(db) }, request, await context.params);
            return result === undefined
                ? new NextResponse(null, { status: 204 })
                : NextResponse.json(result, { status: successStatus });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            return NextResponse.json({ error: message }, { status: NOT_FOUND.test(message) ? 404 : 400 });
        }
    };
}

/** The request body as an object, or an empty one when it isn't JSON. */
export async function jsonBody(request: NextRequest): Promise<Record<string, unknown>> {
    try {
        const body = await request.json();
        return body && typeof body === "object" ? body : {};
    } catch {
        return {};
    }
}
