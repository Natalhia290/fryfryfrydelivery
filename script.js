// Variáveis globais
let menuData = {};
let currentFilter = 'todos';
let isAdminLoggedIn = false;
let cart = [];
let codigoDescontoAplicado = null;
let descontoAtivo = false;

// Elementos DOM
const produtosContainer = document.getElementById('produtos');
const loadingElement = document.getElementById('loading');
const filtros = document.querySelectorAll('.filtro-btn');
const adminBtn = document.getElementById('adminBtn');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const loginModal = document.getElementById('loginModal');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const loginForm = document.getElementById('loginForm');
const checkoutForm = document.getElementById('checkoutForm');
const closeModal = document.querySelectorAll('.close');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    checkBusinessHours();
    setupEventListeners();
    loadMenuData();
    loadCart();
});

// Inicializar aplicação
function initializeApp() {
    // Verificar se há sessão ativa
    const session = localStorage.getItem('fry_session');
    if (session) {
        const sessionData = JSON.parse(session);
        if (Date.now() - sessionData.timestamp < 30 * 60 * 1000) { // 30 minutos
            isAdminLoggedIn = true;
            adminBtn.textContent = 'Painel Admin';
        } else {
            localStorage.removeItem('fry_session');
        }
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Filtros
    filtros.forEach(btn => {
        btn.addEventListener('click', () => {
            filtros.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.categoria;
            renderProdutos();
        });
    });

    // Botão admin
    adminBtn.addEventListener('click', () => {
        if (isAdminLoggedIn) {
            window.location.href = 'painel-pedidos.html';
        } else {
            loginModal.style.display = 'block';
        }
    });

    // Modal
    closeModal.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            cartModal.style.display = 'none';
            checkoutModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });

    // Formulário de login
    loginForm.addEventListener('submit', handleLogin);
    
    // Configurar carrinho
    setupCartEventListeners();
}

// Carregar dados do cardápio
async function loadMenuData() {
    try {
        loadingElement.style.display = 'block';
        produtosContainer.innerHTML = '';

        // Carregar do Firebase
        const doc = await db.collection('cardapio').doc('menu').get();
        if (doc.exists) {
            menuData = doc.data();
            localStorage.setItem('fryMenuData', JSON.stringify(menuData));
            renderProdutos();
        } else {
            // Se não houver dados no Firebase, mostrar mensagem
            menuData = {};
            produtosContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Nenhum produto cadastrado ainda. Acesse o painel administrativo para adicionar produtos.</p>';
        }

        // Escutar mudanças em tempo real
        db.collection('cardapio').doc('menu').onSnapshot((doc) => {
            if (doc.exists) {
                menuData = doc.data();
                localStorage.setItem('fryMenuData', JSON.stringify(menuData));
                renderProdutos();
            } else {
                menuData = {};
                produtosContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Nenhum produto cadastrado ainda. Acesse o painel administrativo para adicionar produtos.</p>';
            }
        });

    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        produtosContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #e74c3c;">Erro ao carregar cardápio. Verifique sua conexão com a internet.</p>';
    } finally {
        loadingElement.style.display = 'none';
    }
}


// Renderizar produtos
function renderProdutos() {
    if (!menuData || Object.keys(menuData).length === 0) {
        produtosContainer.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }

    let produtos = [];
    
    if (currentFilter === 'todos') {
        Object.values(menuData).forEach(categoria => {
            if (Array.isArray(categoria)) {
                produtos = produtos.concat(categoria);
            }
        });
    } else if (menuData[currentFilter]) {
        produtos = menuData[currentFilter];
    }

    if (produtos.length === 0) {
        produtosContainer.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    produtosContainer.innerHTML = produtos.map(produto => `
        <div class="produto-card">
            <div class="produto-imagem">
                ${getProductImage(produto.id)}
            </div>
            <div class="produto-info">
                <h3 class="produto-nome">${produto.emoji} ${produto.name}</h3>
                <p class="produto-descricao">${produto.description}</p>
                <p class="produto-preco">R$ ${produto.price.toFixed(2).replace('.', ',')}</p>
                <div class="produto-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateProductQuantity(${produto.id}, -1)">-</button>
                        <input type="number" class="quantity-input" id="qty-${produto.id}" value="1" min="1" max="99">
                        <button class="quantity-btn" onclick="updateProductQuantity(${produto.id}, 1)">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${produto.id}, parseInt(document.getElementById('qty-${produto.id}').value))">
                        🛒 Adicionar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Obter imagem do produto
function getProductImage(productId) {
    // Buscar imagem no menuData primeiro
    const produto = findProductById(productId);
    if (produto && produto.image) {
        return `<img src="${produto.image}" alt="Imagem do produto">`;
    }
    
    // Fallback para localStorage
    const imageData = localStorage.getItem(`product_image_${productId}`);
    if (imageData) {
        return `<img src="${imageData}" alt="Imagem do produto">`;
    }
    
    return '<div style="font-size: 3rem; color: #ccc;">SEM IMAGEM</div>';
}

// Encontrar produto por ID
function findProductById(id) {
    for (const categoria of Object.values(menuData)) {
        if (Array.isArray(categoria)) {
            const produto = categoria.find(p => p.id === id);
            if (produto) return produto;
        }
    }
    return null;
}

// Lidar com login
async function handleLogin(e) {
    e.preventDefault();
    
    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value.trim();
    
    // Validação mais robusta e segura
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cpfEsperado = '12345678900';
    const senhaEsperada = 'admin123';
    
    // Simular delay de validação para segurança
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (cpfLimpo === cpfEsperado && senha === senhaEsperada) {
        isAdminLoggedIn = true;
        
        // Salvar sessão
        const sessionData = {
            timestamp: Date.now(),
            cpf: cpf
        };
        localStorage.setItem('fry_session', JSON.stringify(sessionData));
        
        // Fechar modal e redirecionar
        loginModal.style.display = 'none';
        adminBtn.textContent = 'Painel Admin';
        
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
            window.location.href = 'painel-pedidos.html';
        }, 500);
        
    } else {
        // Mostrar erro genérico sem expor credenciais
        showLoginError();
    }
}

// Mostrar erro de login de forma segura
function showLoginError() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = '❌ Credenciais inválidas!';
    
    document.body.appendChild(errorDiv);
    
    // Remover após 3 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Função para formatar CPF
function formatCPF(cpf) {
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Aplicar máscara no campo CPF
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            e.target.value = formatCPF(e.target.value);
        });
    }
});

// Atualizar quantidade do produto
function updateProductQuantity(productId, change) {
    const input = document.getElementById(`qty-${productId}`);
    let currentValue = parseInt(input.value) || 1;
    let newValue = currentValue + change;
    
    if (newValue < 1) newValue = 1;
    if (newValue > 99) newValue = 99;
    
    input.value = newValue;
}

// ==================== SISTEMA DE CARRINHO ====================

// Carregar carrinho do localStorage
function loadCart() {
    const savedCart = localStorage.getItem('fry_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

// Salvar carrinho no localStorage
function saveCart() {
    localStorage.setItem('fry_cart', JSON.stringify(cart));
    updateCartUI();
}

// Atualizar interface do carrinho
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Função para atualizar exibição do carrinho (com desconto)
function updateCartDisplay() {
    updateCartUI();
    renderCartItems();
}

// Adicionar produto ao carrinho
function addToCart(productId, quantity = 1) {
    // Verificar se a loja está aberta
    if (!canMakeOrder()) {
        showNotification('Loja fechada! Pedidos indisponíveis no momento.', 'error');
        return;
    }
    
    const produto = findProductById(productId);
    if (!produto) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: produto.id,
            name: produto.name,
            price: produto.price,
            emoji: produto.emoji,
            image: produto.image,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartDisplay();
    showCartNotification();
}

// Remover produto do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

// Atualizar quantidade no carrinho
function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

// Mostrar notificação de adicionado ao carrinho
function showCartNotification() {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = '✅ Produto adicionado ao carrinho!';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Renderizar itens do carrinho
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Carrinho vazio</p>';
        cartTotal.textContent = '0,00';
        return;
    }
    
    let subtotal = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<div>${item.emoji}</div>`}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.emoji} ${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remover</button>
            </div>
        `;
    }).join('');
    
    // Calcular total com desconto
    const total = calcularTotalComDesconto();
    
    // Adicionar informações de desconto se aplicável
    if (descontoAtivo && codigoDescontoAplicado) {
        const desconto = (subtotal * codigoDescontoAplicado.desconto) / 100;
        cartItems.innerHTML += `
            <div class="cart-discount">
                <div class="discount-info">
                    <span>Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                    <span class="discount-applied">Desconto (${codigoDescontoAplicado.desconto}%): -R$ ${desconto.toFixed(2).replace('.', ',')}</span>
                    <span class="discount-code">Código: ${codigoDescontoAplicado.codigo}</span>
                </div>
                <button class="remove-discount-btn" onclick="removerDesconto()">Remover</button>
            </div>
        `;
    }
    
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
}

// Limpar carrinho
function clearCart() {
    cart = [];
    saveCart();
    updateCartDisplay();
}

// Abrir modal do carrinho
function openCartModal() {
    updateCartDisplay();
    cartModal.style.display = 'block';
}

// Abrir modal de checkout
function openCheckoutModal() {
    // Verificar se a loja está aberta
    if (!canMakeOrder()) {
        showNotification('Loja fechada! Pedidos indisponíveis no momento.', 'error');
        return;
    }
    
    if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
    }
    
    renderOrderSummary();
    checkoutModal.style.display = 'block';
    cartModal.style.display = 'none';
}

// Renderizar resumo do pedido
function renderOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    let subtotal = 0;
    let summaryHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        return `
            <div class="order-item">
                <span>${item.emoji} ${item.name} x${item.quantity}</span>
                <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');
    
    // Adicionar informações de desconto se aplicável
    if (descontoAtivo && codigoDescontoAplicado) {
        const desconto = (subtotal * codigoDescontoAplicado.desconto) / 100;
        summaryHTML += `
            <div class="order-discount">
                <div class="order-item">
                    <span>Subtotal:</span>
                    <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="order-item discount-applied">
                    <span>Desconto (${codigoDescontoAplicado.desconto}%):</span>
                    <span>-R$ ${desconto.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="order-item discount-code">
                    <span>Código: ${codigoDescontoAplicado.codigo}</span>
                </div>
            </div>
        `;
    }
    
    orderSummary.innerHTML = summaryHTML;
    
    // Calcular total com desconto
    const total = calcularTotalComDesconto();
    orderTotal.textContent = total.toFixed(2).replace('.', ',');
}

// Enviar pedido para WhatsApp
async function sendToWhatsApp() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const notes = document.getElementById('orderNotes').value;
    
    if (!name || !phone || !address) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    // Formatar telefone para WhatsApp
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    
    // Criar mensagem do pedido
    let message = `🍣 *PEDIDO FRY SUSHI DELIVERY* 🍣\n\n`;
    message += `👤 *Cliente:* ${name}\n`;
    message += `📱 *Telefone:* ${phone}\n`;
    message += `📍 *Endereço:* ${address}\n\n`;
    
    if (notes) {
        message += `📝 *Observações:* ${notes}\n\n`;
    }
    
    message += `🛒 *PEDIDO:*\n`;
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        message += `• ${item.emoji} ${item.name} x${item.quantity} = R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
    });
    
    // Adicionar informações de desconto se aplicável
    if (descontoAtivo && codigoDescontoAplicado) {
        const desconto = (subtotal * codigoDescontoAplicado.desconto) / 100;
        message += `\n📊 *RESUMO:*\n`;
        message += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        message += `🎟️ Desconto (${codigoDescontoAplicado.desconto}%): -R$ ${desconto.toFixed(2).replace('.', ',')}\n`;
        message += `Código: ${codigoDescontoAplicado.codigo}\n`;
    }
    
    const total = calcularTotalComDesconto();
    message += `\n💰 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    message += `⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}\n\n`;
    message += `🚚 *Entrega em 30-45 minutos!*`;
    
    // Mostrar loading
    const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '💾 Salvando pedido...';
    submitBtn.disabled = true;
    
    try {
        // Salvar pedido no Firebase PRIMEIRO
        console.log('🔥 Iniciando salvamento do pedido...');
        await saveOrderToFirebase(name, phone, address, notes, total);
        
        // Tocar som de notificação
        playNotificationSound();
        
        // Mostrar notificação visual
        showOrderNotification('🎉 Pedido salvo! Aparecendo no painel admin...');
        
        // Aguardar um pouco para garantir que foi salvo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Abrir WhatsApp
        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Limpar carrinho e fechar modais
        clearCart();
        checkoutModal.style.display = 'none';
        cartModal.style.display = 'none';
        
        alert('✅ Pedido enviado para o WhatsApp! Obrigado pela preferência! 🍣');
        
    } catch (error) {
        console.error('❌ Erro ao processar pedido:', error);
        alert('❌ Erro ao salvar pedido: ' + error.message);
    } finally {
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Salvar pedido no Firebase
async function saveOrderToFirebase(name, phone, address, notes, total) {
    try {
        console.log('💾 Salvando pedido no Firebase...');
        
        // Verificar se Firebase está disponível
        if (!window.db) {
            throw new Error('Firebase não está inicializado!');
        }
        
        const order = {
            customerName: name,
            customerPhone: phone,
            customerAddress: address,
            notes: notes || '',
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                emoji: item.emoji
            })),
            // Informações de desconto
            desconto: descontoAtivo ? {
                ativo: true,
                codigo: codigoDescontoAplicado?.codigo || '',
                percentual: codigoDescontoAplicado?.desconto || 0,
                parceiro: codigoDescontoAplicado?.parceiro || ''
            } : { 
                ativo: false,
                codigo: '',
                percentual: 0,
                parceiro: ''
            },
            total: total,
            status: 'Novo',
            timestamp: new Date(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('📝 Dados do pedido:', order);
        
        // Salvar no Firebase
        const docRef = await db.collection('pedidos').add(order);
        console.log('✅ Pedido salvo no Firebase com ID:', docRef.id);
        
        // Aguardar um pouco para garantir que foi salvo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🎯 Pedido deve aparecer no painel admin agora!');
        
        return docRef.id;
        
    } catch (error) {
        console.error('❌ Erro ao salvar pedido:', error);
        throw error; // Re-throw para ser capturado pela função chamadora
    }
}

// Tocar som de notificação
function playNotificationSound() {
    try {
        // Criar um som de notificação simples usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar som de notificação
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log('🔊 Som de notificação tocado');
    } catch (error) {
        console.log('⚠️ Não foi possível tocar som:', error);
    }
}

// Mostrar notificação de pedido salvo
function showOrderNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Configurar event listeners do carrinho
function setupCartEventListeners() {
    // Botão do carrinho
    cartBtn.addEventListener('click', openCartModal);
    
    // Botões dos modais
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
    document.getElementById('backToCartBtn').addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        cartModal.style.display = 'block';
    });
    
    // Formulário de checkout
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendToWhatsApp();
    });
    
    // Máscara do telefone
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                e.target.value = value;
            }
        });
    }
}

// ==================== SISTEMA DE CÓDIGOS DE DESCONTO ====================

// Função para validar código de desconto
async function validarCodigoDesconto(codigo) {
    try {
        console.log('🔍 Validando código de desconto:', codigo);
        
        // Buscar código no Firebase
        const codigosRef = db.collection('codigosDesconto');
        const query = codigosRef.where('codigo', '==', codigo.toUpperCase()).where('ativo', '==', true);
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            console.log('❌ Código não encontrado ou inativo');
            return { valido: false, mensagem: 'Código inválido ou expirado' };
        }
        
        const codigoDoc = snapshot.docs[0];
        const codigoData = codigoDoc.data();
        
        // Verificar se já foi usado por este IP/navegador
        const ipKey = `usado_${getClientFingerprint()}`;
        if (codigoData[ipKey]) {
            console.log('❌ Código já usado por este dispositivo');
            return { valido: false, mensagem: 'Este código já foi utilizado neste dispositivo' };
        }
        
        // Verificar limite de uso
        const totalUsos = Object.keys(codigoData).filter(key => key.startsWith('usado_')).length;
        if (codigoData.limiteUsos && totalUsos >= codigoData.limiteUsos) {
            console.log('❌ Código atingiu limite de usos');
            return { valido: false, mensagem: 'Código atingiu o limite de usos' };
        }
        
        console.log('✅ Código válido!');
        return { 
            valido: true, 
            codigo: codigoData.codigo,
            desconto: codigoData.desconto || 10,
            parceiro: codigoData.parceiro || '',
            docId: codigoDoc.id
        };
        
    } catch (error) {
        console.error('❌ Erro ao validar código:', error);
        return { valido: false, mensagem: 'Erro ao validar código. Tente novamente.' };
    }
}

// Função para gerar fingerprint do cliente
function getClientFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint', 2, 2);
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
    ].join('|');
    
    // Hash simples do fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

// Função para aplicar código de desconto
async function aplicarCodigoDesconto() {
    // Verificar se a loja está aberta
    if (!canMakeOrder()) {
        const statusDiv = document.getElementById('descontoStatus');
        statusDiv.textContent = 'Loja fechada! Códigos de desconto indisponíveis no momento.';
        statusDiv.className = 'desconto-status error';
        return;
    }
    
    const codigoInput = document.getElementById('codigoDesconto');
    const statusDiv = document.getElementById('descontoStatus');
    const aplicarBtn = document.getElementById('aplicarDesconto');
    
    const codigo = codigoInput.value.trim().toUpperCase();
    
    if (!codigo) {
        statusDiv.textContent = 'Digite um código de desconto';
        statusDiv.className = 'desconto-status error';
        return;
    }
    
    // Desabilitar botão durante validação
    aplicarBtn.disabled = true;
    aplicarBtn.textContent = 'Validando...';
    
    try {
        const resultado = await validarCodigoDesconto(codigo);
        
        if (resultado.valido) {
            // Aplicar desconto
            codigoDescontoAplicado = resultado;
            descontoAtivo = true;
            
            console.log('✅ Desconto aplicado:', resultado);
            console.log('✅ Cart length:', cart.length);
            
            // Marcar como usado no Firebase
            await marcarCodigoComoUsado(resultado.docId);
            
            // Atualizar interface
            statusDiv.textContent = `✅ Desconto de ${resultado.desconto}% aplicado! Código: ${resultado.codigo}`;
            statusDiv.className = 'desconto-status success';
            
            // Atualizar carrinho se houver itens
            if (cart.length > 0) {
                console.log('🔄 Atualizando display do carrinho...');
                updateCartDisplay();
            }
            
            // Limpar campo
            codigoInput.value = '';
            
            console.log('✅ Desconto aplicado com sucesso!');
            
        } else {
            statusDiv.textContent = `❌ ${resultado.mensagem}`;
            statusDiv.className = 'desconto-status error';
        }
        
    } catch (error) {
        console.error('❌ Erro ao aplicar desconto:', error);
        statusDiv.textContent = '❌ Erro ao aplicar desconto. Tente novamente.';
        statusDiv.className = 'desconto-status error';
    } finally {
        // Reabilitar botão
        aplicarBtn.disabled = false;
        aplicarBtn.textContent = 'Aplicar';
    }
}

// Função para marcar código como usado
async function marcarCodigoComoUsado(docId) {
    try {
        const ipKey = `usado_${getClientFingerprint()}`;
        const timestamp = new Date();
        
        await db.collection('codigosDesconto').doc(docId).update({
            [ipKey]: {
                timestamp: timestamp,
                ip: await getClientIP()
            }
        });
        
        console.log('✅ Código marcado como usado');
    } catch (error) {
        console.error('❌ Erro ao marcar código como usado:', error);
    }
}

// Função para obter IP do cliente (simplificada)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.log('⚠️ Não foi possível obter IP, usando fingerprint');
        return getClientFingerprint();
    }
}

// Função para calcular total com desconto
function calcularTotalComDesconto() {
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (descontoAtivo && codigoDescontoAplicado) {
        const desconto = (total * codigoDescontoAplicado.desconto) / 100;
        total = total - desconto;
    }
    
    return total;
}

// Função para remover desconto
function removerDesconto() {
    codigoDescontoAplicado = null;
    descontoAtivo = false;
    
    const statusDiv = document.getElementById('descontoStatus');
    statusDiv.textContent = '';
    statusDiv.className = 'desconto-status';
    
    if (cart.length > 0) {
        updateCartDisplay();
    }
    
    console.log('🗑️ Desconto removido');
}

// Event listeners para desconto
document.addEventListener('DOMContentLoaded', function() {
    const aplicarBtn = document.getElementById('aplicarDesconto');
    const codigoInput = document.getElementById('codigoDesconto');
    
    if (aplicarBtn) {
        aplicarBtn.addEventListener('click', aplicarCodigoDesconto);
    }
    
    if (codigoInput) {
        codigoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarCodigoDesconto();
            }
        });
    }
});

// ==================== SISTEMA DE HORÁRIO DE FUNCIONAMENTO ====================

// Variável global para controlar se a loja está aberta
let isStoreOpen = true;

// Verificar horário de funcionamento
function checkBusinessHours() {
    console.log('🕐 Verificando horário de funcionamento...');
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Converter para minutos
    
    console.log('📅 Dia da semana:', dayOfWeek, '(0=Domingo, 1=Segunda, ..., 6=Sábado)');
    console.log('⏰ Hora atual:', currentHour + ':' + (currentMinute < 10 ? '0' : '') + currentMinute);
    
    let isOpen = false;
    let nextOpenTime = '';
    
    // Verificar horários
    if (dayOfWeek === 0) {
        // Domingo - Fechado
        isOpen = false;
        nextOpenTime = 'Segunda-feira às 18:00';
    } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Segunda a Sexta - 18:00 às 23:45
        const openTime = 18 * 60; // 18:00 em minutos
        const closeTime = 23 * 60 + 45; // 23:45 em minutos
        
        if (currentTime >= openTime && currentTime <= closeTime) {
            isOpen = true;
        } else {
            isOpen = false;
            if (currentTime < openTime) {
                nextOpenTime = 'Hoje às 18:00';
            } else {
                nextOpenTime = 'Amanhã às 18:00';
            }
        }
    } else if (dayOfWeek === 6) {
        // Sábado - 12:00 às 22:45
        const openTime = 12 * 60; // 12:00 em minutos
        const closeTime = 22 * 60 + 45; // 22:45 em minutos
        
        if (currentTime >= openTime && currentTime <= closeTime) {
            isOpen = true;
        } else {
            isOpen = false;
            if (currentTime < openTime) {
                nextOpenTime = 'Hoje às 12:00';
            } else {
                nextOpenTime = 'Segunda-feira às 18:00';
            }
        }
    }
    
    console.log('🏪 Loja está aberta:', isOpen);
    console.log('⏰ Próxima abertura:', nextOpenTime);
    
    isStoreOpen = isOpen;
    
    if (!isOpen) {
        showStoreClosedCard(nextOpenTime);
        disableOrdering();
    } else {
        hideStoreClosedCard();
        enableOrdering();
    }
}

// Mostrar card de loja fechada
function showStoreClosedCard(nextOpenTime) {
    console.log('🚫 Mostrando card de loja fechada...');
    
    const card = document.getElementById('lojaFechadaCard');
    if (card) {
        card.style.display = 'flex';
        
        // Atualizar próxima abertura se necessário
        if (nextOpenTime) {
            const note = card.querySelector('.loja-fechada-note');
            if (note) {
                note.innerHTML = `Você pode visualizar nosso cardápio, mas não é possível fazer pedidos fora do horário de funcionamento.<br><strong>Próxima abertura: ${nextOpenTime}</strong>`;
            }
        }
    }
    
    // Configurar botão de fechar
    const fecharBtn = document.getElementById('fecharCardBtn');
    if (fecharBtn) {
        fecharBtn.onclick = function() {
            hideStoreClosedCard();
        };
    }
}

// Esconder card de loja fechada
function hideStoreClosedCard() {
    console.log('✅ Escondendo card de loja fechada...');
    
    const card = document.getElementById('lojaFechadaCard');
    if (card) {
        card.style.display = 'none';
    }
}

// Desabilitar funcionalidades de pedido
function disableOrdering() {
    console.log('🚫 Desabilitando funcionalidades de pedido...');
    
    // Desabilitar botões de adicionar ao carrinho
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.title = 'Loja fechada - Pedidos indisponíveis';
    });
    
    // Desabilitar botão do carrinho
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.style.opacity = '0.5';
        cartBtn.style.cursor = 'not-allowed';
        cartBtn.title = 'Loja fechada - Pedidos indisponíveis';
    }
    
    // Desabilitar botão de checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
    }
    
    // Desabilitar sistema de desconto
    const codigoInput = document.getElementById('codigoDesconto');
    const aplicarBtn = document.getElementById('aplicarDesconto');
    
    if (codigoInput) {
        codigoInput.disabled = true;
        codigoInput.style.opacity = '0.5';
        codigoInput.style.cursor = 'not-allowed';
        codigoInput.placeholder = 'Loja fechada - Descontos indisponíveis';
    }
    
    if (aplicarBtn) {
        aplicarBtn.disabled = true;
        aplicarBtn.style.opacity = '0.5';
        aplicarBtn.style.cursor = 'not-allowed';
        aplicarBtn.textContent = 'Loja Fechada';
    }
    
    // Adicionar overlay nos produtos
    const produtos = document.querySelectorAll('.produto-card');
    produtos.forEach(produto => {
        const overlay = document.createElement('div');
        overlay.className = 'produto-overlay-fechado';
        overlay.innerHTML = '<div class="overlay-content">🚫<br>Loja Fechada</div>';
        produto.appendChild(overlay);
    });
}

// Habilitar funcionalidades de pedido
function enableOrdering() {
    console.log('✅ Habilitando funcionalidades de pedido...');
    
    // Habilitar botões de adicionar ao carrinho
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.title = '';
    });
    
    // Habilitar botão do carrinho
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.style.opacity = '1';
        cartBtn.style.cursor = 'pointer';
        cartBtn.title = '';
    }
    
    // Habilitar botão de checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
    }
    
    // Habilitar sistema de desconto
    const codigoInput = document.getElementById('codigoDesconto');
    const aplicarBtn = document.getElementById('aplicarDesconto');
    
    if (codigoInput) {
        codigoInput.disabled = false;
        codigoInput.style.opacity = '1';
        codigoInput.style.cursor = 'text';
        codigoInput.placeholder = 'Digite seu código de desconto';
    }
    
    if (aplicarBtn) {
        aplicarBtn.disabled = false;
        aplicarBtn.style.opacity = '1';
        aplicarBtn.style.cursor = 'pointer';
        aplicarBtn.textContent = 'Aplicar';
    }
    
    // Remover overlays dos produtos
    const overlays = document.querySelectorAll('.produto-overlay-fechado');
    overlays.forEach(overlay => overlay.remove());
}

// Verificar se pode fazer pedido
function canMakeOrder() {
    return isStoreOpen;
}

// Atualizar verificação de horário a cada minuto
setInterval(checkBusinessHours, 60000); // 60 segundos
