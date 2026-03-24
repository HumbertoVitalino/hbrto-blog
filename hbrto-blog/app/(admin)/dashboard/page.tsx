'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Post } from '@/types/post';
import { formatDate } from '@/lib/utils';
import { Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/user/posts');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar posts');
      }
      
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      toast.error('Erro ao carregar posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar post');
      }

      toast.success('Post deletado com sucesso');
      setPosts(posts.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      toast.error('Erro ao deletar post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blog posts
          </p>
        </div>
        <Link href="/admin/dashboard/new">
          <Button>Novo Post</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Carregando posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você ainda não criou nenhum post
            </p>
            <Link href="/admin/dashboard/new">
              <Button>Criar primeiro post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      {formatDate(post.created_at)}
                      {post.published ? (
                        <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Publicado
                        </Badge>
                      ) : (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                          Rascunho
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/dashboard/edit/${post.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Dialog open={deleteId === post.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Deletar post?</DialogTitle>
                          <DialogDescription>
                            Esta ação não pode ser desfeita.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(post.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deletando...' : 'Deletar'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {post.content.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
