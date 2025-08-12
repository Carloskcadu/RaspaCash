// Sistema Principal RaspaCash class RaspaCashApp { constructor() { this.currentUser = null; this.currentScreen = 'login'; this.gameData = { prizes: \[0, 5, 10, 25, 50, 100, 250, 500, 1000, 2000], costs: \[1, 2, 5, 10, 20] }; this.init(); }

```
init() {
    // Remover loading
    document.getElementById('loading').remove();
    
    // Carregar usuário salvo
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.currentScreen = 'home';
    }
    
    this.render();
}

render() {
    const app = document.getElementById('app');
    
    switch (this.currentScreen) {
        case 'login':
            app.innerHTML = this.renderLogin();
            break;
        case 'home':
            app.innerHTML = this.renderHome();
            break;
        case 'game':
            app.innerHTML = this.renderGame();
            break;
        case 'deposit':
            app.innerHTML = this.renderDeposit();
            break;
        case 'withdraw':
            app.innerHTML = this.renderWithdraw();
            break;
        default:
            app.innerHTML = this.renderLogin();
    }
    
    this.attachEventListeners();
}

renderLogin() {
    return `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div class="text-center mb-8">
                    <h1 class="text-4xl font-bold text-purple-600 mb-2">🎰 RaspaCash</h1>
                    <p class="text-gray-600">Raspadinhas Online com PIX</p>
                </div>
                
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="email" required 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    </div>
                    
                    <button type="submit" 
                            class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                        Entrar
                    </button>
                </form>
                
                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-500">
                        Novo aqui? O cadastro é automático! 🎉
                    </p>
                </div>
            </div>
        </div>
    `;
}

renderHome() {
    return `
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-purple-600">🎰 RaspaCash</h1>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm text-gray-500">${this.currentUser?.email || 'Usuário'}</p>
                            <p class="font-bold text-green-600">R$ ${(this.currentUser?.balance || 0).toFixed(2)}</p>
                        </div>
                        <button onclick="app.logout()" class="text-red-500 hover:text-red-700">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main class="max-w-7xl mx-auto px-4 py-8">
                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">💰 Saldo</h3>
                        <p class="text-3xl font-bold text-green-600">R$ ${(this.currentUser?.balance || 0).toFixed(2)}</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">🎮 Jogos</h3>
                        <p class="text-3xl font-bold text-blue-600">${this.currentUser?.totalPlayed || 0}</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">🏆 Ganhos</h3>
                        <p class="text-3xl font-bold text-purple-600">R$ ${(this.currentUser?.totalWon || 0).toFixed(2)}</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button onclick="app.goToScreen('game')" 
                            class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:scale-105 transition-transform">
                        <div class="text-2xl mb-2">🎰</div>
                        <div class="font-semibold">Jogar Agora</div>
                    </button>
                    
                    <button onclick="app.goToScreen('deposit')" 
                            class="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl hover:scale-105 transition-transform">
                        <div class="text-2xl mb-2">💳</div>
                        <div class="font-semibold">Depositar</div>
                    </button>
                    
                    <button onclick="app.goToScreen('withdraw')" 
                            class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:scale-105 transition-transform">
                        <div class="text-2xl mb-2">💸</div>
                        <div class="font-semibold">Sacar</div>
                    </button>
                    
                    <button onclick="app.showHistory()" 
                            class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl hover:scale-105 transition-transform">
                        <div class="text-2xl mb-2">📊</div>
                        <div class="font-semibold">Histórico</div>
                    </button>
                </div>

                <!-- Promotion Banner -->
                <div class="bg-gradient-animated text-white p-8 rounded-xl text-center">
                    <h2 class="text-3xl font-bold mb-4">🔥 Promoção Especial!</h2>
                    <p class="text-xl mb-4">Ganhe até R$ 2.000 em nossas raspadinhas!</p>
                    <button onclick="app.goToScreen('game')" 
                            class="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                        Jogar Agora
                    </button>
                </div>
            </main>
        </div>
    `;
}

renderGame() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
            <header class="bg-black bg-opacity-20 text-white p-4">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <button onclick="app.goToScreen('home')" 
                            class="flex items-center text-white hover:text-gray-300">
                        ← Voltar
                    </button>
                    <div class="text-center">
                        <h1 class="text-2xl font-bold">🎰 Raspadinha</h1>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">R$ ${(this.currentUser?.balance || 0).toFixed(2)}</p>
                    </div>
                </div>
            </header>

            <main class="max-w-4xl mx-auto px-4 py-8">
                <div class="bg-white rounded-2xl p-8 shadow-2xl">
                    <!-- Game Selection -->
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-800 mb-4">Escolha sua Raspadinha</h2>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            ${this.gameData.costs.map(cost => `
                                <button onclick="app.selectGameCost(${cost})" 
                                        class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl hover:scale-105 transition-transform">
                                    <div class="text-xl font-bold">R$ ${cost}</div>
                                    <div class="text-sm">Até R$ ${cost * 200}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Game Canvas -->
                    <div id="gameArea" class="text-center">
                        <p class="text-gray-500 text-lg">Escolha um valor para jogar!</p>
                    </div>
                </div>
            </main>
        </div>
    `;
}

renderDeposit() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600">
            <header class="bg-black bg-opacity-20 text-white p-4">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <button onclick="app.goToScreen('home')" 
                            class="flex items-center text-white hover:text-gray-300">
                        ← Voltar
                    </button>
                    <h1 class="text-2xl font-bold">💳 Depositar</h1>
                    <div></div>
                </div>
            </header>

            <main class="max-w-md mx-auto px-4 py-8">
                <div class="bg-white rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Depósito via PIX</h2>
                        <p class="text-gray-600">Instantâneo e seguro</p>
                    </div>

                    <form id="depositForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                            <select id="depositAmount" required 
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                <option value="">Selecione o valor</option>
                                <option value="10">R$ 10,00</option>
                                <option value="25">R$ 25,00</option>
                                <option value="50">R$ 50,00</option>
                                <option value="100">R$ 100,00</option>
                                <option value="200">R$ 200,00</option>
                                <option value="500">R$ 500,00</option>
                            </select>
                        </div>

                        <button type="submit" 
                                class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                            Gerar PIX
                        </button>
                    </form>

                    <div id="pixResult" class="hidden mt-6">
                        <!-- PIX QR Code will be shown here -->
                    </div>
                </div>
            </main>
        </div>
    `;
}

renderWithdraw() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-600">
            <header class="bg-black bg-opacity-20 text-white p-4">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <button onclick="app.goToScreen('home')" 
                            class="flex items-center text-white hover:text-gray-300">
                        ← Voltar
                    </button>
                    <h1 class="text-2xl font-bold">💸 Sacar</h1>
                    <div></div>
                </div>
            </header>

            <main class="max-w-md mx-auto px-4 py-8">
                <div class="bg-white rounded-2xl p-8 shadow-2xl">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Saque via PIX</h2>
                        <p class="text-gray-600">Saldo: R$ ${(this.currentUser?.balance || 0).toFixed(2)}</p>
                    </div>

                    <form id="withdrawForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                            <input type="number" id="withdrawAmount" min="10" max="${this.currentUser?.balance || 0}" step="0.01" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="Mínimo R$ 10,00">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Chave PIX</label>
                            <input type="text" id="pixKey" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="CPF, Email, Telefone ou Chave Aleatória">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                            <input type="text" id="fullName" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="Seu nome completo">
                        </div>

                        <button type="submit" 
                                class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Solicitar Saque
                        </button>
                    </form>
                </div>
            </main>
        </div>
    `;
}

attachEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Deposit form
    const depositForm = document.getElementById('depositForm');
    if (depositForm) {
        depositForm.addEventListener('submit', (e) => this.handleDeposit(e));
    }

    // Withdraw form
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', (e) => this.handleWithdraw(e));
    }
}

async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    // Criar ou carregar usuário
    this.currentUser = {
        id: btoa(email).replace(/[^a-zA-Z0-9]/g, ''),
        email: email,
        balance: 50, // Bônus de boas-vindas
        totalPlayed: 0,
        totalWon: 0,
        createdAt: new Date().toISOString()
    };

    // Salvar usuário
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    this.currentScreen = 'home';
    this.render();
}

async handleDeposit(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    try {
        const result = await window.picpayAPI.generatePixPayment(amount, this.currentUser.email);
        
        if (result.success) {
            this.showPixQRCode(result.data);
        } else {
            alert('Erro ao gerar PIX: ' + result.message);
        }
    } catch (error) {
        console.error('Erro no depósito:', error);
        alert('Erro ao processar depósito');
    }
}

async handleWithdraw(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const pixKey = document.getElementById('pixKey').value;
    const fullName = document.getElementById('fullName').value;
    
    if (amount > this.currentUser.balance) {
        alert('Saldo insuficiente!');
        return;
    }

    try {
        const result = await window.picpayAPI.processPixPayout(amount, pixKey, 'cpf', fullName, this.currentUser.email);
        
        if (result.success) {
            // Atualizar saldo
            this.currentUser.balance -= amount;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            alert(result.data.message);
            this.goToScreen('home');
        } else {
            alert('Erro no saque: ' + result.message);
        }
    } catch (error) {
        console.error('Erro no saque:', error);
        alert('Erro ao processar saque');
    }
}

showPixQRCode(pixData) {
    const pixResult = document.getElementById('pixResult');
    pixResult.innerHTML = `
        <div class="text-center">
            <h3 class="text-lg font-bold mb-4">QR Code PIX</h3>
            <div class="bg-gray-100 p-4 rounded-lg mb-4">
                <div class="text-6xl">📱</div>
                <p class="text-sm text-gray-600 mt-2">Escaneie com seu banco</p>
            </div>
            <div class="bg-gray-50 p-3 rounded text-sm break-all mb-4">
                <strong>Código PIX:</strong><br>
                ${pixData.qr_code}
            </div>
            <p class="text-sm text-green-600 font-semibold">
                Valor: R$ ${pixData.amount.toFixed(2)}<br>
                Válido por 30 minutos
            </p>
            <button onclick="app.checkPayment('${pixData.id}')" 
                    class="w-full mt-4 bg-green-600 text-white py-2 rounded-lg">
                Já paguei - Verificar
            </button>
        </div>
    `;
    pixResult.classList.remove('hidden');
}

async checkPayment(paymentId) {
    try {
        const result = await window.picpayAPI.checkPaymentStatus(paymentId);
        
        if (result.success && result.data.status === 'paid') {
            // Extrair valor do ID de pagamento (simulação)
            const amount = parseFloat(paymentId.split('_')[2]) || 10;
            
            // Atualizar saldo
            this.currentUser.balance += amount;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            alert(`Pagamento aprovado! R$ ${amount.toFixed(2)} foi adicionado ao seu saldo.`);
            this.goToScreen('home');
        } else {
            alert('Pagamento ainda não foi confirmado. Tente novamente em alguns segundos.');
        }
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        alert('Erro ao verificar pagamento');
    }
}

selectGameCost(cost) {
    if (this.currentUser.balance < cost) {
        alert('Saldo insuficiente! Faça um depósito.');
        return;
    }

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="mb-6">
            <h3 class="text-2xl font-bold mb-4">Raspadinha R$ ${cost}</h3>
            <div class="relative inline-block">
                <canvas id="scratchCanvas" width="300" height="200" 
                        class="canvas-scratch border-4 border-gold-400 rounded-lg shadow-lg cursor-pointer"></canvas>
                <div id="prizeReveal" class="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                    <!-- Prize will be revealed here -->
                </div>
            </div>
            <button onclick="app.playScratchCard(${cost})" 
                    class="mt-4 bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700">
                Jogar R$ ${cost}
            </button>
        </div>
    `;
}

playScratchCard(cost) {
    if (this.currentUser.balance < cost) {
        alert('Saldo insuficiente!');
        return;
    }

    // Deduzir custo
    this.currentUser.balance -= cost;
    this.currentUser.totalPlayed += 1;

    // Calcular prêmio
    const maxPrize = cost * 200;
    const prizes = this.gameData.prizes.filter(p => p <= maxPrize);
    const randomPrize = Math.random() < 0.3 ? prizes[Math.floor(Math.random() * prizes.length)] : 0;

    // Adicionar prêmio
    if (randomPrize > 0) {
        this.currentUser.balance += randomPrize;
        this.currentUser.totalWon += randomPrize;
    }

    // Salvar dados
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

    // Mostrar resultado
    const prizeReveal = document.getElementById('prizeReveal');
    if (randomPrize > 0) {
        prizeReveal.innerHTML = `
            <div class="text-center text-green-600">
                <div class="text-4xl">🎉</div>
                <div class="text-2xl font-bold">GANHOU!</div>
                <div class="text-xl">R$ ${randomPrize.toFixed(2)}</div>
            </div>
        `;
        setTimeout(() => alert(`Parabéns! Você ganhou R$ ${randomPrize.toFixed(2)}!`), 500);
    } else {
        prizeReveal.innerHTML = `
            <div class="text-center text-gray-600">
                <div class="text-4xl">😔</div>
                <div class="text-xl">Que pena!</div>
                <div>Tente novamente</div>
            </div>
        `;
    }

    // Simular animação de raspagem
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    
    // Fundo da raspadinha
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, 300, 200);
    
    // Texto "RASPE AQUI"
    ctx.fillStyle = '#666';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RASPE AQUI', 150, 100);
    
    // Simular raspagem após 1 segundo
    setTimeout(() => {
        ctx.clearRect(0, 0, 300, 200);
        prizeReveal.style.display = 'flex';
    }, 1000);
}

goToScreen(screen) {
    this.currentScreen = screen;
    this.render();
}

logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.currentScreen = 'login';
    this.render();
}

showHistory() {
    alert('Histórico em desenvolvimento!');
}
```

}

// Inicializar aplicação quando página carregar document.addEventListener('DOMContentLoaded', () => { window\.app = new RaspaCashApp(); });
