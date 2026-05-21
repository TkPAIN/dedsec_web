// DATOS DEL JUEGO (estado real)
let gameState = {
    followers: 12847,
    researchPoints: 3,
    missions: [
        { id: 1, title: "INFILTRAR BLUME", description: "Accede a los servidores de Blume", reward: 250, status: "pending", xp: 2 },
        { id: 2, title: "RECLUTAR HACKERS", description: "Encuentra 3 nuevos miembros", reward: 150, status: "pending", xp: 1 },
        { id: 3, title: "SABOTEAR CTOS", description: "Desactiva nodos de control", reward: 500, status: "completed", xp: 3 },
        { id: 4, title: "LIBERAR DATOS", description: "Filtra documentos incriminatorios", reward: 300, status: "pending", xp: 2 }
    ],
    unlockedSkills: []
};

// FUNCIONES PRINCIPALES
function renderMissions() {
    const container = document.getElementById('missionsList');
    if (!container) return;
    
    container.innerHTML = gameState.missions.map(mission => `
        <div class="mission-card" data-mission-id="${mission.id}">
            <div class="mission-info">
                <h4>${mission.title}</h4>
                <p>${mission.description}</p>
                <small>🏆 ${mission.xp} XP</small>
            </div>
            <div class="mission-reward">
                +${mission.reward} seguidores
            </div>
            <div class="mission-status ${mission.status === 'completed' ? 'status-completed' : 'status-pending'}">
                ${mission.status === 'completed' ? '✓ COMPLETADA' : '◯ PENDIENTE'}
            </div>
        </div>
    `).join('');
    
    // Añadir event listeners a las misiones pendientes
    document.querySelectorAll('.mission-card').forEach(card => {
        card.addEventListener('click', () => {
            const missionId = parseInt(card.dataset.missionId);
            completeMission(missionId);
        });
    });
}

function completeMission(missionId) {
    const mission = gameState.missions.find(m => m.id === missionId);
    if (mission && mission.status === 'pending') {
        mission.status = 'completed';
        
        // Actualizar seguidores y puntos
        gameState.followers += mission.reward;
        gameState.researchPoints += mission.xp;
        
        // Actualizar UI
        updateStats();
        renderMissions();
        updateProgress();
        
        // Efecto visual
        showNotification(`¡Misión completada! +${mission.reward} seguidores`);
        
        // Verificar si todas las misiones están completadas
        checkAllMissionsCompleted();
    }
}

function updateStats() {
    const followersElem = document.getElementById('followersCount');
    const pointsElem = document.querySelector('.points-value');
    
    if (followersElem) {
        followersElem.textContent = gameState.followers.toLocaleString();
    }
    
    if (pointsElem) {
        pointsElem.textContent = gameState.researchPoints;
    }
}

function updateProgress() {
    const completed = gameState.missions.filter(m => m.status === 'completed').length;
    const total = gameState.missions.length;
    const percentage = (completed / total) * 100;
    
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.floor(percentage)}% COMPLETADO`;
    }
}

function showNotification(message) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ffcc;
        color: #000;
        padding: 1rem;
        border-radius: 4px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function checkAllMissionsCompleted() {
    const allCompleted = gameState.missions.every(m => m.status === 'completed');
    if (allCompleted) {
        setTimeout(() => {
            showNotification('🏆 ¡Has completado todas las operaciones! ¡Eres una leyenda de DedSec!');
        }, 500);
    }
}

// NAVEGACIÓN ENTRE PÁGINAS
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.dataset.page;
            
            // Actualizar botones activos
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar páginas visibles
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `${pageId}-page`) {
                    page.classList.add('active');
                }
            });
        });
    });
}

// CHAT FUNCIONAL
function setupChat() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendChat');
    const chatMessages = document.getElementById('chatMessages');
    
    function addMessage(username, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessage('TÚ', message);
            chatInput.value = '';
            
            // Respuesta automática (simulando otros miembros)
            setTimeout(() => {
                const responses = [
                    "¡Buena onda, hackerman!",
                    "DedSec te respalda",
                    "🤖 Procesando...",
                    "🔓 Acceso concedido"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage('SISTEMA', randomResponse);
            }, 1000);
        }
    }
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// SKILLS (DESBLOQUEABLES)
function setupSkills() {
    const unlockButtons = document.querySelectorAll('.unlock-btn');
    
    unlockButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cost = parseInt(btn.dataset.cost);
            
            if (gameState.researchPoints >= cost) {
                gameState.researchPoints -= cost;
                updateStats();
                
                const skillCard = btn.closest('.skill-card');
                skillCard.classList.remove('available');
                skillCard.classList.add('locked');
                btn.disabled = true;
                btn.textContent = 'DESBLOQUEADO ✓';
                
                showNotification('🔓 Habilidad desbloqueada');
            } else {
                showNotification('❌ Puntos de investigación insuficientes');
            }
        });
    });
}

// MAPA INTERACTIVO (simulado)
function setupMap() {
    const mapMarkers = document.querySelectorAll('.map-marker');
    // Aquí podrías añadir más funcionalidad de mapa
}

// EFECTO DE RELOJ EN VIVO
function updateClock() {
    const timeElem = document.querySelector('.time');
    if (timeElem) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElem.textContent = `${hours}:${minutes}`;
    }
}

// INICIALIZACIÓN
function init() {
    renderMissions();
    updateStats();
    updateProgress();
    setupNavigation();
    setupChat();
    setupSkills();
    setupMap();
    updateClock();
    setInterval(updateClock, 1000);
    
    // Añadir estilos para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
