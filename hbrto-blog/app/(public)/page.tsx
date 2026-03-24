import { createServerClient } from '@/lib/supabaseServer';
import { PostList } from '@/components/post/PostList';
import { Post } from '@/types/post';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Home() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    const supabase = await createServerClient();

    // Fetch published posts
    const { data, error: dbError } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (dbError) {
      error = dbError.message;
    } else {
      posts = data || [];
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro ao conectar ao banco de dados';
  }

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Dev Journal</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Documentando minha jornada como desenvolvedor fullstack
        </p>
      </section>

      {error && error.includes('placeholder') ? (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ⚙️ Supabase Não Configurado
            </h2>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Para ver posts, configure o Supabase:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200 text-sm mb-4">
              <li>Crie uma conta em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
              <li>Crie um novo projeto</li>
              <li>Copie a URL e chave anônima</li>
              <li>Edite <code className="bg-blue-100 dark:bg-blue-900 px-2 rounded">.env.local</code> com seus valores</li>
              <li>Reinicie o servidor</li>
            </ol>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Leia <code className="bg-blue-100 dark:bg-blue-900 px-2 rounded">QUICKSTART.md</code> para um guia passo a passo
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-800 dark:text-red-200">
              Erro ao carregar posts: {error}
            </p>
          </CardContent>
        </Card>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
}
