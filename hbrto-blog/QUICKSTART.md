# 🚀 Quick Start - Dev Journal

Uma versão ultra rápida para colocar o projeto rodando em 5 minutos.

## ⚡ 1 Minuto - Setup Inicial

```bash
# Clonar + instalar
git clone [seu-repo]
cd hbrto-blog
npm install
```

## ⚡ 2 Minutos - Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto grátis
2. Copie a URL e a chave anônima
3. No dashboard Supabase, abra "SQL Editor"
4. Cole todo o conteúdo do arquivo `database.sql`
5. Execute a query completa

Pronto! Seu banco está criado com RLS ✅

## ⚡ 1 Minuto - Environment Variables

Crie `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## ⚡ 1 Minuto - Criar Usuário Admin

1. Supabase Dashboard → Authentication → Users
2. Clique "Add user"
3. Email: seu@email.com
4. Senha: sua-senha-forte
5. **Marque "Auto confirm user"** (temporário, desmarque depois)
6. Clique Add

## ✅ Pronto! Começar a usar

```bash
npm run dev
```

- **Home**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login

### No Admin
1. Login com seu email/senha
2. Dashboard aparece
3. Clique "Novo Post" para criar

### No Blog Público
1. Voltar para `/`
2. Posts irão aparecer quando você publicar

---

## 🎯 Fluxo de Uso

```
Usuario Público                 Administrador
    │                                │
    ├─ Acessar /       ───────┬──╌──┤
    │  Home/Blog        │ Login      
    │                   │ /admin/login
    │                   │
    ├─ Ver posts ◄──────┼──── Posts criados
    │  publicados        │
    │                   ├─ /admin/dashboard
    │                   │  Listar posts
    │                   │
    │                   ├─ /admin/dashboard/new
    │                   │  Criar novo
    │                   │
    └─ Ler post ◄───────┴──── Publicar post
       completo
```

## 📝 Estrutura Mínima Criada

```
✅ Database (SQL) completo
✅ API Routes (CRUD completo)
✅ Componentes UI (shadcn/ui)
✅ Autenticação (Supabase Auth)
✅ Páginas públicas (home + post)
✅ Dashboard admin (criar/editar/deletar)
✅ Middleware de proteção
✅ TypeScript tipagem completa
```

## 🐛 Se algo der errado

### "NEXT_PUBLIC_SUPABASE_URL is undefined"
→ Você esqueceu de criar `.env.local`

### "Failed to authenticate"  
→ Verifique email/senha no Supabase

### "Unauthorized" nas API routes
→ Você não fez login, acesse `/admin/login`

### "Posts not appearing"
→ Certifique-se que `published = true` no banco

## 📚 Próximas Leituras

Após tudo rodando:
1. Leia `README.md` para docs completas
2. Leia `DEPLOYMENT.md` para ir ao vivo
3. Leia `DEVELOPMENT.md` para estender features

## 🎓 Entender a Arquitetura

**Frontend (Public)**
- `/app/(public)` - Páginas públicas (Next.js Server Components)
- `/components/post` - Componentes de post

**Admin Area (Protected)**
- `/app/(admin)` - Rotas protegidas por middleware
- `/middleware.ts` - Valida autenticação

**Backend**
- `/app/api` - Route Handlers (API endpoints)
- `/lib/supabase*.ts` - Clientes do Supabase

**Database**
- `database.sql` - Schema + RLS policies

**UI Components**
- `/components/ui` - Componentes reutilizáveis (shadcn/ui)

## 🔐 Segurança Implementada

✅ RLS no banco (SQL policies)  
✅ Middleware valida autenticação  
✅ API routes checam `auth.uid()`  
✅ Apenas owner pode editar/deletar  
✅ Posts não publicados privados  

## 🚀 Deployar em 2 Minutos

```bash
git push origin main
# Vá para https://vercel.com
# Clique New Project
# Selecione seu repo
# Configure env vars
# Click Deploy
```

**Boom! 🎉 Seu blog está online**

---

**Dúvidas?**
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

**Feliz desenvolvendo!** ✨
