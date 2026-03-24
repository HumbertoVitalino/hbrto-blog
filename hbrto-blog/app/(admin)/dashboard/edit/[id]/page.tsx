'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PostEditor } from '@/components/editor/PostEditor';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Post } from '@/types/post';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setPostId(id));
  }, [params]);

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Post não encontrado');
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        toast.error('Erro ao carregar post');
        router.push('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, router]);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    content: string;
    tags: string[];
    published: boolean;
  }) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar post');
      }

      toast.success('Post atualizado com sucesso!');
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Erro ao atualizar post'
      );
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!post) {
    return <div className="text-center py-12">Post não encontrado</div>;
  }

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
          <CardTitle>Editar Post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostEditor
            initialData={{
              title: post.title,
              content: post.content,
              tags: post.tags,
              published: post.published,
            }}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
