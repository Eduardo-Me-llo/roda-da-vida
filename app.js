/* ============================
   Variáveis Globais e Fallback Supabase
   ============================ */
let currentUser = null;
let currentWheelType = '24forcas'; // '24forcas' ou 'teen'
let isPdfOnlyDownload = false;

// Fallback de segurança para Vercel/Produção caso config.js esteja no .gitignore
if (typeof window.supabase === 'undefined' || !window.supabase.auth) {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
            const SUPABASE_URL = window.SUPABASE_URL || 'https://lxlezgufbdrqmedvhpcf.supabase.co';
            const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
            window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.warn('Supabase não inicializado.');
        }
    }
}

/* ============================
   Lógica do Menu Sanduíche e Abas
   ============================ */
function toggleMenu() {
    const tabsList = document.getElementById('tabsList');
    if (tabsList) {
        tabsList.classList.toggle('open');
    }
}

function selectTab(tabId, element) {
    openTab(tabId, element);
    const tabsList = document.getElementById('tabsList');
    if (tabsList && window.innerWidth <= 768) {
        tabsList.classList.remove('open');
    }
}

function openTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (element) element.classList.add('active');
    
    if (tabId === 'roda-24-forcas') {
        currentWheelType = '24forcas';
        setTimeout(() => {
            resizeCanvas24();
            drawWheel24();
        }, 50);
    } else if (tabId === 'roda-teen') {
        currentWheelType = 'teen';
        setTimeout(() => {
            resizeCanvasTeen();
            drawWheel();
        }, 50);
    } else if (tabId === 'teste-forcas') {
        setTimeout(() => {
            resizeTesteForcasCanvas();
            drawTesteForcasChart();
        }, 50);
    } else if (tabId === 'portal-psico' && currentUser) {
        loadSubmissions();
    }
}

/* ============================
   Dados das 6 Virtudes e 24 Forças VIA
   ============================ */
const VIRTUES_DATA = [
    {
        id: 'sabedoria',
        code: 'A',
        name: 'SABEDORIA E CONHECIMENTO',
        fullName: 'A) SABEDORIA E CONHECIMENTO',
        colorPastel: '#bde0fe', // Pastel Ciano/Azul
        colorFill: '#3a86ff',
        colorArc: '#a2d2ff',
        colorText: '#03045e',
        strengths: [
            { id: 'criatividade', name: 'Criatividade' },
            { id: 'curiosidade', name: 'Curiosidade' },
            { id: 'criterio', name: 'Pensamento Crítico e Critério' },
            { id: 'aprendizado', name: 'Amor ao Aprendizado' },
            { id: 'perspectiva', name: 'Perspectiva' }
        ]
    },
    {
        id: 'coragem',
        code: 'B',
        name: 'CORAGEM',
        fullName: 'B) CORAGEM',
        colorPastel: '#fefae0', // Pastel Amarelo/Dourado
        colorFill: '#ffb703',
        colorArc: '#ffe5ec',
        colorText: '#7f5539',
        strengths: [
            { id: 'bravura', name: 'Heroísmo e Bravura' },
            { id: 'perseveranca', name: 'Perseverança' },
            { id: 'honestidade', name: 'Autenticidade e Honestidade' },
            { id: 'vitalidade', name: 'Vitalidade' }
        ]
    },
    {
        id: 'humanidade',
        code: 'C',
        name: 'HUMANIDADE',
        fullName: 'C) HUMANIDADE',
        colorPastel: '#ffccd5', // Pastel Rosa/Vermelho
        colorFill: '#ff4d6d',
        colorArc: '#ffb5a7',
        colorText: '#590d22',
        strengths: [
            { id: 'amor', name: 'Amor' },
            { id: 'generosidade', name: 'Generosidade' },
            { id: 'inteligencia_social', name: 'Inteligência Social' }
        ]
    },
    {
        id: 'justica',
        code: 'D',
        name: 'JUSTIÇA',
        fullName: 'D) JUSTIÇA',
        colorPastel: '#ffe5d9', // Pastel Laranja/Pêssego
        colorFill: '#f4a261',
        colorArc: '#fbc4ab',
        colorText: '#6b705c',
        strengths: [
            { id: 'trabalho_equipe', name: 'Trabalho em Equipe' },
            { id: 'lideranca', name: 'Liderança' },
            { id: 'justica', name: 'Justiça/Equidade' }
        ]
    },
    {
        id: 'temperanca',
        code: 'E',
        name: 'TEMPERANÇA',
        fullName: 'E) TEMPERANÇA',
        colorPastel: '#d8f3dc', // Pastel Verde
        colorFill: '#2a9d8f',
        colorArc: '#b7e4c7',
        colorText: '#1b4332',
        strengths: [
            { id: 'perdao', name: 'Perdão' },
            { id: 'humildade', name: 'Humildade' },
            { id: 'prudencia', name: 'Prudência' },
            { id: 'autocontrole', name: 'Autocontrole' }
        ]
    },
    {
        id: 'transcendencia',
        code: 'F',
        name: 'TRANSCENDÊNCIA',
        fullName: 'F) TRANSCENDÊNCIA',
        colorPastel: '#e0b1cb', // Pastel Roxo/Lilás
        colorFill: '#9d4edd',
        colorArc: '#be95c4',
        colorText: '#3c096c',
        strengths: [
            { id: 'apreciacao_beleza', name: 'Apreciação da Beleza' },
            { id: 'gratidao', name: 'Gratidão' },
            { id: 'esperanca', name: 'Esperança' },
            { id: 'humor', name: 'Humor' },
            { id: 'espiritualidade', name: 'Espiritualidade' }
        ]
    }
];

/* ============================================================
   Configuração Manual de Fontes e Linhas para as 24 Forças
   (Edite o 'scale' para diminuir/aumentar a fonte de palavras longas
    e 'lines' para personalizar as quebras de linha no gráfico)
   ============================================================ */
const STRENGTH_LABEL_CONFIG = {
    'criatividade': { lines: ['CRIATIVIDADE'], scale: 1.0 },
    'curiosidade': { lines: ['CURIOSIDADE'], scale: 1.0 },
    'criterio': { lines: ['PENSAMENTO', 'CRÍTICO'], scale: 0.82 },
    'aprendizado': { lines: ['AMOR AO', 'APRENDIZADO'], scale: 0.88 },
    'perspectiva': { lines: ['PERSPECTIVA'], scale: 0.92 },
    'bravura': { lines: ['HEROÍSMO E', 'BRAVURA'], scale: 0.88 },
    'perseveranca': { lines: ['PERSEVERANÇA'], scale: 0.88 },
    'honestidade': { lines: ['AUTENTICIDADE', 'E HONESTIDADE'], scale: 0.82 },
    'vitalidade': { lines: ['VITALIDADE'], scale: 1.0 },
    'amor': { lines: ['AMOR'], scale: 1.0 },
    'generosidade': { lines: ['GENEROSIDADE'], scale: 0.9 },
    'inteligencia_social': { lines: ['INTELIGÊNCIA', 'SOCIAL'], scale: 0.82 },
    'trabalho_equipe': { lines: ['TRABALHO EM', 'EQUIPE'], scale: 0.88 },
    'lideranca': { lines: ['LIDERANÇA'], scale: 1.0 },
    'justica': { lines: ['JUSTIÇA /', 'EQUIDADE'], scale: 0.88 },
    'perdao': { lines: ['PERDÃO'], scale: 1.0 },
    'humildade': { lines: ['HUMILDADE'], scale: 0.92 },
    'prudencia': { lines: ['PRUDÊNCIA'], scale: 1.0 },
    'autocontrole': { lines: ['AUTO-', 'CONTROLE'], scale: 0.85 },
    'apreciacao_beleza': { lines: ['APRECIAÇÃO', 'DA BELEZA'], scale: 0.80 },
    'gratidao': { lines: ['GRATIDÃO'], scale: 1.0 },
    'esperanca': { lines: ['ESPERANÇA'], scale: 1.0 },
    'humor': { lines: ['HUMOR'], scale: 1.0 },
    'espiritualidade': { lines: ['ESPIRITUALIDADE'], scale: 0.78 }
};

// Array sequencial plano de 24 forças
const ALL_24_STRENGTHS = [];
VIRTUES_DATA.forEach(v => {
    v.strengths.forEach(s => {
        ALL_24_STRENGTHS.push({
            ...s,
            virtueId: v.id,
            virtueName: v.name,
            virtueCode: v.code,
            virtueFullName: v.fullName,
            colorPastel: v.colorPastel,
            colorFill: v.colorFill,
            colorArc: v.colorArc,
            colorText: v.colorText
        });
    });
});

let wheelState24 = new Array(24).fill(0);
let hoveredSector24 = -1;

/* ============================
   Lógica da Roda das 24 Forças VIA (Canvas)
   ============================ */
const canvas24 = document.getElementById('roda24Canvas');
const ctx24 = canvas24 ? canvas24.getContext('2d') : null;

function getCenterAndRadius24() {
    if (!canvas24) return { cx: 375, cy: 375, maxR: 210, strengthR: 290, virtueR: 350 };
    const displaySize = parseFloat(canvas24.style.width) || canvas24.width;
    return {
        cx: displaySize / 2,
        cy: displaySize / 2,
        maxR: displaySize * 0.28,        // Nível 10 da teia
        strengthR: displaySize * 0.385,   // Borda do nome das 24 Forças
        virtueR: displaySize * 0.465      // Borda externa dos 6 Arcos de Virtudes
    };
}

function resizeCanvas24() {
    if (!canvas24) return;
    let displaySize = Math.min(750, Math.max(300, window.innerWidth - 20));
    canvas24.style.width = displaySize + 'px';
    canvas24.style.height = displaySize + 'px';
    
    const dpr = window.devicePixelRatio || 1;
    canvas24.width = Math.floor(displaySize * dpr);
    canvas24.height = Math.floor(displaySize * dpr);
    
    if (ctx24) {
        ctx24.resetTransform ? ctx24.resetTransform() : ctx24.setTransform(1, 0, 0, 1, 0, 0);
        ctx24.scale(dpr, dpr);
    }
    drawWheel24();
}

function drawCurvedText(ctx, text, cx, cy, radius, startAngle, endAngle, color, fontSize) {
    ctx.save();
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const midAngle = (startAngle + endAngle) / 2;
    const textLen = text.length;
    if (textLen === 0) {
        ctx.restore();
        return;
    }
    
    const textWidth = ctx.measureText(text).width;
    const textAngle = (textWidth * 1.08) / radius;
    const stepAngle = textLen > 1 ? textAngle / (textLen - 1) : 0;
    
    const isBottom = Math.sin(midAngle) > 0;
    
    if (!isBottom) {
        const firstAngle = midAngle - (textAngle / 2);
        for (let i = 0; i < textLen; i++) {
            let charAngle = firstAngle + i * stepAngle;
            let x = cx + radius * Math.cos(charAngle);
            let y = cy + radius * Math.sin(charAngle);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(charAngle + Math.PI / 2);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    } else {
        const firstAngle = midAngle + (textAngle / 2);
        for (let i = 0; i < textLen; i++) {
            let charAngle = firstAngle - i * stepAngle;
            let x = cx + radius * Math.cos(charAngle);
            let y = cy + radius * Math.sin(charAngle);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(charAngle - Math.PI / 2);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    }
    
    ctx.restore();
}

function drawWheel24() {
    if (!canvas24 || !ctx24) return;
    const { cx, cy, maxR, strengthR, virtueR } = getCenterAndRadius24();
    const displaySize = cx * 2;
    
    ctx24.clearRect(0, 0, displaySize, displaySize);
    
    ctx24.fillStyle = '#ffffff';
    ctx24.fillRect(0, 0, displaySize, displaySize);

    // 1. Fatias pastel para o nome das 24 Forças
    ALL_24_STRENGTHS.forEach((st, i) => {
        let startAngle = (i * 15 - 90) * Math.PI / 180;
        let endAngle = ((i + 1) * 15 - 90) * Math.PI / 180;
        
        ctx24.beginPath();
        ctx24.arc(cx, cy, strengthR, startAngle, endAngle);
        ctx24.arc(cx, cy, maxR, endAngle, startAngle, true);
        ctx24.closePath();
        ctx24.fillStyle = st.colorPastel;
        ctx24.fill();
        ctx24.lineWidth = 1;
        ctx24.strokeStyle = '#ffffff';
        ctx24.stroke();
    });

    // 2. Fatias preenchidas do centro até o nível X
    ALL_24_STRENGTHS.forEach((st, i) => {
        let level = wheelState24[i];
        if (level > 0) {
            let startAngle = (i * 15 - 90) * Math.PI / 180;
            let endAngle = ((i + 1) * 15 - 90) * Math.PI / 180;
            
            ctx24.beginPath();
            ctx24.moveTo(cx, cy);
            ctx24.arc(cx, cy, (level / 10) * maxR, startAngle, endAngle);
            ctx24.closePath();
            ctx24.fillStyle = st.colorFill;
            ctx24.fill();
        }
    });

    // 3. Efeito Hover
    if (hoveredSector24 >= 0 && hoveredSector24 < 24) {
        let i = hoveredSector24;
        let startAngle = (i * 15 - 90) * Math.PI / 180;
        let endAngle = ((i + 1) * 15 - 90) * Math.PI / 180;
        
        ctx24.beginPath();
        ctx24.moveTo(cx, cy);
        ctx24.arc(cx, cy, virtueR, startAngle, endAngle);
        ctx24.closePath();
        ctx24.fillStyle = 'rgba(255, 255, 255, 0.28)';
        ctx24.fill();
        ctx24.lineWidth = 2.5;
        ctx24.strokeStyle = '#2c3e50';
        ctx24.stroke();
    }

    // 4. Teia concêntrica de 10 níveis
    ctx24.lineWidth = 1;
    for (let r = 1; r <= 10; r++) {
        ctx24.beginPath();
        ctx24.arc(cx, cy, (r / 10) * maxR, 0, 2 * Math.PI);
        ctx24.strokeStyle = (r === 10) ? '#2c3e50' : 'rgba(160, 160, 160, 0.55)';
        ctx24.stroke();
    }

    // 5. Linhas radiais divisórias
    ctx24.lineWidth = 1;
    ctx24.strokeStyle = 'rgba(150, 150, 150, 0.55)';
    for (let i = 0; i < 24; i++) {
        let angle = (i * 15 - 90) * Math.PI / 180;
        ctx24.beginPath();
        ctx24.moveTo(cx, cy);
        ctx24.lineTo(cx + strengthR * Math.cos(angle), cy + strengthR * Math.sin(angle));
        ctx24.stroke();
    }

    // 6. Números 1 a 10
    const numFontSize = Math.max(7, Math.floor(maxR / 20));
    ctx24.textAlign = 'center';
    ctx24.textBaseline = 'middle';

    for (let i = 0; i < 24; i++) {
        let angleMid = (i * 15 + 7.5 - 90) * Math.PI / 180;
        
        for (let r = 1; r <= 10; r++) {
            let rDist = ((r - 0.5) / 10) * maxR;
            let numX = cx + rDist * Math.cos(angleMid);
            let numY = cy + rDist * Math.sin(angleMid);
            
            ctx24.font = `bold ${numFontSize}px Arial, sans-serif`;
            if (wheelState24[i] >= r) {
                ctx24.fillStyle = '#ffffff';
                ctx24.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx24.shadowBlur = 3;
            } else {
                ctx24.fillStyle = '#666666';
                ctx24.shadowBlur = 0;
            }
            ctx24.fillText(r, numX, numY);
            ctx24.shadowBlur = 0;
        }
    }

    // 7. Nomes das 24 Forças radiais com tamanho ajustável individualmente
    const baseLabelFontSize = Math.max(7, Math.floor(maxR / 20));
    
    ALL_24_STRENGTHS.forEach((st, i) => {
        let angleMid = (i * 15 + 7.5 - 90) * Math.PI / 180;
        let midR = (maxR + strengthR) / 2;
        
        ctx24.save();
        ctx24.translate(cx, cy);
        ctx24.rotate(angleMid);
        ctx24.translate(midR, 0);
        
        if (angleMid > Math.PI / 2 || angleMid < -Math.PI / 2) {
            ctx24.rotate(Math.PI);
        }
        
        const cfg = STRENGTH_LABEL_CONFIG[st.id] || { lines: [st.name.toUpperCase()], scale: 1.0 };
        const customFontSize = Math.max(6, Math.floor(baseLabelFontSize * (cfg.scale || 1.0)));
        
        ctx24.font = `bold ${customFontSize}px Arial, sans-serif`;
        ctx24.fillStyle = st.colorText || '#2c3e50';
        ctx24.textAlign = 'center';
        ctx24.textBaseline = 'middle';
        
        const lines = cfg.lines || [st.name.toUpperCase()];
        if (lines.length === 1) {
            ctx24.fillText(lines[0], 0, 0);
        } else {
            const lineHeight = customFontSize + 1.5;
            const startY = -((lines.length - 1) * lineHeight) / 2;
            lines.forEach((line, lIdx) => {
                ctx24.fillText(line, 0, startY + lIdx * lineHeight);
            });
        }
        
        ctx24.restore();
    });

    // 8. 6 Arcos das Virtudes
    let currentSector = 0;
    VIRTUES_DATA.forEach((virtue) => {
        const numSec = virtue.strengths.length;
        const startAngle = (currentSector * 15 - 90) * Math.PI / 180;
        const endAngle = ((currentSector + numSec) * 15 - 90) * Math.PI / 180;
        
        ctx24.beginPath();
        ctx24.arc(cx, cy, virtueR, startAngle, endAngle);
        ctx24.arc(cx, cy, strengthR, endAngle, startAngle, true);
        ctx24.closePath();
        ctx24.fillStyle = virtue.colorArc;
        ctx24.fill();
        ctx24.lineWidth = 2;
        ctx24.strokeStyle = '#ffffff';
        ctx24.stroke();
        
        drawCurvedText(
            ctx24,
            virtue.fullName,
            cx, cy,
            (strengthR + virtueR) / 2,
            startAngle,
            endAngle,
            virtue.colorText,
            Math.max(8, Math.floor(maxR / 17))
        );
        
        currentSector += numSec;
    });
}

function getEventCoordinatesCanvas(e, canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function handleInteraction24(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (!canvas24) return;
    
    const { cx, cy, maxR } = getCenterAndRadius24();
    const coords = getEventCoordinatesCanvas(e, canvas24);
    const x = coords.x - cx;
    const y = coords.y - cy;
    const r = Math.sqrt(x*x + y*y);
    
    if (r > maxR) return;
    
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = Math.round(angle);
    angle += 90;
    if (angle < 0) angle += 360;
    
    const catIndex = Math.floor(angle / 15);
    const level = Math.ceil((r / maxR) * 10);
    
    if (catIndex >= 0 && catIndex < 24 && level >= 1 && level <= 10) {
        wheelState24[catIndex] = level;
        drawWheel24();
        updateSummary24();
    }
}

function handleMouseMove24(e) {
    if (!canvas24) return;
    const { cx, cy, virtueR } = getCenterAndRadius24();
    const coords = getEventCoordinatesCanvas(e, canvas24);
    const x = coords.x - cx;
    const y = coords.y - cy;
    const r = Math.sqrt(x*x + y*y);
    
    if (r <= virtueR && r > 0) {
        let angle = Math.atan2(y, x) * 180 / Math.PI;
        angle += 90;
        if (angle < 0) angle += 360;
        const catIndex = Math.floor(angle / 15);
        if (catIndex !== hoveredSector24) {
            hoveredSector24 = catIndex;
            canvas24.style.cursor = 'pointer';
            drawWheel24();
        }
    } else {
        if (hoveredSector24 !== -1) {
            hoveredSector24 = -1;
            canvas24.style.cursor = 'default';
            drawWheel24();
        }
    }
}

function handleMouseLeave24() {
    if (hoveredSector24 !== -1) {
        hoveredSector24 = -1;
        if (canvas24) canvas24.style.cursor = 'default';
        drawWheel24();
    }
}

function updateSummary24() {
    const container = document.getElementById('summary24Container');
    const grid = document.getElementById('virtuesSummaryGrid');
    if (!container || !grid) return;
    
    container.style.display = 'block';
    grid.innerHTML = '';
    
    let stIdx = 0;
    VIRTUES_DATA.forEach(v => {
        const vCard = document.createElement('div');
        vCard.className = 'virtue-summary-card';
        vCard.style.borderLeftColor = v.colorFill;
        
        let sum = 0;
        let listHtml = '';
        
        v.strengths.forEach(st => {
            const val = wheelState24[stIdx];
            sum += val;
            listHtml += `
                <div class="strength-item">
                    <span class="strength-name">${st.name}</span>
                    <span class="strength-val" style="background-color: ${v.colorFill}; color: #fff;">${val}/10</span>
                </div>
            `;
            stIdx++;
        });
        
        const avg = (sum / v.strengths.length).toFixed(1);
        
        vCard.innerHTML = `
            <div class="virtue-header" style="background-color: ${v.colorPastel}; color: ${v.colorText};">
                <span class="virtue-title">${v.fullName}</span>
                <span class="virtue-avg">Média: ${avg}</span>
            </div>
            <div class="virtue-body">
                ${listHtml}
            </div>
        `;
        grid.appendChild(vCard);
    });
}

function resetWheel24() {
    if (confirm('Deseja realmente limpar todas as pontuações?')) {
        wheelState24 = new Array(24).fill(0);
        drawWheel24();
        updateSummary24();
    }
}

function downloadPdfOnly24() {
    currentWheelType = '24forcas';
    isPdfOnlyDownload = true;
    promptForName();
}

function downloadPdfOnlyTeen() {
    currentWheelType = 'teen';
    isPdfOnlyDownload = true;
    promptForName();
}

function submitRoda24() {
    currentWheelType = '24forcas';
    isPdfOnlyDownload = false;
    promptForName();
}

function createPdf24(name) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(15);
    doc.setTextColor(44, 62, 80);
    doc.text('Relatório - Roda das 24 Forças de Caráter e Virtudes VIA', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Paciente/Avaliado: ${name}`, 14, 22);
    doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 14, 27);
    
    if (canvas24) {
        const imgData = canvas24.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 30, 32, 150, 150);
    }
    
    let yPos = 188;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumo das Pontuações por Virtude:', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    let stIdx = 0;
    
    VIRTUES_DATA.forEach(v => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text(`${v.fullName}`, 14, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        v.strengths.forEach(st => {
            const val = wheelState24[stIdx];
            doc.text(`• ${st.name}: ${val}/10`, 18, yPos);
            stIdx++;
            yPos += 4.5;
        });
        yPos += 2;
    });
    
    return doc;
}

if (canvas24) {
    canvas24.addEventListener('click', handleInteraction24);
    canvas24.addEventListener('touchstart', handleInteraction24, { passive: false });
    canvas24.addEventListener('mousemove', handleMouseMove24);
    canvas24.addEventListener('mouseleave', handleMouseLeave24);
}

/* ============================
   Lógica da Roda da Vida Teen (8 áreas)
   ============================ */
const canvas = document.getElementById('rodaCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function resizeCanvasTeen() {
    if (!canvas) return;
    let displaySize = Math.min(600, Math.max(300, window.innerWidth - 20));
    canvas.style.width = displaySize + 'px';
    canvas.style.height = displaySize + 'px';
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(displaySize * dpr);
    canvas.height = Math.floor(displaySize * dpr);
    
    if (ctx) {
        ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }
    drawWheel();
}

const getCenterAndRadius = () => {
    const displaySize = canvas ? (parseFloat(canvas.style.width) || canvas.width) : 600;
    return {
        cx: displaySize / 2,
        cy: displaySize / 2,
        maxR: displaySize * 0.38
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
    if (!canvas || !ctx) return;
    const { cx, cy, maxR } = getCenterAndRadius();
    const displaySize = cx * 2;
    ctx.clearRect(0, 0, displaySize, displaySize);
    
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
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ecf0f1';
    for (let r = 1; r <= 10; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 10) * maxR, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        let angle = (i * 45 - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
        ctx.stroke();
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const fontSize = Math.max(8, Math.floor(cx / 30));
    const titleOffset = Math.floor(maxR / 6.5);
    
    for (let i = 0; i < 8; i++) {
        let angleCentro = (i * 45 + 22.5 - 90) * Math.PI / 180;
        
        let titleX = cx + (maxR + titleOffset) * Math.cos(angleCentro);
        let titleY = cy + (maxR + titleOffset) * Math.sin(angleCentro);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = categories[i].color;
        const nameLines = categories[i].name.split('\n');
        nameLines.forEach((line, idx) => {
            ctx.fillText(line, titleX, titleY + (idx * (fontSize + 2)));
        });
        
        for (let r = 1; r <= 10; r++) {
            let numX = cx + ((r / 10) * maxR - maxR / 20) * Math.cos(angleCentro);
            let numY = cy + ((r / 10) * maxR - maxR / 20) * Math.sin(angleCentro);
            
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = (wheelState[i] >= r) ? '#ffffff' : '#95a5a6';
            ctx.fillText(r, numX, numY);
        }
    }
}

function handleInteraction(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (!canvas) return;
    const { cx, cy, maxR } = getCenterAndRadius();
    const coords = getEventCoordinatesCanvas(e, canvas);
    const x = coords.x - cx;
    const y = coords.y - cy;
    const r = Math.sqrt(x*x + y*y);
    
    if (r > maxR) return;
    
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = Math.round(angle);
    angle += 90;
    if (angle < 0) angle += 360;
    
    const catIndex = Math.floor(angle / 45);
    const level = Math.ceil((r / maxR) * 10);
    
    wheelState[catIndex] = level;
    drawWheel();
}

if (canvas) {
    canvas.addEventListener('click', handleInteraction);
    canvas.addEventListener('touchstart', handleInteraction, { passive: false });
}

window.addEventListener('resize', () => {
    resizeCanvasTeen();
    resizeCanvas24();
});

function promptForName() {
    const modal = document.getElementById('nomeModal');
    if (modal) modal.style.display = 'flex';
}

function closeNomeModal() {
    const modal = document.getElementById('nomeModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('nomeForm');
    if (form) form.reset();
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
    submitBtn.innerHTML = '<span class="loading"></span> Gerando PDF...';

    try {
        const is24 = (currentWheelType === '24forcas');
        const doc = is24 ? createPdf24(name) : createPdf(name);
        const prefix = is24 ? 'roda_forcas_24_' : 'roda_vida_';
        const fileName = `${prefix}${name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

        // Se o usuário clicou no botão "Baixar Apenas PDF", realiza o download direto sem salvar no banco
        if (isPdfOnlyDownload) {
            doc.save(fileName);
            closeNomeModal();
            isPdfOnlyDownload = false;
            alert('PDF baixado com sucesso!');
            return;
        }

        // Tenta salvar no Supabase se houver conexão configurada
        if (typeof window.supabase !== 'undefined' && window.supabase.storage) {
            const pdfBlob = doc.output('blob');
            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('pdfs')
                .upload(fileName, pdfBlob, {
                    contentType: 'application/pdf',
                    cacheControl: '3600'
                });
            
            if (!uploadError && uploadData) {
                const { data: urlData } = window.supabase.storage
                    .from('pdfs')
                    .getPublicUrl(fileName);
                
                await window.supabase
                    .from('submissions')
                    .insert({
                        patient_name: name,
                        pdf_url: urlData.publicUrl,
                        wheel_data: is24 ? { type: '24forcas', scores: wheelState24 } : wheelState
                    });
            }
        }
        
        // Baixa o arquivo PDF localmente
        doc.save(fileName);
        alert('PDF gerado e baixado com sucesso!');
        closeNomeModal();
        
    } catch (error) {
        console.error('Processando PDF localmente:', error);
        const is24 = (currentWheelType === '24forcas');
        const doc = is24 ? createPdf24(name) : createPdf(name);
        doc.save(`roda_vida_${name.replace(/\s+/g, '_')}.pdf`);
        alert('PDF baixado com sucesso!');
        closeNomeModal();
    } finally {
        isPdfOnlyDownload = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function submitRoda() {
    currentWheelType = 'teen';
    isPdfOnlyDownload = false;
    promptForName();
}

function createPdf(name) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Resumo da Roda da Vida Adolescente', 20, 15);
    
    doc.setFontSize(11);
    doc.text(`Nome: ${name}`, 20, 25);
    doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 20, 32);
    
    if (canvas) {
        const canvasImage = canvas.toDataURL('image/png');
        doc.addImage(canvasImage, 'PNG', 35, 40, 140, 140);
    }
    
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
        const { data, error } = await window.supabase.auth.signInWithPassword({
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
    if (window.supabase && window.supabase.auth) {
        await window.supabase.auth.signOut();
    }
    currentUser = null;
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('portalContent').style.display = 'none';
    const form = document.getElementById('loginForm');
    if (form) form.reset();
}

function showSignupModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('signupModal');
    if (modal) modal.style.display = 'flex';
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('signupForm');
    if (form) form.reset();
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
        const { data, error } = await window.supabase.auth.signUp({
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
    if (!list) return;
    list.innerHTML = '<p>Carregando submissões...</p>';
    
    try {
        const { data, error } = await window.supabase
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
        const { error } = await window.supabase
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

if (cardsGrid) {
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
}

// Inicializações dos Canvas
window.addEventListener('DOMContentLoaded', () => {
    resizeCanvasTeen();
    resizeCanvas24();
    updateSummary24();
});

/* ============================
   Lógica do Teste de Forças
   ============================ */

// Dados das 24 forças organizadas conforme a imagem VIA ME
// Posição baseada na análise detalhada da imagem: angle (graus, 0°=topo) e radius (multiplicador do raio, 0.5=meio, 1.0=borda externa)
const FORCAS_TESTE = [
    // REGIÃO SUPERIOR - entre círculo médio e externo
    { id: 'humildade', name: 'Humildade', angle: 345, radius: 0.75 },
    { id: 'trabalho_equipe', name: 'Trabalho em equipe', angle: 15, radius: 0.85 },
    
    // REGIÃO SUPERIOR DIREITA - algumas mais internas
    { id: 'justica', name: 'Justiça', angle: 30, radius: 0.50 },
    { id: 'perdao', name: 'Perdão', angle: 40, radius: 0.55 },
    { id: 'generosidade', name: 'Generosidade', angle: 50, radius: 0.85 },
    { id: 'lideranca', name: 'Liderança', angle: 55, radius: 0.65 },
    
    // REGIÃO DIREITA (Coração)
    { id: 'amor', name: 'Amor', angle: 70, radius: 0.90 },
    { id: 'gratidao', name: 'Gratidão', angle: 85, radius: 0.90 },
    { id: 'humor', name: 'Humor', angle: 95, radius: 0.90 },
    { id: 'espiritualidade', name: 'Espiritualidade', angle: 105, radius: 0.70 },
    
    // REGIÃO INFERIOR DIREITA
    { id: 'inteligencia_social', name: 'Inteligência social', angle: 115, radius: 0.75 },
    { id: 'esperanca', name: 'Esperança', angle: 125, radius: 0.55 },
    { id: 'vitalidade', name: 'Vitalidade', angle: 145, radius: 0.70 },
    { id: 'apreciacao_beleza', name: 'Apreciação da beleza', angle: 160, radius: 0.90 },
    
    // REGIÃO INFERIOR (Foco no Eu)
    { id: 'bravura', name: 'Bravura', angle: 175, radius: 0.60 },
    { id: 'curiosidade', name: 'Curiosidade', angle: 185, radius: 0.85 },
    { id: 'criatividade', name: 'Criatividade', angle: 195, radius: 0.85 },
    { id: 'aprendizado', name: 'Amor ao aprendizado', angle: 205, radius: 0.90 },
    
    // REGIÃO INFERIOR ESQUERDA
    { id: 'perspectiva', name: 'Perspectiva', angle: 230, radius: 0.65 },
    { id: 'criterio', name: 'Critério', angle: 220, radius: 0.85 },
    
    // REGIÃO ESQUERDA (Mente)
    { id: 'autocontrole', name: 'Autocontrole', angle: 265, radius: 0.75 },
    { id: 'perseveranca', name: 'Perseverança', angle: 280, radius: 0.75 },
    
    // REGIÃO SUPERIOR ESQUERDA
    { id: 'integridade', name: 'Integridade', angle: 310, radius: 0.68 },
    { id: 'prudencia', name: 'Prudência', angle: 325, radius: 0.85 }
];

let selectedForcas = [];
const MAX_SELECTION = 5;

// Canvas do Teste de Forças
const canvasTesteForcas = document.getElementById('testeForcasCanvas');
const ctxTesteForcas = canvasTesteForcas ? canvasTesteForcas.getContext('2d') : null;

function initTesteForcas() {
    const checkboxContainer = document.getElementById('forcasCheckboxes');
    if (!checkboxContainer) return;
    
    // Criar checkboxes para todas as 24 forças
    FORCAS_TESTE.forEach(forca => {
        const item = document.createElement('div');
        item.className = 'forca-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `forca-${forca.id}`;
        checkbox.value = forca.id;
        checkbox.addEventListener('change', handleForcaSelection);
        
        const label = document.createElement('label');
        label.htmlFor = `forca-${forca.id}`;
        label.textContent = forca.name;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        checkboxContainer.appendChild(item);
    });
    
    resizeTesteForcasCanvas();
    drawTesteForcasChart();
}

function handleForcaSelection(e) {
    const forcaId = e.target.value;
    const isChecked = e.target.checked;
    
    if (isChecked) {
        if (selectedForcas.length >= MAX_SELECTION) {
            e.target.checked = false;
            alert(`Você pode selecionar no máximo ${MAX_SELECTION} forças.`);
            return;
        }
        selectedForcas.push(forcaId);
    } else {
        selectedForcas = selectedForcas.filter(id => id !== forcaId);
    }
    
    updateSelectionCounter();
    drawTesteForcasChart();
}

function updateSelectionCounter() {
    const counter = document.getElementById('selectionCounter');
    if (!counter) return;
    
    counter.textContent = `${selectedForcas.length} / ${MAX_SELECTION} forças selecionadas`;
    
    if (selectedForcas.length >= MAX_SELECTION) {
        counter.classList.add('limit-reached');
    } else {
        counter.classList.remove('limit-reached');
    }
}

function resizeTesteForcasCanvas() {
    if (!canvasTesteForcas) return;
    let displaySize = Math.min(700, Math.max(300, window.innerWidth - 40));
    canvasTesteForcas.style.width = displaySize + 'px';
    canvasTesteForcas.style.height = displaySize + 'px';
    
    const dpr = window.devicePixelRatio || 1;
    canvasTesteForcas.width = Math.floor(displaySize * dpr);
    canvasTesteForcas.height = Math.floor(displaySize * dpr);
    
    if (ctxTesteForcas) {
        ctxTesteForcas.resetTransform ? ctxTesteForcas.resetTransform() : ctxTesteForcas.setTransform(1, 0, 0, 1, 0, 0);
        ctxTesteForcas.scale(dpr, dpr);
    }
}

function drawTesteForcasChart() {
    if (!canvasTesteForcas || !ctxTesteForcas) return;
    
    const displaySize = parseFloat(canvasTesteForcas.style.width) || canvasTesteForcas.width;
    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const maxR = displaySize * 0.35; // Raio do círculo externo
    
    // Limpar canvas
    ctxTesteForcas.clearRect(0, 0, displaySize, displaySize);
    ctxTesteForcas.fillStyle = '#ffffff';
    ctxTesteForcas.fillRect(0, 0, displaySize, displaySize);
    
    // Desenhar círculos concêntricos (3 círculos)
    const circles = 3;
    ctxTesteForcas.lineWidth = 2;
    for (let i = 1; i <= circles; i++) {
        ctxTesteForcas.beginPath();
        ctxTesteForcas.arc(cx, cy, (i / circles) * maxR, 0, 2 * Math.PI);
        
        if (i === circles) {
            ctxTesteForcas.strokeStyle = '#d4a373'; // Borda externa (tom salmão/terroso)
            ctxTesteForcas.lineWidth = 3;
        } else {
            ctxTesteForcas.strokeStyle = 'rgba(212, 163, 115, 0.4)'; // Círculos internos
            ctxTesteForcas.lineWidth = 1.5;
        }
        ctxTesteForcas.stroke();
    }
    
    // Desenhar eixos principais (cruz azul)
    ctxTesteForcas.strokeStyle = '#81c0d9'; // Azul claro
    ctxTesteForcas.lineWidth = 3;
    
    const axisLength = maxR * 1.2;
    
    // Eixo vertical (Foco nos outros <-> Foco no "Eu")
    ctxTesteForcas.beginPath();
    ctxTesteForcas.moveTo(cx, cy - axisLength);
    ctxTesteForcas.lineTo(cx, cy + axisLength);
    ctxTesteForcas.stroke();
    
    // Eixo horizontal (Mente <-> Coração)
    ctxTesteForcas.beginPath();
    ctxTesteForcas.moveTo(cx - axisLength, cy);
    ctxTesteForcas.lineTo(cx + axisLength, cy);
    ctxTesteForcas.stroke();
    
    // Adicionar setas nos eixos
    const arrowSize = 13;
    
    // Seta superior (Foco nos outros)
    drawArrow(ctxTesteForcas, cx, cy - axisLength + 18, cx, cy - axisLength - 5, '#81c0d9', arrowSize);
    // Seta direita (Coração)
    drawArrow(ctxTesteForcas, cx + axisLength - 18, cy, cx + axisLength + 5, cy, '#81c0d9', arrowSize);
    // Seta inferior (Foco no "Eu")
    drawArrow(ctxTesteForcas, cx, cy + axisLength - 18, cx, cy + axisLength + 5, '#81c0d9', arrowSize);
    // Seta esquerda (Mente)
    drawArrow(ctxTesteForcas, cx - axisLength + 18, cy, cx - axisLength - 5, cy, '#81c0d9', arrowSize);
    
    // Adicionar títulos dos eixos
    const titleSize = Math.max(13, Math.floor(displaySize / 48));
    const titleOffset = Math.max(30, displaySize * 0.055); // Espaçamento maior e responsivo
    ctxTesteForcas.font = `bold ${titleSize}px Arial, sans-serif`;
    ctxTesteForcas.fillStyle = '#2c3e50';
    ctxTesteForcas.textAlign = 'center';
    ctxTesteForcas.textBaseline = 'middle';
    
    // Título superior (com mais espaço do topo)
    ctxTesteForcas.fillText('Foco nos outros', cx, cy - axisLength - titleOffset);
    
    // Título direita
    ctxTesteForcas.save();
    ctxTesteForcas.translate(cx + axisLength + 50, cy);
    ctxTesteForcas.rotate(Math.PI / 2);
    ctxTesteForcas.fillText('Coração', 0, 0);
    ctxTesteForcas.restore();
    
    // Título inferior
    ctxTesteForcas.fillText('Foco no "Eu"', cx, cy + axisLength + 25);
    
    // Título esquerda
    ctxTesteForcas.save();
    ctxTesteForcas.translate(cx - axisLength - 50, cy);
    ctxTesteForcas.rotate(-Math.PI / 2);
    ctxTesteForcas.fillText('Mente', 0, 0);
    ctxTesteForcas.restore();
    
    // Desenhar checkboxes e nomes das forças DENTRO do gráfico
    const checkboxSize = 10;
    const fontSize = Math.max(8, Math.floor(displaySize / 70));
    
    ctxTesteForcas.font = `${fontSize}px Arial, sans-serif`;
    
    FORCAS_TESTE.forEach(forca => {
        // Converter ângulo para radianos (0° = topo, sentido horário)
        const angleRad = ((forca.angle - 90) * Math.PI) / 180;
        
        // Posição do checkbox baseada no radius da força (0.5 a 1.0 do maxR)
        const checkboxR = maxR * forca.radius;
        
        const checkX = cx + checkboxR * Math.cos(angleRad);
        const checkY = cy + checkboxR * Math.sin(angleRad);
        
        // Texto fica próximo ao checkbox
        const textOffsetR = 18;
        const textX = cx + (checkboxR + textOffsetR) * Math.cos(angleRad);
        const textY = cy + (checkboxR + textOffsetR) * Math.sin(angleRad);
        
        // Desenhar checkbox
        const isSelected = selectedForcas.includes(forca.id);
        
        ctxTesteForcas.strokeStyle = '#333333';
        ctxTesteForcas.fillStyle = isSelected ? '#18bc9c' : '#ffffff';
        ctxTesteForcas.lineWidth = 1.5;
        
        const halfSize = checkboxSize / 2;
        ctxTesteForcas.beginPath();
        ctxTesteForcas.rect(checkX - halfSize, checkY - halfSize, checkboxSize, checkboxSize);
        ctxTesteForcas.fill();
        ctxTesteForcas.stroke();
        
        // Se selecionado, adicionar marca de check
        if (isSelected) {
            ctxTesteForcas.strokeStyle = '#ffffff';
            ctxTesteForcas.lineWidth = 2;
            ctxTesteForcas.beginPath();
            ctxTesteForcas.moveTo(checkX - halfSize + 2, checkY);
            ctxTesteForcas.lineTo(checkX - 1, checkY + halfSize - 2);
            ctxTesteForcas.lineTo(checkX + halfSize - 1, checkY - halfSize + 3);
            ctxTesteForcas.stroke();
        }
        
        // Desenhar texto do nome
        ctxTesteForcas.fillStyle = isSelected ? '#18bc9c' : '#333333';
        
        // Ajustar alinhamento do texto baseado na posição
        const angle = forca.angle;
        if (angle >= 45 && angle <= 135) {
            ctxTesteForcas.textAlign = 'left';
        } else if (angle >= 225 && angle <= 315) {
            ctxTesteForcas.textAlign = 'right';
        } else {
            ctxTesteForcas.textAlign = 'center';
        }
        
        ctxTesteForcas.textBaseline = 'middle';
        
        // Quebrar texto longo em múltiplas linhas
        const words = forca.name.split(' ');
        const lineHeight = fontSize + 2;
        
        if (words.length > 2) {
            // Texto com 3+ palavras em 2 linhas
            const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(' ');
            const secondLine = words.slice(Math.ceil(words.length / 2)).join(' ');
            ctxTesteForcas.fillText(firstLine, textX, textY - lineHeight / 2);
            ctxTesteForcas.fillText(secondLine, textX, textY + lineHeight / 2);
        } else if (words.length === 2 && forca.name.length > 13) {
            // Texto com 2 palavras longas
            ctxTesteForcas.fillText(words[0], textX, textY - lineHeight / 2);
            ctxTesteForcas.fillText(words[1], textX, textY + lineHeight / 2);
        } else {
            // Texto curto em uma linha
            ctxTesteForcas.fillText(forca.name, textX, textY);
        }
    });
    
    // Adicionar título no topo (com espaçamento adequado)
    const titleTopSize = Math.max(14, Math.floor(displaySize / 42));
    const titleTopY = Math.max(20, displaySize * 0.035); // Posição responsiva
    ctxTesteForcas.font = `bold ${titleTopSize}px Arial, sans-serif`;
    ctxTesteForcas.fillStyle = '#2c3e50';
    ctxTesteForcas.textAlign = 'center';
    ctxTesteForcas.fillText('VIA ME – Teste de forças', cx, titleTopY);
    
    // Adicionar logo colorido no canto superior direito
    const logoSize = Math.max(15, Math.floor(displaySize / 40));
    const logoMargin = Math.max(30, displaySize * 0.05);
    drawColorWheel(ctxTesteForcas, displaySize - logoMargin, titleTopY, logoSize);
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, size) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    
    // Ponta da seta
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - size * Math.cos(angle - Math.PI / 6),
        toY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - size * Math.cos(angle + Math.PI / 6),
        toY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

function drawColorWheel(ctx, cx, cy, radius) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    const segments = colors.length;
    
    colors.forEach((color, i) => {
        const startAngle = (i * 2 * Math.PI) / segments;
        const endAngle = ((i + 1) * 2 * Math.PI) / segments;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    });
    
    // Borda branca
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function resetTesteForcas() {
    if (confirm('Deseja realmente limpar todas as seleções?')) {
        selectedForcas = [];
        
        // Desmarcar todos os checkboxes
        document.querySelectorAll('#forcasCheckboxes input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        updateSelectionCounter();
        drawTesteForcasChart();
    }
}

function downloadTesteForcasPDF() {
    if (selectedForcas.length === 0) {
        alert('Por favor, selecione ao menos uma força antes de salvar o gráfico.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Relatório - Teste de Forças VIA ME', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141);
    doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
    
    if (canvasTesteForcas) {
        const imgData = canvasTesteForcas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 15, 30, 180, 180);
    }
    
    let yPos = 220;
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text('Forças Selecionadas:', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    selectedForcas.forEach((forcaId, index) => {
        const forca = FORCAS_TESTE.find(f => f.id === forcaId);
        if (forca) {
            doc.text(`${index + 1}. ${forca.name}`, 18, yPos);
            yPos += 6;
        }
    });
    
    const fileName = `teste_forcas_${Date.now()}.pdf`;
    doc.save(fileName);
    alert('Gráfico salvo com sucesso!');
}

// Inicializar o teste de forças quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTesteForcas);
} else {
    initTesteForcas();
}

// Atualizar canvas ao redimensionar janela
window.addEventListener('resize', () => {
    resizeTesteForcasCanvas();
    drawTesteForcasChart();
});
