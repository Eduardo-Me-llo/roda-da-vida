/* ============================
   Variáveis Globais
   ============================ */
let currentUser = null;

/* ============================
   Lógica das Abas
   ============================ */
function openTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
    
    // Se abrir portal e estiver logado, carregar submissões
    if (tabId === 'portal-psico' && currentUser) {
        loadSubmissions();
    }
}

/* ============================
   Lógica da Roda da Vida Teen
   ============================ */
const canvas = document.getElementById('rodaCanvas');
const ctx = canvas.getContext('2d');

// Tornar canvas responsivo
let canvasSize = Math.min(600, window.innerWidth - 40);
canvas.width = canvasSize;
canvas.height = canvasSize;

// Atualizar tamanho do canvas quando a janela for redimensionada
window.addEventListener('resize', () => {
    const oldSize = canvasSize;
    canvasSize = Math.min(600, window.innerWidth - 40);
    if (canvasSize !== oldSize) {
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        drawWheel();
    }
});

const getCenterAndRadius = () => {
    const size = canvas.width;
    return {
        cx: size / 2,
        cy: size / 2,
        maxR: size * 0.38
    };
};

const categories = [
    { name: 'ESCOLA', color: '#ff6b6b' },
    { name: 'NOTAS', color: '#4ecdc4' },
    { name: 'FAMÍLIA', color: '#9b59b6' },
    { name: 'AMIGOS', color: '#f1c40f' },
    { name: 'SAÚDE', color: '#3498db' },
    { name: 'DIVERSÃO', color: '#e74c3c' },
    { name: 'AUTO-\nCONCEITO', color: '#2ecc71' },
    { name: 'CRESCIMENTO', color: '#e67e22' }
];

let wheelState = [0, 0, 0, 0, 0, 0, 0, 0];

function drawWheel() {
    const { cx, cy, maxR } = getCenterAndRadius();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Desenhar Fatias Preenchidas
    for (let i = 0; i < 8; i++) {
        let startAngle = (i * 45 - 90) * Math.PI / 180;
        let endAngle = ((i + 1) * 45 - 90) * Math.PI / 180;
        
        let level = wheelState[i];
        if (level > 0) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, (level / 10) * maxR, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = categories[i].color;
            ctx.fill();
        }
    }
    
    // 2. Desenhar as 10 linhas circulares concêntricas (Níveis)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ecf0f1';
    for (let r = 1; r <= 10; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 10) * maxR, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // 3. Desenhar linhas divisórias das fatias
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        let angle = (i * 45 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
        ctx.stroke();
    }
    
    // 4. Desenhar os Títulos Externos e Números
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Ajustar tamanho da fonte baseado no tamanho do canvas
    const fontSize = Math.max(8, Math.floor(canvasSize / 60));
    const titleOffset = Math.floor(maxR / 6.5);
    
    for (let i = 0; i < 8; i++) {
        let angleCentro = (i * 45 + 22.5 - 90) * Math.PI / 180;
        
        // Textos externos
        let titleX = cx + (maxR + titleOffset) * Math.cos(angleCentro);
        let titleY = cy + (maxR + titleOffset) * Math.sin(angleCentro);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = categories[i].color;
        const nameLines = categories[i].name.split('\n');
        nameLines.forEach((line, idx) => {
            ctx.fillText(line, titleX, titleY + (idx * (fontSize + 2)));
        });
        
        // Desenhar números de 1 a 10 no meio de cada nível
        for (let r = 1; r <= 10; r++) {
            let numX = cx + ((r / 10) * maxR - maxR / 20) * Math.cos(angleCentro);
            let numY = cy + ((r / 10) * maxR - maxR / 20) * Math.sin(angleCentro);
            
            ctx.font = `bold ${fontSize}px Arial`;
            // Se o número estiver pintado, deixa branco; senão, cinza
            ctx.fillStyle = (wheelState[i] >= r) ? '#ffffff' : '#95a5a6';
            ctx.fillText(r, numX, numY);
        }
    }
}

// Função para obter coordenadas do evento (mouse ou touch)
function getEventCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Função para processar clique/toque
function handleInteraction(e) {
    e.preventDefault();
    const { cx, cy, maxR } = getCenterAndRadius();
    const coords = getEventCoordinates(e);
    const x = coords.x - cx;
    const y = coords.y - cy;
    const r = Math.sqrt(x*x + y*y);
    
    if(r > maxR) return; // Clique fora da roda
    
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = Math.round(angle);
    angle += 90; // Ajusta o zero pro topo
    if (angle < 0) angle += 360;
    
    const catIndex = Math.floor(angle / 45);
    const level = Math.ceil((r / maxR) * 10);
    
    wheelState[catIndex] = level;
    drawWheel();
}

// Evento de clique e touch
canvas.addEventListener('click', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);

function promptForName() {
    document.getElementById('nomeModal').style.display = 'flex';
}

function closeNomeModal() {
    document.getElementById('nomeModal').style.display = 'none';
    document.getElementById('nomeForm').reset();
}

async function handleSubmitRoda(event) {
    event.preventDefault();
    const name = document.getElementById('pacienteName').value.trim();
    
    if (!name) {
        alert('O nome é necessário.');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Gerando...';

    try {
        const doc = createPdf(name);
        const pdfBlob = doc.output('blob');
        
        // Upload para Supabase
        const fileName = `roda_vida_${name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pdfs')
            .upload(fileName, pdfBlob, {
                contentType: 'application/pdf',
                cacheControl: '3600'
            });
        
        if (uploadError) throw uploadError;
        
        // Obter URL pública do PDF
        const { data: urlData } = supabase.storage
            .from('pdfs')
            .getPublicUrl(fileName);
        
        // Salvar registro no banco
        const { error: dbError } = await supabase
            .from('submissions')
            .insert({
                patient_name: name,
                pdf_url: urlData.publicUrl,
                wheel_data: wheelState
            });
        
        if (dbError) throw dbError;
        
        alert('PDF gerado e salvo com sucesso!');
        closeNomeModal();
        
        // Limpar roda
        wheelState = [0, 0, 0, 0, 0, 0, 0, 0];
        drawWheel();
        
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar. Verifique se o Supabase está configurado corretamente.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function submitRoda() {
    promptForName();
}

function createPdf(name) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Adicionar título
    doc.setFontSize(16);
    doc.text('Resumo da Roda da Vida', 20, 15);
    
    // Adicionar informações básicas
    doc.setFontSize(11);
    doc.text(`Nome: ${name}`, 20, 25);
    doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 20, 32);
    
    // Adicionar imagem do canvas (roda da vida)
    const canvasImage = canvas.toDataURL('image/png');
    const imgWidth = 140;
    const imgHeight = 140;
    doc.addImage(canvasImage, 'PNG', 35, 40, imgWidth, imgHeight);
    
    // Adicionar respostas
    let yPos = 190;
    doc.setFontSize(12);
    doc.text('Respostas - Roda da Vida:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    
    categories.forEach((cat, i) => {
        const displayName = cat.name.replace('\n', ' ');
        doc.text(`${displayName}: ${wheelState[i]}`, 20, yPos);
        yPos += 6;
    });
    
    return doc;
}

/* ============================
   Autenticação e Portal
   ============================ */
async function handlePsicoLogin(event) {
    event.preventDefault();
    const email = document.getElementById('psicoUser').value.trim();
    const password = document.getElementById('psicoPassword').value.trim();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Entrando...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('portalContent').style.display = 'block';
        await loadSubmissions();
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function handlePsicoLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('portalContent').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showSignupModal(event) {
    event.preventDefault();
    document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('signupForm').reset();
}

async function handleSignup(event) {
    event.preventDefault();
    
    const nome = document.getElementById('signupNome').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const crp = document.getElementById('signupCRP').value.trim();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Cadastrando...';
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: nome,
                    crp: crp
                }
            }
        });
        
        if (error) throw error;
        
        alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
        closeSignupModal();
        
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        alert('Erro ao cadastrar: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function loadSubmissions() {
    const list = document.getElementById('submissionsList');
    list.innerHTML = '<p>Carregando submissões...</p>';
    
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data.length === 0) {
            list.innerHTML = '<p>Nenhuma submissão encontrada.</p>';
            return;
        }
        
        list.innerHTML = '';
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'submission-card';
            const date = new Date(item.created_at);
            card.innerHTML = `
                <div class="submission-title">${item.patient_name}</div>
                <div class="submission-meta">${date.toLocaleString('pt-BR')}</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn-submit" onclick="window.open('${item.pdf_url}', '_blank')">
                        Baixar PDF
                    </button>
                    <button class="btn-submit" style="background-color: #e74c3c;" onclick="deleteSubmission('${item.id}')">
                        Excluir
                    </button>
                </div>
            `;
            list.appendChild(card);
        });
        
    } catch (error) {
        console.error('Erro ao carregar submissões:', error);
        list.innerHTML = '<p>Erro ao carregar submissões. Verifique sua configuração do Supabase.</p>';
    }
}

async function deleteSubmission(id) {
    if (!confirm('Deseja realmente excluir esta submissão?')) return;
    
    try {
        const { error } = await supabase
            .from('submissions')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        await loadSubmissions();
        
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir submissão.');
    }
}

/* ============================
   Lógica dos Cards VIA ME
   ============================ */
const forcasVIA = [
    {nome: "Amor", texto: "Você valoriza relações próximas com outras pessoas, especialmente aquelas nas quais compartilhar e cuidar são recíprocos."},
    {nome: "Apreciação da Beleza", texto: "Você percebe e aprecia a beleza, a excelência e/ou o bom desempenho em todos os domínios da vida, da natureza à arte."},
    {nome: "Amor pelo Aprendizado", texto: "Você adora aprender coisas novas, tanto em aula quanto por si próprio."},
    {nome: "Autorregulação", texto: "Você regula conscientemente o que sente e o que faz. Você é uma pessoa disciplinada."},
    {nome: "Bondade e Generosidade", texto: "Você é bom e generoso para os outros, e nunca está ocupado para apoiar alguém."},
    {nome: "Bravura", texto: "Você é uma pessoa corajosa, que não recua diante de uma ameaça, desafio, dificuldade ou dor."},
    {nome: "Criatividade", texto: "Pensar em novas formas de fazer as coisas é parte crucial de quem você é."},
    {nome: "Critério e Julgamento", texto: "Pensar sobre as coisas e examiná-las de todos os lados são aspectos importantes de quem você é. Você não precipita conclusões."},
    {nome: "Curiosidade", texto: "Você é curioso sobre tudo. Está sempre questionando e acha todos os assuntos fascinantes."},
    {nome: "Esperança", texto: "Você espera o melhor do futuro e trabalha para alcançá-lo."},
    {nome: "Espiritualidade", texto: "Você tem crenças fortes e coerentes sobre um propósito maior e sobre o sentido do Universo."},
    {nome: "Gratidão", texto: "Você é consciente das coisas boas que acontecem com você e nunca as dá como garantidas."},
    {nome: "Humildade", texto: "Você não procura pelos holofotes, preferindo que suas realizações falem por elas mesmas."},
    {nome: "Humor", texto: "Você gosta de rir e caçoar. Provocar sorrisos nas outras pessoas é importante pra você."},
    {nome: "Integridade e Honestidade", texto: "Você é uma pessoa honesta, não apenas por falar a verdade, mas também por viver de forma genuína e autêntica."},
    {nome: "Inteligência Social", texto: "Você está consciente dos motivos e sentimentos das outras pessoas. Você sabe o que fazer para se adequar a diferentes situações."},
    {nome: "Justiça e Equidade", texto: "Tratar todas as pessoas imparcialmente é um de seus princípios."},
    {nome: "Liderança", texto: "Você se sobressai em tarefas de liderança ao encorajar um grupo a realizar coisas e ao preservar a harmonia."},
    {nome: "Perdão", texto: "Você perdoa aqueles que erraram com você. Sempre dá aos outros uma segunda chance."},
    {nome: "Perseverança", texto: "Você trabalha duro para terminar o que começou. Independentemente do projeto, termina-o no tempo previsto."},
    {nome: "Perspectiva", texto: "Apesar de você não se considerar sábio, seus amigos têm essa visão de você e buscam seus conselhos."},
    {nome: "Prudência", texto: "Você é uma pessoa cuidadosa e suas escolhas são consistentemente prudentes."},
    {nome: "Trabalho em Equipe", texto: "Você se sobressai como membro de um grupo. Você é um colega leal e dedicado."},
    {nome: "Vitalidade", texto: "Independentemente do que faça, você o faz com empolgação e energia. Você nunca faz nada pela metade."}
];

const cardsGrid = document.getElementById('cardsGrid');

forcasVIA.forEach(forca => {
    const container = document.createElement('div');
    container.className = 'card-container';
    
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => card.classList.toggle('flipped');

    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.textContent = forca.nome;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    cardBack.textContent = forca.texto;

    card.appendChild(cardFront);
    card.appendChild(cardBack);
    container.appendChild(card);
    cardsGrid.appendChild(container);
});

/* ============================
   Verificar se usuário já está logado
   ============================ */
supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
        currentUser = session.user;
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('portalContent').style.display = 'block';
        loadSubmissions();
    } else {
        currentUser = null;
        document.getElementById('loginBox').style.display = 'block';
        document.getElementById('portalContent').style.display = 'none';
    }
});

// Desenho inicial
drawWheel();
