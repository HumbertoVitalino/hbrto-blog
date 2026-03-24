'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

interface PostEditorProps {
  initialData?: {
    title: string;
    content: string;
    tags: string[];
    published: boolean;
  };
  onSubmit: (data: {
    title: string;
    slug: string;
    content: string;
    tags: string[];
    published: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  showPublishOption?: boolean;
}

export function PostEditor({
  initialData,
  onSubmit,
  isLoading = false,
  showPublishOption = true,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [published, setPublished] = useState(initialData?.published || false);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    try {
      await onSubmit({
        title,
        slug: generateSlug(title),
        content,
        tags,
        published,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar post');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Título</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do post"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Conteúdo</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva seu post aqui... (suporta markdown)"
          rows={12}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Digite uma tag e pressione Enter"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={isLoading}
            variant="secondary"
          >
            Adicionar
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} className="pl-2">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {showPublishOption && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            disabled={isLoading}
            className="rounded border-gray-300"
          />
          <label htmlFor="published" className="text-sm font-medium cursor-pointer">
            Publicar agora
          </label>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
