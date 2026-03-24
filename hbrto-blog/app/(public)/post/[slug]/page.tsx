import { createServerClient } from '@/lib/supabaseServer';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const supabase = await createServerClient();

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !post) {
      notFound();
    }

    return (
      <article className="max-w-2xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            ← Voltar
          </Button>
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
            {post.updated_at > post.created_at && (
              <span>Atualizado em {formatDate(post.updated_at)}</span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <div className="prose dark:prose-invert max-w-none">
          <div
            className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    );
  } catch (error) {
    return (
      <div className="max-w-2xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            ← Voltar
          </Button>
        </Link>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚙️ Configure Supabase
            </h2>
            <p className="text-yellow-800 dark:text-yellow-200">
              Para acessar posts, configure as variáveis de ambiente do Supabase em `.env.local`
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
