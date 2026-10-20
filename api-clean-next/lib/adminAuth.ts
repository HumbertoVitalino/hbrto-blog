import 'server-only'

import { NextRequest } from "next/server";
import { supabase } from "@/infrastructure/supabase/client";

/** True when the request carries the admin's Supabase access token. */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return false;

        const { data, error } = await supabase.auth.getUser(authHeader.slice(7));
        if (error || !data.user) return false;

        return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    } catch {
        return false;
    }
}
