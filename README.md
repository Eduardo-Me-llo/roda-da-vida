# Roda da Vida - Psicologia Interativa

Sistema web interativo para psicólogos realizarem avaliações com adolescentes usando a técnica da Roda da Vida, com integração de Forças de carater e portal administrativo.

## 🚀 Funcionalidades

- **Roda da Vida Adolescente**: Avaliação interativa em 8 áreas da vida
- **Forças**: 24 cards com forças de caráter
- **Portal do Psicólogo**: Sistema de autenticação e gestão de submissões
- **Geração de PDF**: Relatórios automáticos das avaliações
- **Responsivo**: Otimizado para celular e desktop


## 🛠️ Tecnologias

- HTML5 Canvas (gráfico interativo)
- CSS3 (responsivo com Flexbox)
- JavaScript (Vanilla JS)
- Supabase (Backend as a Service)
- jsPDF (geração de PDFs)



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

Eduardo de Mello
