// Adicionar partículas de fundo quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    const API_URL = "https://gerenciador-de-estoque-tvq6.onrender.com/api";
    
    // Adicionar evento de submit ao formulário
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const mensagemErro = document.getElementById('mensagemErro');
        const btnLogin = document.querySelector('.btn-login');
        
        // Reset mensagem de erro
        mensagemErro.textContent = '';
        mensagemErro.style.display = 'none';
        
        // Validação básica
        if (!usuario || !senha) {
            mensagemErro.textContent = 'Por favor, preencha todos os campos';
            mensagemErro.style.display = 'block';
            return;
        }
        
        // Animação de loading
        const originalText = btnLogin.innerHTML;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        btnLogin.disabled = true;
        
        try {
            // VERDADEIRA chamada à API
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, senha })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Animação de sucesso
                btnLogin.innerHTML = '<i class="fas fa-check"></i> Login realizado!';
                btnLogin.style.background = 'linear-gradient(135deg, var(--success) 0%, var(--secondary) 100%)';
                
                // Salvar usuário e redirecionar
                setTimeout(() => {
                    localStorage.setItem('usuario', data.usuario || usuario);
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error(data.error || 'Credenciais inválidas');
            }
        } catch (error) {
            // Restaurar botão
            btnLogin.innerHTML = originalText;
            btnLogin.disabled = false;
            
            // Mostrar mensagem de erro
            mensagemErro.textContent = error.message;
            mensagemErro.style.display = 'block';
            
            // Adicionar animação de shake no formulário
            const loginCard = document.querySelector('.login-card');
            loginCard.classList.add('shake');
            setTimeout(() => {
                loginCard.classList.remove('shake');
            }, 500);
        }
    });
    
    // Adicionar efeitos interativos aos inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});

// Função para criar partículas de fundo
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'bg-particles';
    document.body.appendChild(particlesContainer);
    
    const colors = [
        'rgba(255, 127, 0, 0.2)', 
        'rgba(46, 139, 87, 0.2)', 
        'rgba(255, 255, 255, 0.3)'
    ];
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Tamanho aleatório entre 10 e 50px
        const size = Math.random() * 40 + 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posição aleatória
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Cor aleatória
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Duração e delay aleatórios para a animação
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
}