import { createServerClient } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  redirect('/');
}
