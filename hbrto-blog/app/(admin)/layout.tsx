'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
          if (!pathname.includes('login')) {
            router.push('/admin/login');
          }
        } else {
          setUser(data.user);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao verificar autenticação';
        setError(errorMessage);

        if (!pathname.includes('login')) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (
    error &&
    error.includes('URL') &&
    error.includes('Key')
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-4">
                ⚙️ Configure Supabase
              </h1>
              <p className="text-yellow-800 dark:text-yellow-200 mb-6">
                Para acessar a área administrativa, configure as variáveis de
                ambiente do Supabase em `.env.local`
              </p>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-xl font-bold hover:text-blue-600 dark:hover:text-blue-400">
              Admin
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Logado como: {user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Ver Blog
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}

function LogoutButton() {
  return (
    <form action="/admin/api/logout" method="POST">
      <Button type="submit" variant="destructive" size="sm">
        Logout
      </Button>
    </form>
  );
}
