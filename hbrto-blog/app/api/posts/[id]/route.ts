import { createServerClient } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts/[id] - Get post by id or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // Try to fetch by id first, then by slug
    let { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      // Try fetching by slug
      const { data: slugData, error: slugError } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', id)
        .single();

      if (slugError || !slugData) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      data = slugData;
    }

    // Check if user is authenticated and owns the post (for unpublished posts)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!data.published && (!user || user.id !== data.user_id)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, slug, content, tags, published } = body;

    // Get the post first to check ownership
    const { data: post, error: getError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: title || post.title,
        slug: slug || post.slug,
        content: content || post.content,
        tags: tags !== undefined ? tags : post.tags,
        published: published !== undefined ? published : post.published,
      })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the post first to check ownership
    const { data: post, error: getError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
