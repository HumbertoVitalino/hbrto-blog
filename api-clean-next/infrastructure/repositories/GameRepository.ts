import { Game } from '@/domain/Game'
import { GamePlatform } from '@/domain/GamePlatform'
import { GameStatus } from '@/domain/GameStatus'
import { supabase } from '../supabase/client'

export class GameRepository {
    async findAll(): Promise<Game[]> {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .order('title')

        if (error) throw new Error(error.message)

        return data.map((item) => new Game({
            id: item.id,
            title: item.title,
            platform: item.platform as GamePlatform,
            genre: item.genre,
            status: item.status as GameStatus,
            coverImageUrl: item.cover_image_url,
            totalHours: item.total_hours,
        }))
    }

    async findById(id: string): Promise<Game | null> {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw new Error(error.message)
        }

        return new Game({
            id: data.id,
            title: data.title,
            platform: data.platform as GamePlatform,
            genre: data.genre,
            status: data.status as GameStatus,
            coverImageUrl: data.cover_image_url,
            totalHours: data.total_hours,
        })
    }

    async create(game: Omit<Game, 'id'>): Promise<Game> {
        const { data, error } = await supabase
            .from('games')
            .insert({
                title: game.title,
                platform: game.platform,
                genre: game.genre,
                status: game.status,
                cover_image_url: game.coverImageUrl,
                total_hours: game.totalHours,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return new Game({
            id: data.id,
            title: data.title,
            platform: data.platform as GamePlatform,
            genre: data.genre,
            status: data.status as GameStatus,
            coverImageUrl: data.cover_image_url,
            totalHours: data.total_hours,
        })
    }

    async update(id: string, updates: Partial<Omit<Game, 'id'>>): Promise<Game> {
        const { data, error } = await supabase
            .from('games')
            .update({
                ...(updates.title && { title: updates.title }),
                ...(updates.platform && { platform: updates.platform }),
                ...(updates.genre !== undefined && { genre: updates.genre || null }),
                ...(updates.status && { status: updates.status }),
                ...(updates.coverImageUrl !== undefined && { cover_image_url: updates.coverImageUrl || null }),
                ...(updates.totalHours !== undefined && { total_hours: updates.totalHours || null }),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)

        return new Game({
            id: data.id,
            title: data.title,
            platform: data.platform as GamePlatform,
            genre: data.genre,
            status: data.status as GameStatus,
            coverImageUrl: data.cover_image_url,
            totalHours: data.total_hours,
        })
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('games')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
    }
}
