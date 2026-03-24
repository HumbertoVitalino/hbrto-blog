import { Post } from '@/types/post';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <Link href={`/post/${post.slug}`}>
          <CardTitle className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
            {post.title}
          </CardTitle>
        </Link>
        <CardDescription>{formatDate(post.created_at)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.content}
        </p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
