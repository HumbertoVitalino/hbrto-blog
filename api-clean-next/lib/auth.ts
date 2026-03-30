import { supabase } from '@/infrastructure/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function validateAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        valid: false,
        error: 'Token not provided',
        status: 401
      }
    }

    const token = authHeader.slice(7)

    return {
      valid: true,
      error: null,
      status: 200
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Error validating token',
      status: 401
    }
  }
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

export function forbidden() {
  return NextResponse.json(
    { error: 'Access denied' },
    { status: 403 }
  )
}
