// API GitHub para persistência de dados
class GitHubAPI {
    constructor() {
        this.token = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN';
        this.repo = 'seu-usuario/raspacash-data';
        this.baseURL = 'https://api.github.com';
    }
    
    async loadUserData(userEmail) {
        try {
            const fileName = `users/${this.sanitizeEmail(userEmail)}.json`;
            const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${fileName}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 404) {
                // Usuário não existe, criar dados iniciais
                const initialData = {
                    email: userEmail,
                    balance: 0,
                    totalDeposits: 0,
                    totalWithdraws: 0,
                    totalGames: 0,
                    totalWins: 0,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                await this.saveUserData(userEmail, initialData);
                return initialData;
            }
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            
            // Atualizar último login
            content.lastLogin = new Date().toISOString();
            await this.saveUserData(userEmail, content);
            
            return content;
            
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            
            // Fallback para localStorage
            const localData = localStorage.getItem(`github_user_${userEmail}`);
            if (localData) {
                return JSON.parse(localData);
            }
            
            return {
                email: userEmail,
                balance: 0,
                totalDeposits: 0,
                totalWithdraws: 0,
                totalGames: 0,
                totalWins: 0,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
        }
    }
    
    async saveUserData(userEmail, userData) {
        try {
            const fileName = `users/${this.sanitizeEmail(userEmail)}.json`;
            const content = btoa(JSON.stringify(userData, null, 2));
            
            // Verificar se arquivo já existe para obter SHA
            let sha = null;
            try {
                const existingResponse = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${fileName}`, {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (existingResponse.ok) {
                    const existingData = await existingResponse.json();
                    sha = existingData.sha;
                }
            } catch (e) {
                // Arquivo não existe, será criado
            }
            
            const requestBody = {
                message: `Update user data for ${userEmail}`,
                content: content,
                ...(sha && { sha })
            };
            
            const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            // Backup no localStorage
            localStorage.setItem(`github_user_${userEmail}`, JSON.stringify(userData));
            
            return await response.json();
            
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
            
            // Fallback para localStorage
            localStorage.setItem(`github_user_${userEmail}`, JSON.stringify(userData));
            throw error;
        }
    }
    
    async logTransaction(transactionData) {
        try {
            const timestamp = new Date().toISOString();
            const fileName = `transactions/${timestamp.split('T')[0]}/${this.sanitizeEmail(transactionData.userId)}_${Date.now()}.json`;
            
            const fullTransactionData = {
                ...transactionData,
                timestamp: timestamp,
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            const content = btoa(JSON.stringify(fullTransactionData, null, 2));
            
            const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Log transaction: ${transactionData.type} - ${transactionData.amount}`,
                    content: content
                })
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Erro ao registrar transação:', error);
            
            // Backup no localStorage
            const transactions = JSON.parse(localStorage.getItem('github_transactions') || '[]');
            transactions.push({
                ...transactionData,
                timestamp: new Date().toISOString(),
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            localStorage.setItem('github_transactions', JSON.stringify(transactions));
            
            throw error;
        }
    }
    
    async logGame(gameData) {
        try {
            const timestamp = new Date().toISOString();
            const fileName = `games/${timestamp.split('T')[0]}/${this.sanitizeEmail(gameData.userId)}_${Date.now()}.json`;
            
            const fullGameData = {
                ...gameData,
                timestamp: timestamp,
                id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            const content = btoa(JSON.stringify(fullGameData, null, 2));
            
            const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Log game: ${gameData.planName} - ${gameData.won ? 'WIN' : 'LOSE'}`,
                    content: content
                })
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Erro ao registrar jogo:', error);
            
            // Backup no localStorage
            const games = JSON.parse(localStorage.getItem('github_games') || '[]');
            games.push({
                ...gameData,
                timestamp: new Date().toISOString(),
                id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            localStorage.setItem('github_games', JSON.stringify(games));
            
            throw error;
        }
    }
    
    async triggerWebhook(eventType, eventData) {
        try {
            // Disparar GitHub Actions via repository_dispatch
            const response = await fetch(`${this.baseURL}/repos/${this.repo}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: eventType,
                    client_payload: {
                        ...eventData,
                        timestamp: new Date().toISOString(),
                        source: 'raspacash_frontend'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`GitHub Webhook Error: ${response.status}`);
            }
            
            console.log(`✅ Webhook disparado: ${eventType}`);
            return true;
            
        } catch (error) {
            console.error('Erro ao disparar webhook:', error);
            return false;
        }
    }
    
    sanitizeEmail(email) {
        return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }
}

// Função global para criar instância da API
window.createGitHubAPI = () => {
    return new GitHubAPI();
};

// Exportar para uso direto
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}
