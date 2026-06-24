# Deploy no Vercel - Guia Rápido

## 🚀 Passo a Passo

### 1. Acesse o Vercel
- Vá para [vercel.com](https://vercel.com)
- Clique em **"Sign Up"** ou **"Login"**
- Use sua conta do **GitHub** para login

### 2. Importar o Projeto
1. No dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Clique em **"Import Git Repository"**
4. Procure por **"roda-da-vida"** na lista de repositórios
5. Clique em **"Import"**

### 3. Configurar o Deploy
Na tela de configuração:

- **Project Name**: `roda-da-vida` (ou o nome que preferir)
- **Framework Preset**: Deixe em **"Other"** (é um site estático)
- **Root Directory**: `./ ` (deixe como está)
- **Build Command**: (deixe vazio)
- **Output Directory**: (deixe vazio)

### 4. Variáveis de Ambiente (IMPORTANTE!)

⚠️ **NÃO adicione suas credenciais Supabase aqui!**

Como o projeto roda 100% no browser (client-side), as credenciais já estão no `config.js` que você configurou localmente.

Se quiser usar variáveis de ambiente no futuro:
1. Clique em **"Environment Variables"**
2. Adicione:
   - `VITE_SUPABASE_URL` = sua URL
   - `VITE_SUPABASE_ANON_KEY` = sua chave

(Mas não é necessário agora, pois já está funcionando)

### 5. Deploy!
1. Clique em **"Deploy"**
2. Aguarde 1-2 minutos
3. Pronto! ✨

Você verá:
- ✅ Building
- ✅ Deploying
- ✅ Ready

### 6. Acessar o Site

Após o deploy, você receberá uma URL tipo:
```
https://roda-da-vida-xxx.vercel.app
```

Clique para testar!

---

## 🔄 Deploys Automáticos

O Vercel está configurado para fazer deploy automático sempre que você fizer push para o GitHub:

```bash
git add .
git commit -m "Minha atualização"
git push
```

Em segundos, o Vercel detecta e faz o deploy automaticamente! 🎉

---

## 🎨 Personalizar o Domínio

### Opção 1: Subdomínio Vercel Personalizado
1. No dashboard do projeto, vá em **Settings**
2. Clique em **Domains**
3. Adicione: `meu-projeto.vercel.app`

### Opção 2: Domínio Próprio
1. Tenha um domínio (ex: GoDaddy, Registro.br)
2. No Vercel, vá em **Settings > Domains**
3. Adicione seu domínio: `exemplo.com.br`
4. Configure os DNS conforme instruções do Vercel

---

## ⚠️ Importante: Configuração Supabase

Após o deploy, você precisa **autorizar o domínio do Vercel no Supabase**:

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em **Authentication > URL Configuration**
3. Em **Site URL**, adicione: `https://seu-projeto.vercel.app`
4. Em **Redirect URLs**, adicione: `https://seu-projeto.vercel.app/**`

Isso permite que o login funcione corretamente no domínio do Vercel!

---

## 🧪 Testar o Deploy

Depois do deploy, teste:

1. ✅ Abrir o site
2. ✅ Preencher a Roda da Vida
3. ✅ Submeter (gerar PDF)
4. ✅ Cadastrar psicólogo
5. ✅ Fazer login
6. ✅ Ver submissões no portal

Se tudo funcionar, **está pronto para produção!** 🎉

---

## 📊 Monitoramento

No dashboard do Vercel você pode ver:
- 📈 Analytics (visitantes, pageviews)
- 🔍 Logs (erros, requisições)
- ⚡ Performance
- 🌍 Tráfego por região

---

## 🆘 Problemas Comuns

### Site não carrega
- Verifique se `index.html` está na raiz do repositório
- Veja os logs de build no Vercel

### Erro de CORS com Supabase
- Adicione o domínio Vercel nas configurações do Supabase (veja acima)

### Login não funciona
- Verifique as **Redirect URLs** no Supabase
- Confirme que adicionou o domínio Vercel

### PDFs não aparecem
- Verifique se o bucket `pdfs` é público no Supabase
- Confirme as políticas de Storage

---

## 🎉 Pronto!

Seu projeto está no ar! Compartilhe a URL com seus colegas e pacientes.

**URL do Projeto**: https://roda-da-vida-xxx.vercel.app (substituir quando souber)

Qualquer dúvida, consulte a [documentação do Vercel](https://vercel.com/docs).
