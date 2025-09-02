// Verificar autenticação ao carregar a página principal
function verificarAutenticacao() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario || (usuario !== 'Eder' && usuario !== 'Thyago')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// URL da API - PRODUÇÃO
const API_URL = "https://gerenciador-de-estoque-tvq6.onrender.com/api";

// Variáveis globais
let usuario = null;
let estoque = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (!verificarAutenticacao()) return;
    
    usuario = localStorage.getItem('usuario');
    document.getElementById('nomeUsuario').textContent = usuario;
    carregarEstoque();
    
    // Event listeners
    document.getElementById('btnLogout').addEventListener('click', function() {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    });
    
    document.getElementById('btnAtualizar').addEventListener('click', function() {
        this.classList.add('pulse');
        carregarEstoque().then(() => {
            setTimeout(() => {
                this.classList.remove('pulse');
            }, 500);
        });
    });
    
    document.getElementById('btnVerHistorico').addEventListener('click', mostrarHistorico);
    
    // Fechar modal
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('modalHistorico').style.display = 'none';
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('modalHistorico')) {
            document.getElementById('modalHistorico').style.display = 'none';
        }
    });
});

// Mostrar notificação toast
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Configurar cor baseada no tipo
    if (isSuccess) {
        toast.style.backgroundColor = 'var(--success)';
        toastIcon.className = 'fas fa-check-circle toast-icon';
    } else {
        toast.style.backgroundColor = 'var(--danger)';
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Carregar estoque
async function carregarEstoque() {
    try {
        const response = await fetch(`${API_URL}/estoque`);
        if (!response.ok) throw new Error('Erro ao carregar estoque');
        
        estoque = await response.json();
        renderizarEstoque();
    } catch (error) {
        showToast('Erro ao carregar estoque: ' + error.message, false);
    }
}

// Renderizar tabela de estoque
function renderizarEstoque() {
    const tbody = document.querySelector('#tabelaEstoque tbody');
    tbody.innerHTML = '';
    
    let total500g = 0;
    let total1kg = 0;
    let total1kgGrande = 0;
    
    estoque.forEach(item => {
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        
        // Calcular totais
        const totalSabor = item.peso_500g + item.peso_1kg + (item.peso_1kg_grande || 0);
        total500g += item.peso_500g;
        total1kg += item.peso_1kg;
        total1kgGrande += item.peso_1kg_grande || 0;
        
        tr.innerHTML = `
            <td class="sabor-col">${item.sabor}</td>
            <td>
                <span class="quantidade">${item.peso_500g}</span>
                <button class="btn-adicionar" data-sabor="${item.sabor}" data-peso="500g"><i class="fas fa-plus"></i></button>
                <button class="btn-remover" data-sabor="${item.sabor}" data-peso="500g"><i class="fas fa-minus"></i></button>
            </td>
            <td>
                <span class="quantidade">${item.peso_1kg}</span>
                <button class="btn-adicionar" data-sabor="${item.sabor}" data-peso="1kg"><i class="fas fa-plus"></i></button>
                <button class="btn-remover" data-sabor="${item.sabor}" data-peso="1kg"><i class="fas fa-minus"></i></button>
            </td>
            <td>
                <span class="quantidade">${item.peso_1kg_grande || 0}</span>
                <button class="btn-adicionar" data-sabor="${item.sabor}" data-peso="1kg_grande"><i class="fas fa-plus"></i></button>
                <button class="btn-remover" data-sabor="${item.sabor}" data-peso="1kg_grande"><i class="fas fa-minus"></i></button>
            </td>
            <td class="total-col">${totalSabor}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Atualizar totais
    document.getElementById('total500g').textContent = total500g;
    document.getElementById('total1kg').textContent = total1kg;
    document.getElementById('total1kgGrande').textContent = total1kgGrande;
    document.getElementById('totalGeral').textContent = total500g + total1kg + total1kgGrande;
    
    // Adicionar event listeners aos botões
    adicionarEventListeners();
}

// Adicionar event listeners aos botões
function adicionarEventListeners() {
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
        // Remover event listeners anteriores para evitar duplicação
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.btn-remover').forEach(btn => {
        // Remover event listeners anteriores para evitar duplicação
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Adicionar novos event listeners
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
        btn.addEventListener('click', function() {
            const sabor = this.dataset.sabor;
            const peso = this.dataset.peso;
            this.classList.add('pulse');
            atualizarEstoque(sabor, peso, 1);
        });
    });
    
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', function() {
            const sabor = this.dataset.sabor;
            const peso = this.dataset.peso;
            this.classList.add('pulse');
            atualizarEstoque(sabor, peso, -1);
        });
    });
}

// Atualizar estoque (sem recarregar a página inteira)
async function atualizarEstoque(sabor, peso, alteracao) {
    try {
        const response = await fetch(`${API_URL}/estoque`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario,
                sabor,
                peso,
                alteracao
            })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar estoque');
        
        // Buscar dados atualizados do servidor
        const responseEstoque = await fetch(`${API_URL}/estoque`);
        if (responseEstoque.ok) {
            estoque = await responseEstoque.json();
            
            // Atualizar apenas os valores na interface (sem recarregar a página)
            atualizarInterface();
            
            showToast(`Estoque de ${sabor} (${peso}) atualizado com sucesso!`);
        }
    } catch (error) {
        showToast('Erro ao atualizar estoque: ' + error.message, false);
    } finally {
        // Remover animação do botão após 500ms
        setTimeout(() => {
            document.querySelectorAll('.pulse').forEach(btn => {
                btn.classList.remove('pulse');
            });
        }, 500);
    }
}

// Atualizar interface sem recarregar a página inteira
function atualizarInterface() {
    let total500g = 0;
    let total1kg = 0;
    let total1kgGrande = 0;
    
    // Atualizar cada linha da tabela
    const linhas = document.querySelectorAll('#tabelaEstoque tbody tr');
    linhas.forEach(linha => {
        const sabor = linha.querySelector('.sabor-col').textContent;
        const item = estoque.find(e => e.sabor === sabor);
        
        if (item) {
            // Atualizar valores
            linha.querySelector('td:nth-child(2) .quantidade').textContent = item.peso_500g;
            linha.querySelector('td:nth-child(3) .quantidade').textContent = item.peso_1kg;
            linha.querySelector('td:nth-child(4) .quantidade').textContent = item.peso_1kg_grande || 0;
            
            // Calcular e atualizar total por sabor
            const totalSabor = item.peso_500g + item.peso_1kg + (item.peso_1kg_grande || 0);
            linha.querySelector('td:nth-child(5)').textContent = totalSabor;
            
            // Adicionar efeito de destaque
            linha.classList.add('highlight');
            setTimeout(() => {
                linha.classList.remove('highlight');
            }, 1000);
            
            // Somar totais gerais
            total500g += item.peso_500g;
            total1kg += item.peso_1kg;
            total1kgGrande += item.peso_1kg_grande || 0;
        }
    });
    
    // Atualizar totais gerais
    document.getElementById('total500g').textContent = total500g;
    document.getElementById('total1kg').textContent = total1kg;
    document.getElementById('total1kgGrande').textContent = total1kgGrande;
    document.getElementById('totalGeral').textContent = total500g + total1kg + total1kgGrande;
}

// Mostrar histórico
async function mostrarHistorico() {
    try {
        const response = await fetch(`${API_URL}/historico`);
        if (!response.ok) throw new Error('Erro ao carregar histórico');
        
        const historico = await response.json();
        renderizarHistorico(historico);
        document.getElementById('modalHistorico').style.display = 'block';
    } catch (error) {
        showToast('Erro ao carregar histórico: ' + error.message, false);
    }
}

// Renderizar histórico
function renderizarHistorico(historico) {
    const tbody = document.querySelector('#tabelaHistorico tbody');
    tbody.innerHTML = '';
    
    if (historico.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum registro encontrado</td></tr>';
        return;
    }
    
    historico.forEach(item => {
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        const data = new Date(item.data).toLocaleString('pt-BR');
        
        // Definir classe baseada no tipo de alteração
        const alteracaoClass = item.alteracao > 0 ? 'positive' : 'negative';
        
        tr.innerHTML = `
            <td>${data}</td>
            <td>${item.usuario}</td>
            <td>${item.sabor}</td>
            <td>${item.peso}</td>
            <td class="${alteracaoClass}">${item.alteracao > 0 ? '+' : ''}${item.alteracao}</td>
        `;
        
        tbody.appendChild(tr);
    });
}