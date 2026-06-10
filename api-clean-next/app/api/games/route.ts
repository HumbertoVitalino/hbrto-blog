import { GameRepository } from '@/infrastructure/repositories/GameRepository'
import {
    GetAllGamesUseCase,
    GetGameByIdUseCase,
    CreateGameUseCase,
    UpdateGameUseCase,
    DeleteGameUseCase,
} from '@/application/usecases'
import { gamesToPlain, gameToPlain } from '@/lib/mappers'
import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/infrastructure/supabase/client'

async function isAdmin(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) return false

        const token = authHeader.slice(7)
        const { data, error } = await supabase.auth.getUser(token)

        if (error || !data.user) return false

        return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    } catch {
        return false
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const repo = new GameRepository()

        if (id) {
            const useCase = new GetGameByIdUseCase(repo)
            const game = await useCase.execute(id)

            if (!game) {
                return NextResponse.json({ error: 'Game not found' }, { status: 404 })
            }

            return NextResponse.json(gameToPlain(game))
        }

        const useCase = new GetAllGamesUseCase(repo)
        const games = await useCase.execute()
        return NextResponse.json(gamesToPlain(games))
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized. Only admin can create.' }, { status: 401 })
        }

        const body = await request.json()
        const repo = new GameRepository()
        const useCase = new CreateGameUseCase(repo)

        const game = await useCase.execute({
            title: body.title,
            platform: body.platform,
            genre: body.genre,
            status: body.status,
            coverImageUrl: body.coverImageUrl,
            totalHours: body.totalHours,
        })

        return NextResponse.json(gameToPlain(game), { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized. Only admin can update.' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
        }

        const body = await request.json()
        const repo = new GameRepository()
        const useCase = new UpdateGameUseCase(repo)

        const game = await useCase.execute(id, {
            title: body.title,
            platform: body.platform,
            genre: body.genre,
            status: body.status,
            coverImageUrl: body.coverImageUrl,
            totalHours: body.totalHours,
        })

        return NextResponse.json(gameToPlain(game))
    } catch (error: any) {
        if (error.message === 'Game not found') {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!await isAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized. Only admin can delete.' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
        }

        const repo = new GameRepository()
        const useCase = new DeleteGameUseCase(repo)
        await useCase.execute(id)

        return NextResponse.json({ message: 'Game deleted successfully' })
    } catch (error: any) {
        if (error.message === 'Game not found') {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
