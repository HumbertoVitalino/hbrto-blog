# Guia de Deployment no Vercel

Este guia explica como fazer deploy da aplicação Dev Journal no Vercel.

## Pré-requisitos

- Conta GitHub com o repositório pushado
- Conta Vercel (grátis em [vercel.com](https://vercel.com))
- Credenciais Supabase prontas

## Passo a Passo

### 1. Build Local

Teste se a build funciona localmente:

```bash
npm run build
```

Deve completar sem erros.

### 2. Fazer Push para GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New..." → "Project"
4. Selecione seu repositório `hbrto-blog`
5. O Vercel detectará automaticamente que é um projeto Next.js
6. Deixe as configurações padrão (ROOT: `.`)

### 4. Configurar Variáveis de Ambiente

Antes de fazer deploy, configure as variáveis de ambiente:

1. Na tela de configuração do projeto no Vercel, encontre "Environment Variables"
2. Adicione as variáveis:

```
NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave-anonima-aqui
```

Obtenha estas chaves em:
- Supabase Dashboard → Seu Projeto → Settings → API

### 5. Deploy

Clique em "Deploy" na tela de configuração.

O Vercel irá:
1. Clonar o repositório
2. Instalar dependências
3. Fazer a build
4. Fazer deploy na CDN global

Processo leva geralmente 2-3 minutos.

### 6. Testar Deployment

Após completar, Vercel fornecerá uma URL como:
```
https://seu-app-abc123.vercel.app
```

Teste:
1. Acesse a home (deve listar posts publicados)
2. Acesse `/admin/login`
3. Faça login com suas credenciais
4. Crie um post de teste
5. Verifique se aparece na home após publicar

## Atualizações Futuras

Toda vez que você fizer push para `main`:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

Vercel automaticamente:
1. Detecta o novo push
2. Faz a build
3. Faz deploy de uma nova versão

## Environment Variables em Produção

Se precisar mudar variáveis depois:

1. Vercel Dashboard → Seu Projeto
2. Settings → Environment Variables
3. Edite ou adicione novas variáveis
4. Clique em "Save"
5. Vercel automaticamente fará redeploy com as novas variáveis

## Troubleshooting

### Build falha com erro de TypeScript

```
error TS2322: Type is not assignable
```

**Solução**: Verifique se todas as variáveis de ambiente estão configuradas no Vercel.

### Erro "NEXT_PUBLIC_SUPABASE_URL is undefined"

**Solução**: A variável está faltando em Environment Variables do Vercel. Adicione novamente.

### Erro ao fazer login em produção

**Solução**: Verifique:
1. Se as credenciais da Supabase estão corretas
2. Se o usuário existe no Supabase
3. Se as políticas RLS estão ativadas no banco

### Página fica em branco

**Solução**:
1. Verifique o console do navegador (F12)
2. Verifique os logs no Vercel: Dashboard → Seu Projeto → Deployments → Logs

## Custom Domain

Para usar seu próprio domínio:

1. Vercel Dashboard → Seu Projeto → Settings → Domains
2. Adicione seu domínio
3. Siga as instruções para configurar DNS
4. Pode levar até 48h para propagar

## Exemplo: Deploy com Custom Domain

```
https://seu-blog.com      → Home dev journal
https://seu-blog.com/admin/login → Login admin
```

## Rollback (Voltar versão anterior)

Se algo der errado após deploy:

1. Vercel Dashboard → Seu Projeto → Deployments
2. Encontre o deployment anterior que funcionava
3. Clique em "..." → "Redeploy"

Seu site voltará à versão anterior em segundos.

## Plano Grátis vs Pro

**Grátis (Hobbyist):**
- Deployments ilimitados
- Bandwidth limitado (100GB/mês)
- Suporta até 100 projetos

**Pro:**
- Bandwidth ilimitado
- Priority support
- Custos adicionais por uso

Para SaaS/Blogs, o plano grátis é suficiente.

## Performance & Otimizações

O Vercel automaticamente:
- Minifica código
- Comprime assets
- Cache em CDN global
- Faz lazy loading de imagens

Seu site será rápido em todo o mundo!

## Monitoramento

Acompanhe performance em:
- Vercel Dashboard → Analytics
- Web Vitals em tempo real
- Detecção automática de problemas

---

**Após seguir estes passos, seu Dev Journal estará online e acessível globalmente!** 🚀
