# Configuração do Supabase - Passo a Passo

## 1️⃣ Criar Conta e Projeto

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub, Google ou e-mail
4. Clique em **"New project"**
5. Escolha:
   - **Name**: Roda da Vida
   - **Database Password**: (crie uma senha forte)
   - **Region**: South America (São Paulo) - para menor latência
   - **Pricing Plan**: Free (suficiente para começar)
6. Clique em **"Create new project"**
7. Aguarde 2-3 minutos até o projeto estar pronto

## 2️⃣ Copiar Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie os seguintes valores:
   - **Project URL** (exemplo: `https://xyzabc123.supabase.co`)
   - **anon public** key (uma chave longa começando com `eyJ...`)

4. Cole esses valores no arquivo `config.js`:

```javascript
const SUPABASE_URL = 'https://xyzabc123.supabase.co'; // Cole sua URL aqui
const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Cole sua chave aqui
```

## 3️⃣ Configurar Banco de Dados

1. No menu lateral, clique em **SQL Editor**
2. Clique em **"New query"**
3. Cole o código SQL abaixo:

```sql
-- 1. Criar tabela de submissões
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  patient_name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  wheel_data JSONB NOT NULL
);

-- 2. Criar índice para melhor performance
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 4. Permitir que qualquer pessoa (pacientes) possa criar submissões
CREATE POLICY "Anyone can create submissions"
  ON submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Apenas psicólogos autenticados podem ver submissões
CREATE POLICY "Authenticated users can view submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (true);

-- 6. Apenas psicólogos autenticados podem deletar submissões
CREATE POLICY "Authenticated users can delete submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (true);
```

4. Clique em **"Run"** (ou pressione `Ctrl+Enter`)
5. Você deve ver: **"Success. No rows returned"**

## 4️⃣ Configurar Storage (Armazenamento de PDFs)

1. No menu lateral, clique em **Storage**
2. Clique em **"Create a new bucket"**
3. Configure:
   - **Name**: `pdfs`
   - **Public bucket**: ✅ **MARCADO** (importante!)
   - **File size limit**: 5 MB (padrão está ok)
4. Clique em **"Create bucket"**

### Configurar Políticas do Bucket

1. Na lista de buckets, clique nos 3 pontinhos do bucket `pdfs`
2. Clique em **"Edit policies"**
3. Clique em **"New policy"**
4. Para **INSERT** (Upload):
   - Nome: `Allow anon uploads`
   - Policy definition: 
   ```sql
   true
   ```
   - Target roles: `anon, authenticated`
   - Clique em **"Review"** e depois **"Save policy"**

5. Clique em **"New policy"** novamente
6. Para **SELECT** (Download):
   - Nome: `Allow public downloads`
   - Policy definition:
   ```sql
   true
   ```
   - Target roles: `anon, authenticated`
   - Clique em **"Review"** e depois **"Save policy"**

## 5️⃣ Configurar Autenticação

1. No menu lateral, clique em **Authentication**
2. Clique em **Settings** (dentro de Authentication)
3. Configure:
   - **Enable Email Confirmations**: ✅ **MARCADO** (recomendado)
   - **Minimum password length**: 6 (ou deixe padrão)
   
4. Opcional: Configure o template de e-mail em **Email Templates**

## 6️⃣ Testar a Configuração

### Teste 1: Criar um Psicólogo (Signup)

1. Abra o arquivo `index.html` no navegador
2. Vá para a aba **"Portal"**
3. Clique em **"Cadastre-se"**
4. Preencha os dados e clique em **"Cadastrar"**
5. Verifique seu e-mail e confirme o cadastro (se habilitou confirmação)

### Teste 2: Fazer Login

1. Use o e-mail e senha que você cadastrou
2. Clique em **"Entrar"**
3. Você deve ver a tela de submissões

### Teste 3: Criar uma Submissão

1. Vá para a aba **"Roda da Vida Adolescente"**
2. Clique no gráfico para preencher as áreas
3. Clique em **"Submeter Respostas"**
4. Digite um nome e clique em **"Gerar PDF"**
5. Volte ao Portal e veja se a submissão aparece

## 🎉 Pronto!

Se todos os testes funcionaram, sua configuração está completa!

## 🔍 Verificar no Supabase

### Ver dados salvos:

1. No Supabase, vá em **Table Editor**
2. Clique na tabela `submissions`
3. Você deve ver os registros das submissões

### Ver PDFs salvos:

1. No Supabase, vá em **Storage**
2. Clique no bucket `pdfs`
3. Você deve ver os arquivos PDF

## ⚠️ Solução de Problemas Comuns

### Erro: "Failed to fetch"
- Verifique se copiou corretamente a URL e a chave
- Verifique sua conexão com a internet

### Erro: "Invalid API key"
- Certifique-se de copiar a chave **anon public** (não a service_role)

### Erro: "Permission denied"
- Verifique se executou todos os comandos SQL
- Verifique se o bucket é público
- Verifique as políticas do Storage

### PDFs não aparecem
- Verifique se o bucket `pdfs` é público
- Verifique as políticas de SELECT no Storage

### Não consegue fazer login
- Confirme seu e-mail (se habilitou confirmação)
- Verifique se a senha tem no mínimo 6 caracteres

## 📊 Limites do Plano Gratuito

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/mês
- **Auth users**: Ilimitado

Para a maioria dos casos de uso, isso é mais do que suficiente!

## 🚀 Próximos Passos

Depois de configurado, você pode:
- Personalizar as cores e textos
- Adicionar mais campos ao formulário
- Criar relatórios mais detalhados
- Adicionar gráficos de evolução
- Integrar com outros serviços

## 💡 Dicas

- **Backup**: O Supabase faz backup automático, mas você pode exportar os dados em **Database > Backups**
- **Monitoramento**: Veja uso de recursos em **Settings > Usage**
- **Logs**: Veja logs de API em **Logs** no menu lateral
