import { supabase } from '@/infrastructure/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function validateAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Token não fornecido',
        status: 401
      }
    }

    const token = authHeader.slice(7)

    // Optionally validate the token server-side
    // For now, we trust the client-side session
    return {
      valid: true,
      error: null,
      status: 200
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Erro ao validar token',
      status: 401
    }
  }
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Não autorizado' },
    { status: 401 }
  )
}

export function forbidden() {
  return NextResponse.json(
    { error: 'Acesso proibido' },
    { status: 403 }
  )
}
