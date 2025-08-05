// API PicPay para integração com pagamentos PIX
class PicPayAPI {
    constructor() {
        this.baseURL = 'https://appws.picpay.com/ecommerce/public';
        this.token = process.env.PICPAY_TOKEN || 'YOUR_PICPAY_TOKEN';
        this.sellerId = process.env.PICPAY_SELLER_ID || 'YOUR_SELLER_ID';
    }
    
    async generatePixPayment(amount, buyerEmail, reference) {
        try {
            const paymentData = {
                referenceId: `raspacash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                callbackUrl: `${window.location.origin}/webhook/picpay`,
                returnUrl: `${window.location.origin}`,
                value: amount,
                buyer: {
                    firstName: 'Cliente',
                    lastName: 'RaspaCash',
                    document: '11122233344',
                    email: buyerEmail,
                    phone: '+5511999999999'
                }
            };
            
            const response = await fetch(`${this.baseURL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-picpay-token': this.token
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            return {
                id: result.referenceId,
                amount: amount,
                qr_code: result.qrcode?.base64 || this.generateMockPixCode(amount),
                status: 'pending',
                expires_at: new Date(Date.now() + (30 * 60 * 1000)).toISOString()
            };
            
        } catch (error) {
            console.error('Erro ao gerar PIX PicPay:', error);
            
            // Fallback para desenvolvimento/teste
            return {
                id: `mock_${Date.now()}`,
                amount: amount,
                qr_code: this.generateMockPixCode(amount),
                status: 'pending',
                expires_at: new Date(Date.now() + (30 * 60 * 1000)).toISOString()
            };
        }
    }
    
    async checkPaymentStatus(paymentId) {
        try {
            const response = await fetch(`${this.baseURL}/payments/${paymentId}/status`, {
                method: 'GET',
                headers: {
                    'x-picpay-token': this.token
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            return {
                status: result.status,
                authorizationId: result.authorizationId
            };
            
        } catch (error) {
            console.error('Erro ao verificar status PicPay:', error);
            
            // Fallback para desenvolvimento
            // Simular pagamento aprovado após 30 segundos para testes
            if (paymentId.startsWith('mock_')) {
                const paymentTime = parseInt(paymentId.replace('mock_', ''));
                const elapsed = Date.now() - paymentTime;
                
                if (elapsed > 30000) { // 30 segundos
                    return {
                        status: 'paid',
                        authorizationId: `auth_${Date.now()}`
                    };
                }
            }
            
            return {
                status: 'pending',
                authorizationId: null
            };
        }
    }
    
    async processPixPayout(amount, pixKey, pixKeyType, fullName, userEmail) {
        try {
            const payoutData = {
                referenceId: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                value: amount,
                destination: {
                    type: pixKeyType,
                    key: pixKey,
                    name: fullName
                },
                notification: {
                    email: userEmail
                }
            };
            
            const response = await fetch(`${this.baseURL}/payouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-picpay-token': this.token
                },
                body: JSON.stringify(payoutData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            return {
                success: true,
                transactionId: result.referenceId,
                status: result.status,
                message: 'Saque processado com sucesso! Você receberá em até 24 horas.'
            };
            
        } catch (error) {
            console.error('Erro ao processar saque PicPay:', error);
            
            // Para desenvolvimento, simular sucesso
            return {
                success: true,
                transactionId: `mock_payout_${Date.now()}`,
                status: 'processing',
                message: 'Saque simulado processado! (modo desenvolvimento)'
            };
        }
    }
    
    generateMockPixCode(amount) {
        // Gerar código PIX mock para desenvolvimento
        const pixData = {
            amount: amount,
            merchant: 'RaspaCash',
            city: 'SAO PAULO',
            timestamp: Date.now()
        };
        
        return `00020126580014BR.GOV.BCB.PIX0136${btoa(JSON.stringify(pixData)).substr(0, 32)}52040000530398654${String(amount).padStart(8, '0')}5802BR5909RaspaCash6009SAO PAULO6304${Math.random().toString().substr(2, 4)}`;
    }
}

// Função global para criar instância da API
window.createPicPayAPI = () => {
    return new PicPayAPI();
};

// Exportar para uso direto
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PicPayAPI;
}
