import { supabase } from "@/infrastructure/supabase/client";

const BUCKET_NAME = "book-covers";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadBookCoverResult {
    url: string;
    path: string;
}

export async function uploadBookCover(
    file: File,
    bookId: string
): Promise<UploadBookCoverResult> {
    // Validações
    if (!file) {
        throw new Error("Arquivo não selecionado");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Arquivo muito grande. Máximo 5MB");
    }

    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
        throw new Error("Formato inválido. Use JPG, PNG ou WebP");
    }

    // Gerar nome único: bookId/timestamp-randomString.ext
    const ext = file.name.split(".").pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = `${bookId}/${timestamp}-${random}.${ext}`;

    try {
        // Upload para Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            throw new Error(`Upload falhou: ${error.message}`);
        }

        // Construir URL pública
        const {
            data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

        return {
            url: publicUrl,
            path: fileName,
        };
    } catch (error) {
        throw new Error(
            `Erro ao fazer upload: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

export async function deleteBookCover(filePath: string): Promise<void> {
    if (!filePath) return;

    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error("Erro ao deletar imagem:", error);
            // Não lança erro para não bloquear delete do livro
        }
    } catch (error) {
        console.error("Erro ao deletar imagem:", error);
    }
}
