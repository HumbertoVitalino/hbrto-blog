# Guia de Desenvolvimento - Dev Journal

Instruções para estender e melhorar o projeto Dev Journal.

## 📁 Estrutura de Projetos

```
lib/
├── supabaseClient.ts    # Cliente browser (use client)
├── supabaseServer.ts    # Cliente server
└── utils.ts             # Funções úteis

types/
└── post.ts              # Tipos globais

components/
├── ui/                  # Componentes shadcn (reutilizáveis)
├── post/                # Componentes específicos de post
└── editor/              # Componentes de edição

app/
├── (public)/            # Rutas públicas
├── (admin)/             # Rotas protegidas por autenticação
└── api/                 # Route Handlers da API
```

## 🔧 Adicionar Novas Funcionalidades

### Adicionar Campo ao Post

Exemplo: Adicionar campo `excerpt` (resumo) ao post:

#### 1. Update Database Schema

```sql
ALTER TABLE posts ADD COLUMN excerpt TEXT;
```

#### 2. Update TypeScript Type

`types/post.ts`:
```typescript
export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;  // ← NEW
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
};
```

#### 3. Update PostEditor Component

```tsx
const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');

// In form...
<div>
  <label>Resumo (excerpt)</label>
  <Textarea
    value={excerpt}
    onChange={(e) => setExcerpt(e.target.value)}
    placeholder="Resumo curto..."
    rows={3}
  />
</div>

// In submit...
await onSubmit({
  // ...
  excerpt,  // ← NEW
});
```

#### 4. Update API Routes

`app/api/posts/route.ts`:
```typescript
const { title, slug, content, excerpt, tags, published } = body;

const { data, error } = await supabase
  .from('posts')
  .insert([{
    title,
    slug,
    content,
    excerpt,  // ← NEW
    tags: tags || [],
    published: published || false,
    user_id: user.id,
  }])
```

#### 5. Update PostCard Component

```tsx
<CardContent>
  <p className="text-sm text-gray-600 mb-4">
    {post.excerpt || post.content.substring(0, 150)}...
  </p>
</CardContent>
```

### Adicionar Sistema de Comentários

#### 1. Criar Tabela Comments

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved comments
CREATE POLICY "Comments are readable"
ON comments FOR SELECT
USING (approved = true);

-- Anyone can insert
CREATE POLICY "Anyone can comment"
ON comments FOR INSERT
WITH CHECK (true);
```

#### 2. Criar API para Comments

`app/api/comments/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  const { post_id, author, email, content } = await request.json();
  
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id, author, email, content }]);
  
  // Send email notification...
  
  return NextResponse.json(data[0]);
}
```

### Adicionar Search de Posts

#### 1. Criar Função Supabase

```sql
CREATE FUNCTION search_posts(query TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  content TEXT,
  tags TEXT[],
  published BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  user_id UUID
) AS $$
SELECT * FROM posts
WHERE published = true
AND (
  title ILIKE '%' || query || '%'
  OR content ILIKE '%' || query || '%'
  OR tags @> ARRAY[query]
)
ORDER BY created_at DESC;
$$ LANGUAGE SQL;
```

#### 2. Criar API Endpoint

`app/api/search/route.ts`:
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json([]);
  
  const supabase = await createServerClient();
  const { data } = await supabase.rpc('search_posts', { query: q });
  
  return NextResponse.json(data);
}
```

## 🎨 UI Customization

### Mudar Paleta de Cores

Em `components/ui/` arquivos, procure por cores Tailwind:

```typescript
// Before
className="bg-blue-600 hover:bg-blue-700"

// After
className="bg-purple-600 hover:bg-purple-700"
```

Cores principais:
- Primary: `blue-600`
- Danger: `red-600`
- Success: `green-600`
- Warning: `yellow-600`

### Adicionar Modo Claro

Em alguns componentes:
```tsx
<div className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
```

O modo dark já está configurado em `app/layout.tsx`.

## 📊 Analytics

### Google Analytics

```tsx
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout() {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=GA_ID`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_ID');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🔍 SEO Improvements

### Meta Tags Dinâmicos

`app/(public)/post/[slug]/page.tsx`:
```typescript
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.created_at,
    },
  };
}
```

### Sitemap Automático

```typescript
// app/sitemap.ts
import { createServerClient } from '@/lib/supabaseServer';

export default async function sitemap() {
  const supabase = await createServerClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('published', true);

  return [
    {
      url: 'https://seu-blog.com',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...posts.map(post => ({
      url: `https://seu-blog.com/post/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
```

## 🧪 Testing

### Setup de Testes

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

`jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Exemplo de Teste

`components/post/PostCard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  it('renders post title', () => {
    const post = {
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
      content: 'Content',
      tags: [],
      published: true,
      created_at: '2024-03-23T10:00:00Z',
      updated_at: '2024-03-23T10:00:00Z',
      user_id: '123',
    };

    render(<PostCard post={post} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
```

## 📈 Performance

### Image Optimization

Para adicionar imagens aos posts:

```typescript
// Next.js Image
import Image from 'next/image';

<Image
  src="/posts/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>
```

### Code Splitting

Componentes pesados podem ser lazy-loaded:

```typescript
import dynamic from 'next/dynamic';

const AdvancedEditor = dynamic(
  () => import('@/components/editor/AdvancedEditor'),
  { loading: () => <p>Loading editor...</p> }
);
```

## 🔐 Security

### Validação Input

```typescript
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(50000),
  tags: z.array(z.string()).max(10),
});

// In API
const parsed = createPostSchema.parse(body);
```

### Rate Limiting

```bash
npm install @vercel/kv
```

```typescript
import { Ratelimit } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

const { success } = await ratelimit.limit(`api_${user.id}`);
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

## 📱 Mobile Optimizations

### Responsive Design

Todos os componentes já devem ser responsive usando TailwindCSS:

```tsx
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* Mobile: 1 coluna, Tablet: melhor spacing */}
</div>
```

### Touch-friendly

```tsx
<Button
  className="h-12 md:h-10"  // Maior em mobile
  onClick={handleClick}
>
  Click me
</Button>
```

## 🚀 Próximos Passos Sugeridos

1. **Categories/Series**: Agrupar posts por catégoria
2. **Comments**: Sistema de comentários com aprovação
3. **Newsletter**: Inscrição para emails
4. **Reading Time**: Estimativa de tempo de leitura
5. **Social Sharing**: Botões de compartilhamento
6. **Dark Mode Toggle**: Seletor de tema
7. **Related Posts**: Posts relacionados
8. **Search**: Busca de posts
9. **Statistics**: Analytics de visitantes
10. **RSS Feed**: Feed de posts

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org/)

---

**Happy coding!** 🎉
