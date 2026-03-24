import { Post } from '@/types/post';
import { PostCard } from '@/components/post/PostCard';

interface PostListProps {
  posts: Post[];
  emptyMessage?: string;
}

export function PostList({ posts, emptyMessage = 'Nenhum post encontrado.' }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
