'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostEditor } from '@/components/editor/PostEditor';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function NewPostPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    content: string;
    tags: string[];
    published: boolean;
  }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar post');
      }

      toast.success('Post criado com sucesso!');
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao criar post'
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm">
            ← Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostEditor onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
