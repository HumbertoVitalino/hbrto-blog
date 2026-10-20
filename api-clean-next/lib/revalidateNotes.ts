import 'server-only'

import { revalidatePath } from "next/cache";

/** Every server-rendered page that shows notes. */
export function revalidateNotes() {
    revalidatePath("/notes");
    revalidatePath("/notes/[noteId]", "page");
    revalidatePath("/");
}
