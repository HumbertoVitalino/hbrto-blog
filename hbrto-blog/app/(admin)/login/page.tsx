'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isConfigured, setIsConfigured] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      setIsConfigured(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Login realizado com sucesso!');
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              ⚙️ Configure Supabase
            </CardTitle>
            <CardDescription className="text-yellow-800 dark:text-yellow-200">
              Variáveis de ambiente não configuradas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              Para acessar a área administrativa, siga os passos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-yellow-800 dark:text-yellow-200 text-sm">
              <li>Crie um projeto em supabase.com</li>
              <li>Copie URL e Anon Key das Settings → API</li>
              <li>Configure as variáveis em `.env.local`</li>
              <li>Reinicie o servidor: npm run dev</li>
            </ol>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
          <CardDescription>
            Entre com suas credenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Voltar para home
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
