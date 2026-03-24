# Dev Journal - Blog Técnico Fullstack

Uma aplicação fullstack completa para um blog técnico, diário de estudos (Dev Journal) e portfolio, construída com Next.js, TypeScript, Supabase e TailwindCSS.

## 🎯 Características

- **Blog Público**: Visualização de posts publicados por slug
- **Dev Journal**: Registro de aprendizado e estudos
- **Portfolio**: Showcase de projetos e posts
- **Área Administrativa Privada**: Criar, editar e deletar posts
- **Autenticação Segura**: Via Supabase Auth (apenas 1 usuário admin)
- **Row Level Security (RLS)**: Políticas de segurança no banco de dados
- **UI Moderna**: Componentes shadcn/ui com TailwindCSS
- **Dark Mode**: Suporte completo a modo escuro

## 🧱 Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Estilização**: TailwindCSS 4, shadcn/ui
- **Backend**: Next.js Route Handlers
- **Database**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel

## 📐 Arquitetura

```
app/
├── (public)          # Rotas públicas
│   ├── page.tsx      # Home - lista de posts
│   ├── post/[slug]   # Visualizar post por slug
│   └── layout.tsx    # Layout público
├── (admin)           # Rotas administrativas (protegidas)
│   ├── login/        # Página de login
│   ├── dashboard/    # Dashboard admin
│   │   ├── page.tsx  # Lista de posts do admin
│   │   ├── new/      # Criar novo post
│   │   └── edit/[id] # Editar post
│   ├── api/          # API de logout
│   └── layout.tsx    # Layout admin com proteção
├── api/
│   ├── posts/        # CRUD de posts
│   ├── user/posts    # Posts do usuário autenticado
│   └── auth/         # Autenticação
└── globals.css

components/
├── ui/               # Componentes shadcn (Button, Card, Input, etc)
├── post/             # Componentes de post (PostCard, PostList)
└── editor/           # PostEditor

lib/
├── supabaseClient.ts # Cliente Supabase (browser)
├── supabaseServer.ts # Cliente Supabase (server)
└── utils.ts          # Utilitários (cn, generateSlug, formatDate)

types/
└── post.ts           # Tipos TypeScript
```

## 🚀 Setup Inicial

### 1. Clonar repositório

```bash
git clone [seu-repo]
cd hbrto-blog
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Criar projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais do projeto

#### 3.2 Configurar banco de dados
1. No dashboard Supabase, abra o SQL Editor
2. Execute o arquivo `database.sql` completo
3. Isso criará:
   - Tabela `posts` com os campos necessários
   - Índices para performance
   - Políticas RLS (Row Level Security)
   - Trigger para atualizar `updated_at`

#### 3.3 Criar usuário admin
1. No Supabase, vá para Authentication → Users
2. Clique em "Add user"
3. Insira seu email e senha
4. **IMPORTANTE**: Desabilite "Auto confirm user" para evitar que outros se registrem

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Preenchha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

Obtenha estas chaves em: Supabase Dashboard → Settings → API Keys

### 5. Executar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📚 Como Usar

### Acessar Public Blog
- Página inicial: `/` (lista de posts publicados)
- Post individual: `/post/[slug]`
- Admin: `/admin/login`

### Login Admin
- Email: seu email cadastrado no Supabase
- Senha: a senha que você criou

### Dashboard Admin
- Criar post: `/admin/dashboard/new`
- Listar posts: `/admin/dashboard` (mostra rascunhos e publicados)
- Editar post: `/admin/dashboard/edit/[id]`
- Deletar post: Botão na lista do dashboard

## 🔐 Autenticação e Segurança

### RLS Policies (Row Level Security)

As políticas implementadas garantem:

1. **SELECT (Leitura)**
   - Posts publicados: leitura pública
   - Posts não publicados: apenas o dono pode ver

2. **INSERT (Criação)**
   - Apenas usuários autenticados podem criar posts
   - O `user_id` é definido automaticamente

3. **UPDATE (Atualização)**
   - Apenas o dono do post pode atualizar

4. **DELETE (Deleção)**
   - Apenas o dono do post pode deletar

### Proteção de Rotas

- Middleware (`middleware.ts`) verifica autenticação
- Rotas `/admin/*` redirecionam para `/admin/login` se não autenticado
- API routes verificam `auth.uid()` do Supabase

## 📝 API Endpoints

### Posts Públicos

```bash
# Listar posts publicados
GET /api/posts

# Listar posts com tag específica
GET /api/posts?tag=javascript

# Obter post por ID ou slug
GET /api/posts/[id-ou-slug]
```

### Posts do Admin (Autenticado)

```bash
# Criar novo post
POST /api/posts
Body: {
  title: string
  slug: string
  content: string
  tags: string[]
  published: boolean
}

# Atualizar post
PUT /api/posts/[id]

# Deletar post
DELETE /api/posts/[id]

# Obter posts do usuário autenticado
GET /api/user/posts
```

## 🛠️ Componentes e Utilidades

### Componentes UI (shadcn/ui)

- `Button`: Botão com variantes (default, destructive, outline, etc)
- `Card`: Container principal
- `Input`: Campo de texto
- `Textarea`: Área de texto
- `Badge`: Tags/labels
- `Dialog`: Modal de confirmação

### Componentes Custom

- `PostCard`: Exibe um post em card
- `PostList`: Lista de posts
- `PostEditor`: Editor de posts com tags e preview

### Utilidades

```typescript
// Gerar slug
generateSlug("Meu Novo Post") // "meu-novo-post"

// Formatar data
formatDate("2024-03-23T10:30:00Z") // "23 de março de 2024"

// Merge de classes
cn("px-2", condition && "bg-red-500") // Merge TailwindCSS com class-variance
```

## 📦 Dependências Principais

```json
{
  "next": "16.2.1",
  "react": "19.2.4",
  "typescript": "^5",
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest",
  "tailwindcss": "^4",
  "lucide-react": "latest",
  "react-hot-toast": "latest",
  "slug": "latest",
  "date-fns": "latest"
}
```

## 🚀 Deploy no Vercel

### 1. Preparar para produção

```bash
npm run build
```

### 2. Fazer push para GitHub

```bash
git add .
git commit -m "Setup completo do Dev Journal"
git push origin main
```

### 3. Fazer deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em "Deploy"

## 🔧 Variáveis de Ambiente

### Desenvolvimento (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=seu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Produção (Vercel)

Configure as mesmas variáveis no dashboard Vercel:
1. Projeto → Settings → Environment Variables
2. Adicione as variáveis da Supabase

## 📋 Detalhes do Banco de Dados

### Tabela: `posts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `title` | TEXT | Título do post |
| `slug` | TEXT | URL-friendly (único) |
| `content` | TEXT | Conteúdo do post |
| `tags` | TEXT[] | Array de tags |
| `published` | BOOLEAN | Publicado ou rascunho |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |
| `user_id` | UUID | Referência ao usuário |

## 🎨 Personalização

### Mudar cores/tema

Edite as classes TailwindCSS nos componentes ou em `globals.css`.

Exemplos:
- Cores primárias: `bg-blue-600` → `bg-purple-600`
- Dark mode: Já habilitado em `html` tag

### Adicionar mais campos ao post

1. Modificar SQL: adicionar coluna na tabela `posts`
2. Atualizar `types/post.ts`: adicionar campo no tipo
3. Atualizar componente `PostEditor` com novo campo
4. Atualizar API routes para validar o novo campo

## 🐛 Troubleshooting

### Erro: "Unauthorized" ao fazer login

- Verifique se o usuário existe em Supabase → Authentication → Users
- Verifique o email e senha
- Confirme que a chave anônima está correta

### Erro: "RLS policy violation"

- Verifique as políticas RLS no Supabase SQL Editor
- Confirme que o `user_id` é passado corretamente

### Posts não aparecem

- Confirme que `published = true` no banco
- Verifique as políticas RLS de SELECT
- Verifique a resposta da API em `/api/posts`

### Erro ao editar post

- Verifique se você é o dono do post
- Verifique se o ID do post existe
- Confirme que o token de autenticação é válido

## 📞 Suporte

Para dúvidas sobre Supabase:
- [Documentação Supabase](https://supabase.com/docs)
- [Comunidade Supabase](https://supabase.io/community)

## 📄 Licença

MIT - Fique livre para usar e modificar ✨

## 🙏 Créditos

Construído com ❤️ usando Next.js, TypeScript e Supabase
