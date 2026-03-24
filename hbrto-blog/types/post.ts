export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type CreatePostInput = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePostInput = Partial<Omit<Post, 'id' | 'created_at' | 'user_id'>>;
