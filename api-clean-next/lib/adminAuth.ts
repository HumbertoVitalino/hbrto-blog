import 'server-only'

import { NextRequest } from "next/server";
import { supabase } from "@/infrastructure/supabase/client";

/** The admin's access token when the request carries a valid one, otherwise null. */
export async function adminAccessToken(request: NextRequest): Promise<string | null> {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return null;

        const token = authHeader.slice(7);
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) return null;

        return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? token : null;
    } catch {
        return null;
    }
}

/** True when the request carries the admin's Supabase access token. */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
    return (await adminAccessToken(request)) !== null;
}
