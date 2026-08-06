// Configuração do Supabase
// IMPORTANTE: 
// 1. Copie este arquivo para "config.js"
// 2. Substitua com suas credenciais do Supabase
// 3. Acesse https://supabase.com
// 4. Crie um novo projeto
// 5. Vá em Settings > API
// 6. Copie a URL e a chave anon key

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-publica-aqui';

// Não altere abaixo desta linha
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
