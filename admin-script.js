// Variáveis globais do admin
let menuData = {};
let currentFilter = 'todos';
let editingProductId = null;
let productToDelete = null;
let orders = [];
let currentOrderFilter = 'todos';

// Elementos DOM
const cardapioTab = document.getElementById('cardapioTab');
const pedidosTab = document.getElementById('pedidosTab');
const menuTabBtn = document.getElementById('menuTab');
const pedidosTabBtn = document.getElementById('pedidosTab');
const logoutBtn = document.getElementById('logoutBtn');
const addProductBtn = document.getElementById('addProductBtn');
const adminProdutos = document.getElementById('adminProdutos');
const adminFiltros = document.querySelectorAll('.admin-filtro-btn');
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.querySelectorAll('.close');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando painel administrativo...');
    
    // Verificar autenticação
    checkAuth();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar dados do menu
    loadMenuData();
    
    // Aguardar um pouco antes de carregar pedidos para garantir que Firebase está pronto
    setTimeout(() => {
        console.log('📋 Carregando pedidos...');
        loadOrders();
        
        // Forçar renderização após 2 segundos
        setTimeout(() => {
            console.log('🔄 Forçando renderização inicial...');
            if (orders.length > 0) {
                renderOrders();
            }
        }, 2000);
    }, 1000);
    
    // Adicionar função global para debug
    window.debugOrders = function() {
        console.log('🔍 Debug - Pedidos atuais:', orders);
        console.log('🔍 Debug - Firebase config:', firebase.apps[0]?.options);
        console.log('🔍 Debug - DB:', db);
    };
    
    // Função de teste para forçar renderização
    window.testRender = function() {
        console.log('🧪 Testando renderização...');
        const pedidosList = document.getElementById('pedidosList');
        if (pedidosList) {
            pedidosList.innerHTML = '<div style="background: red; color: white; padding: 20px; margin: 10px;">TESTE DE RENDERIZAÇÃO FUNCIONANDO!</div>';
            console.log('✅ Teste de renderização aplicado');
        } else {
            console.error('❌ Elemento pedidosList não encontrado');
        }
    };
    
    // Função para forçar renderização de pedidos
    window.forceRenderOrders = function() {
        console.log('🔄 Forçando renderização de pedidos...');
        renderOrders();
    };
});

// Verificar autenticação
function checkAuth() {
    const session = localStorage.getItem('fry_session');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    
    const sessionData = JSON.parse(session);
    if (Date.now() - sessionData.timestamp > 30 * 60 * 1000) { // 30 minutos
        localStorage.removeItem('fry_session');
        window.location.href = 'index.html';
        return;
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Tabs
    menuTabBtn.addEventListener('click', () => switchTab('cardapio'));
    pedidosTabBtn.addEventListener('click', () => switchTab('pedidos'));
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Adicionar produto
    addProductBtn.addEventListener('click', () => openProductModal());
    
    // Filtros
    adminFiltros.forEach(btn => {
        btn.addEventListener('click', () => {
            adminFiltros.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.categoria;
            renderAdminProdutos();
        });
    });
    
    // Modal
    closeModal.forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    // Formulário
    productForm.addEventListener('submit', handleProductSubmit);
    cancelBtn.addEventListener('click', () => productModal.style.display = 'none');
    
    // Exclusão
    cancelDeleteBtn.addEventListener('click', () => deleteModal.style.display = 'none');
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    // Upload de imagem
    document.getElementById('productImage').addEventListener('change', handleImageUpload);
    
    // Configurar filtros de pedidos
    setupOrderFilters();
}

// Trocar tab
function switchTab(tab) {
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'cardapio') {
        menuTabBtn.classList.add('active');
        cardapioTab.classList.add('active');
    } else {
        pedidosTabBtn.classList.add('active');
        pedidosTab.classList.add('active');
    }
}

// Logout
function handleLogout() {
    localStorage.removeItem('fry_session');
    window.location.href = 'index.html';
}

// Carregar dados do cardápio
async function loadMenuData() {
    try {
        // Carregar do Firebase
        const doc = await db.collection('cardapio').doc('menu').get();
        if (doc.exists) {
            menuData = doc.data();
            localStorage.setItem('fryMenuData', JSON.stringify(menuData));
            renderAdminProdutos();
        } else {
            // Se não houver dados no Firebase, inicializar com estrutura vazia
            menuData = {
                bigHots: [],
                sushiDog: [],
                combos: [],
                bebidas: [],
                adicionais: []
            };
            renderAdminProdutos();
        }
        
        // Escutar mudanças em tempo real
        db.collection('cardapio').doc('menu').onSnapshot((doc) => {
            if (doc.exists) {
                menuData = doc.data();
                localStorage.setItem('fryMenuData', JSON.stringify(menuData));
                renderAdminProdutos();
            } else {
                // Se não houver dados no Firebase, inicializar com estrutura vazia
                menuData = {
                    bigHots: [],
                    sushiDog: [],
                    combos: [],
                    bebidas: [],
                    adicionais: []
                };
                renderAdminProdutos();
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        alert('Erro ao carregar dados do cardápio. Verifique sua conexão com a internet.');
    }
}

// Renderizar produtos no admin
function renderAdminProdutos() {
    if (!menuData || Object.keys(menuData).length === 0) {
        adminProdutos.innerHTML = '<p>Nenhum produto encontrado.</p>';
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
        adminProdutos.innerHTML = '<p>Nenhum produto encontrado nesta categoria.</p>';
        return;
    }
    
    adminProdutos.innerHTML = produtos.map(produto => `
        <div class="admin-produto-card">
            <div class="admin-produto-imagem">
                ${getProductImage(produto.id)}
            </div>
            <div class="admin-produto-info">
                <h3 class="admin-produto-nome">${produto.emoji} ${produto.name}</h3>
                <p class="admin-produto-descricao">${produto.description}</p>
                <p class="admin-produto-preco">R$ ${produto.price.toFixed(2).replace('.', ',')}</p>
                <div class="admin-produto-actions">
                    <button class="btn-edit" onclick="editProduct(${produto.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteProduct(${produto.id})">Excluir</button>
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
    
    return '<div style="font-size: 2rem; color: #ccc;">SEM IMAGEM</div>';
}

// Abrir modal de produto
function openProductModal(productId = null) {
    editingProductId = productId;
    
    if (productId) {
        modalTitle.textContent = 'Editar Produto';
        const produto = findProductById(productId);
        if (produto) {
            document.getElementById('productName').value = produto.name;
            document.getElementById('productCategory').value = produto.category;
            document.getElementById('productPrice').value = produto.price;
            document.getElementById('productEmoji').value = produto.emoji;
            document.getElementById('productDescription').value = produto.description;
            
            // Mostrar preview da imagem
            const imagePreview = document.getElementById('imagePreview');
            if (produto.image) {
                imagePreview.innerHTML = `<img src="${produto.image}" alt="Imagem atual">`;
            } else {
                const imageData = localStorage.getItem(`product_image_${productId}`);
                if (imageData) {
                    imagePreview.innerHTML = `<img src="${imageData}" alt="Imagem atual">`;
                } else {
                    imagePreview.innerHTML = '<p>Nenhuma imagem</p>';
                }
            }
        }
    } else {
        modalTitle.textContent = 'Adicionar Produto';
        productForm.reset();
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    productModal.style.display = 'block';
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

// Editar produto
function editProduct(productId) {
    openProductModal(productId);
}

// Excluir produto
function deleteProduct(productId) {
    productToDelete = productId;
    deleteModal.style.display = 'block';
}

// Confirmar exclusão
async function handleDeleteConfirm() {
    if (!productToDelete) return;
    
    try {
        // Remover do menuData
        for (const [categoria, produtos] of Object.entries(menuData)) {
            if (Array.isArray(produtos)) {
                const index = produtos.findIndex(p => p.id === productToDelete);
                if (index !== -1) {
                    produtos.splice(index, 1);
                    break;
                }
            }
        }
        
        // Salvar no Firebase
        await db.collection('cardapio').doc('menu').set(menuData);
        
        // Salvar no localStorage
        localStorage.setItem('fryMenuData', JSON.stringify(menuData));
        
        // Remover imagem do localStorage
        localStorage.removeItem(`product_image_${productToDelete}`);
        
        // Atualizar interface
        renderAdminProdutos();
        
        // Fechar modal
        deleteModal.style.display = 'none';
        productToDelete = null;
        
        alert('Produto excluído com sucesso!');
        
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
    }
}

// Lidar com upload de imagem
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview da imagem">`;
        };
        reader.readAsDataURL(file);
    }
}

// Lidar com envio do formulário
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const emoji = document.getElementById('productEmoji').value || '🍣';
    const description = document.getElementById('productDescription').value;
    const imageFile = document.getElementById('productImage').files[0];
    
    // Validar campos obrigatórios
    if (!name || !category || !price || !description) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    // Desabilitar botão e mostrar loading
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';
    
    try {
        let productId;
        
        if (editingProductId) {
            // Editar produto existente
            productId = editingProductId;
            const produto = findProductById(productId);
            if (produto) {
                produto.name = name;
                produto.category = category;
                produto.price = price;
                produto.emoji = emoji;
                produto.description = description;
            }
        } else {
            // Adicionar novo produto
            productId = generateProductId();
            const newProduct = {
                id: productId,
                name: name,
                category: category,
                price: price,
                emoji: emoji,
                description: description
            };
            
            if (!menuData[category]) {
                menuData[category] = [];
            }
            menuData[category].push(newProduct);
        }
        
        // Processar imagem se houver
        if (imageFile) {
            await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        // Salvar imagem no produto
                        const produto = findProductById(productId);
                        if (produto) {
                            produto.image = e.target.result;
                        }
                        // Também salvar no localStorage como backup
                        localStorage.setItem(`product_image_${productId}`, e.target.result);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
        }
        
        // Salvar no Firebase
        await db.collection('cardapio').doc('menu').set(menuData);
        
        // Salvar no localStorage
        localStorage.setItem('fryMenuData', JSON.stringify(menuData));
        
        // Atualizar interface
        renderAdminProdutos();
        
        // Fechar modal
        productModal.style.display = 'none';
        productForm.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        alert(editingProductId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        
        let errorMessage = 'Erro ao salvar produto.';
        
        if (error.code === 'permission-denied') {
            errorMessage = 'Erro de permissão. Verifique as regras do Firestore.';
        } else if (error.code === 'unavailable') {
            errorMessage = 'Serviço indisponível. Verifique sua conexão com a internet.';
        } else if (error.code === 'unauthenticated') {
            errorMessage = 'Não autenticado. Faça login novamente.';
        } else if (error.message) {
            errorMessage = 'Erro: ' + error.message;
        }
        
        alert(errorMessage);
    } finally {
        // Reabilitar botão
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

// Gerar ID único para produto
function generateProductId() {
    let maxId = 0;
    for (const categoria of Object.values(menuData)) {
        if (Array.isArray(categoria)) {
            for (const produto of categoria) {
                if (produto.id > maxId) {
                    maxId = produto.id;
                }
            }
        }
    }
    return maxId + 1;
}

// ==================== SISTEMA DE PEDIDOS ====================

// Carregar pedidos do Firebase
async function loadOrders() {
    try {
        console.log('🔥 Iniciando carregamento de pedidos...');
        
        // Configurar listener em tempo real
        const unsubscribe = db.collection('pedidos').onSnapshot((snapshot) => {
            console.log('📋 Snapshot recebido:', snapshot.size, 'pedidos');
            
            const previousCount = orders.length;
            orders = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                orders.push({
                    id: doc.id,
                    ...data
                });
                console.log('✅ Pedido carregado:', doc.id, data.customerName);
            });
            
            // Ordenar por timestamp se disponível
            orders.sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
                return timeB - timeA; // Mais recente primeiro
            });
            
            // Se há novos pedidos, tocar som e mostrar notificação
            if (orders.length > previousCount && previousCount > 0) {
                playNewOrderSound();
                showNewOrderNotification(orders.length - previousCount);
            }
            
            console.log('🎯 Renderizando', orders.length, 'pedidos');
            
            // Forçar renderização imediatamente
            setTimeout(() => {
                renderOrders();
                updateOrderStats();
            }, 100);
            
        }, (error) => {
            console.error('❌ Erro no listener de pedidos:', error);
            document.getElementById('pedidosList').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <h3>❌ Erro ao carregar pedidos</h3>
                    <p>Erro: ${error.message}</p>
                    <p>Código: ${error.code}</p>
                    <button onclick="loadOrders()" style="padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🔄 Tentar Novamente
                    </button>
                </div>
            `;
        });
        
        // Salvar função de unsubscribe para limpeza posterior
        window.unsubscribeOrders = unsubscribe;
        
    } catch (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        document.getElementById('pedidosList').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                <h3>❌ Erro de Conexão</h3>
                <p>Erro: ${error.message}</p>
                <button onclick="loadOrders()" style="padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Renderizar pedidos
function renderOrders() {
    console.log('🎨 Renderizando pedidos:', orders.length);
    const pedidosList = document.getElementById('pedidosList');
    
    if (!pedidosList) {
        console.error('❌ Elemento pedidosList não encontrado!');
        return;
    }
    
    console.log('📋 Elemento pedidosList encontrado:', pedidosList);
    
    // Verificar se a aba de pedidos está ativa
    const pedidosTab = document.getElementById('pedidosTab');
    if (pedidosTab && !pedidosTab.classList.contains('active')) {
        console.log('⚠️ Aba de pedidos não está ativa, mas renderizando mesmo assim');
    }
    
    if (orders.length === 0) {
        pedidosList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🍣</div>
                <h3>Nenhum pedido encontrado</h3>
                <p>Faça um pedido no site principal para testar!</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">
                    Os pedidos aparecerão aqui automaticamente quando forem feitos.
                </p>
            </div>
        `;
        return;
    }
    
    let filteredOrders = orders;
    if (currentOrderFilter !== 'todos') {
        filteredOrders = orders.filter(order => order.status === currentOrderFilter);
    }
    
    console.log('🔍 Pedidos filtrados:', filteredOrders.length);
    
    if (filteredOrders.length === 0) {
        pedidosList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>Nenhum pedido com status "${currentOrderFilter}"</h3>
                <p>Mude o filtro para ver outros pedidos.</p>
            </div>
        `;
        return;
    }
    
    console.log('🔄 Criando HTML para', filteredOrders.length, 'pedidos');
    
    const htmlContent = filteredOrders.map(order => {
        const isNew = order.status === 'Novo';
        const statusClass = order.status.toLowerCase().replace(' ', '-');
        const timestamp = order.timestamp?.toDate ? order.timestamp.toDate() : new Date(order.timestamp || 0);
        
        return `
            <div class="pedido-card ${isNew ? 'novo' : ''}">
                <div class="pedido-header">
                    <div class="pedido-id">#${order.id}</div>
                    <div class="pedido-status ${statusClass}">${order.status}</div>
                </div>
                
                <div class="pedido-cliente">
                    <h4>👤 ${order.customerName}</h4>
                </div>
                
                <div class="pedido-info">
                    <div class="pedido-info-item">
                        <span>📱</span>
                        <span>${order.customerPhone}</span>
                    </div>
                    <div class="pedido-info-item">
                        <span>📍</span>
                        <span>${order.customerAddress}</span>
                    </div>
                </div>
                
                ${order.notes ? `
                    <div class="pedido-info-item">
                        <span>📝</span>
                        <span><strong>Observações:</strong> ${order.notes}</span>
                    </div>
                ` : ''}
                
                <div class="pedido-itens">
                    <h5>🛒 Itens do Pedido:</h5>
                    ${order.items.map(item => `
                        <div class="pedido-item">
                            <span>${item.emoji} ${item.name} x${item.quantity}</span>
                            <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="pedido-total">
                    Total: R$ ${order.total.toFixed(2).replace('.', ',')}
                </div>
                
                <div class="pedido-actions">
                    ${getStatusButtons(order.status, order.id)}
                </div>
                
                <div class="pedido-timestamp">
                    Pedido feito em: ${timestamp.toLocaleString('pt-BR')}
                </div>
            </div>
        `;
    }).join('');
    
    console.log('📝 HTML criado, inserindo no DOM...');
    pedidosList.innerHTML = htmlContent;
    
    // Forçar visibilidade com estilos inline
    pedidosList.style.display = 'block';
    pedidosList.style.visibility = 'visible';
    pedidosList.style.opacity = '1';
    pedidosList.style.minHeight = '200px';
    
    console.log('✅ HTML inserido no DOM com sucesso!');
    console.log('🔍 Conteúdo atual do pedidosList:', pedidosList.innerHTML.substring(0, 200) + '...');
}

// Obter botões de status baseado no status atual
function getStatusButtons(currentStatus, orderId) {
    const buttons = [];
    
    if (currentStatus === 'Novo') {
        buttons.push(`<button class="status-btn confirmar" onclick="updateOrderStatus('${orderId}', 'Confirmado')">✅ Confirmar</button>`);
    }
    
    if (currentStatus === 'Confirmado') {
        buttons.push(`<button class="status-btn preparar" onclick="updateOrderStatus('${orderId}', 'Preparando')">👨‍🍳 Preparar</button>`);
    }
    
    if (currentStatus === 'Preparando') {
        buttons.push(`<button class="status-btn entregar" onclick="updateOrderStatus('${orderId}', 'Saiu para entrega')">🚚 Saiu para entrega</button>`);
    }
    
    if (currentStatus === 'Saiu para entrega') {
        buttons.push(`<button class="status-btn entregue" onclick="updateOrderStatus('${orderId}', 'Entregue')">✅ Entregue</button>`);
    }
    
    return buttons.join('');
}

// Atualizar status do pedido
async function updateOrderStatus(orderId, newStatus) {
    try {
        await db.collection('pedidos').doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mostrar notificação
        showNotification(`Status atualizado para: ${newStatus}`, 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showNotification('Erro ao atualizar status', 'error');
    }
}

// Atualizar estatísticas dos pedidos
function updateOrderStats() {
    const totalPedidos = document.getElementById('totalPedidos');
    const novosPedidos = document.getElementById('novosPedidos');
    
    if (totalPedidos) totalPedidos.textContent = orders.length;
    if (novosPedidos) novosPedidos.textContent = orders.filter(order => order.status === 'Novo').length;
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
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

// Configurar filtros de pedidos
function setupOrderFilters() {
    const pedidoFiltros = document.querySelectorAll('.pedido-filtro-btn');
    
    pedidoFiltros.forEach(btn => {
        btn.addEventListener('click', () => {
            pedidoFiltros.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentOrderFilter = btn.dataset.status;
            renderOrders();
        });
    });
}

// Tocar som de novo pedido
function playNewOrderSound() {
    try {
        // Criar um som de notificação mais elaborado para novos pedidos
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Som de notificação de novo pedido (mais alto e chamativo)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        
        console.log('🔊 Som de novo pedido tocado');
    } catch (error) {
        console.log('⚠️ Não foi possível tocar som:', error);
    }
}

// Mostrar notificação de novo pedido
function showNewOrderNotification(count) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        z-index: 10000;
        animation: slideIn 0.5s ease;
        max-width: 350px;
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        border: 2px solid #ff5252;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 2rem;">🍣</div>
            <div>
                <h3 style="margin: 0; font-size: 1.2rem;">🎉 NOVO PEDIDO!</h3>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem;">
                    ${count === 1 ? '1 pedido recebido' : `${count} pedidos recebidos`}
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
