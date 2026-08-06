# Roda da Vida - Psicologia Interativa

Sistema web interativo para psicólogos realizarem avaliações com adolescentes usando a técnica da Roda da Vida, com integração de Forças VIA e portal administrativo.

## 🚀 Funcionalidades

- **Roda da Vida Adolescente**: Avaliação interativa em 8 áreas da vida
- **Forças**: 24 cards com forças de caráter
- **Portal do Psicólogo**: Sistema de autenticação e gestão de submissões
- **Geração de PDF**: Relatórios automáticos das avaliações
- **Responsivo**: Otimizado para celular e desktop
- **Persistência**: Dados salvos no Supabase

## 🛠️ Tecnologias

- HTML5 Canvas (gráfico interativo)
- CSS3 (responsivo com Flexbox)
- JavaScript (Vanilla JS)
- Supabase (Backend as a Service)
- jsPDF (geração de PDFs)

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Eduardo-Me-llo/roda-da-vida.git
cd roda-da-vida
```

### 2. Configure o Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > API** e copie:
   - Project URL
   - Anon/Public Key

### 3. Configure as credenciais

Edite o arquivo `config.js` e substitua:

```javascript
const SUPABASE_URL = 'https://lxlezgufbdrqmedvhpcf.supabase.co';
const SUPABASE_ANON_KEY = 'postgresql://postgres:[Vascodagama1998!]@db.lxlezgufbdrqmedvhpcf.supabase.co:5432/postgres';
```

### 4. Configure o banco de dados

Execute os seguintes comandos SQL no **SQL Editor** do Supabase:

```sql
-- Criar tabela de submissões
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  patient_name TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  wheel_data JSONB NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (psicólogos autenticados podem ver tudo)
CREATE POLICY "Authenticated users can view submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (true);

-- Permitir submissões anônimas (pacientes)
CREATE POLICY "Anyone can create submissions"
  ON submissions FOR INSERT
  TO anon
  WITH CHECK (true);
```

### 5. Configure o Storage

No Supabase:

1. Vá em **Storage**
2. Clique em **New bucket**
3. Nome: `pdfs`
4. Deixe **Public bucket** marcado
5. Clique em **Create bucket**

### 6. Abra o projeto

Simplesmente abra o arquivo `index.html` no navegador ou use um servidor local:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server
```

Acesse: `http://localhost:8000`

## 👥 Como usar

### Para Pacientes/Adolescentes

1. Acesse a aba **"Roda da Vida Adolescente"**
2. Clique nas áreas do gráfico para avaliar cada área (1-10)
3. Clique em **"Submeter Respostas"**
4. Digite seu nome
5. O PDF será gerado e salvo automaticamente

### Para Psicólogos

1. Acesse a aba **"Portal"**
2. Se não tiver conta, clique em **"Cadastre-se"**
3. Preencha seus dados e cadastre-se
4. Faça login com seu e-mail e senha
5. Visualize todas as submissões de pacientes
6. Baixe os PDFs ou exclua submissões antigas

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco de dados
- PDFs armazenados de forma segura no Supabase Storage
- Senhas criptografadas automaticamente

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- ✅ Desktop (1920px+)
- ✅ Tablets (768px - 1024px)
- ✅ Celulares (320px - 768px)
- ✅ Touch events (toque na tela)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Eduardo Mello

## 🐛 Problemas conhecidos

Se encontrar erros de CORS ou configuração:
1. Verifique se as credenciais do Supabase estão corretas
2. Confirme que as tabelas e bucket foram criados
3. Verifique as políticas de RLS no Supabase

## 📞 Suporte

Para dúvidas ou problemas, abra uma [issue](https://github.com/SEU_USUARIO/roda-da-vida/issues) no GitHub.
