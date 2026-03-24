import { createServerClient } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { method } = request;

  if (method === 'POST') {
    const body = await request.json();
    const { action, email, password } = body;

    const supabase = await createServerClient();

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      return NextResponse.json({ data });
    }

    if (action === 'logout') {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
