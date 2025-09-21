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
        
        // Carregar vendas
        console.log('💰 Carregando vendas...');
        calculateSales();
        
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
    
    // Função para criar um pedido de teste
    window.createTestOrder = async function() {
        try {
            console.log('🧪 Criando pedido de teste...');
            const testOrder = {
                customerName: 'Cliente Teste',
                customerPhone: '(62) 99999-9999',
                customerAddress: 'Rua Teste, 123 - Goiânia/GO',
                notes: 'Pedido de teste para verificar funcionamento',
                items: [
                    {
                        name: 'Big Hot Teste',
                        emoji: '🍣',
                        price: 15.90,
                        quantity: 2
                    }
                ],
                total: 31.80,
                status: 'Novo',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('pedidos').add(testOrder);
            console.log('✅ Pedido de teste criado com ID:', docRef.id);
            alert('Pedido de teste criado! Verifique se aparece na lista.');
            
        } catch (error) {
            console.error('❌ Erro ao criar pedido de teste:', error);
            alert('Erro ao criar pedido de teste: ' + error.message);
        }
    };
    
    // Função para debug visual
    window.debugVisual = function() {
        const pedidosList = document.getElementById('pedidosList');
        if (pedidosList) {
            console.log('🔍 Debug Visual - pedidosList:');
            console.log('- display:', pedidosList.style.display);
            console.log('- visibility:', pedidosList.style.visibility);
            console.log('- opacity:', pedidosList.style.opacity);
            console.log('- height:', pedidosList.offsetHeight);
            console.log('- width:', pedidosList.offsetWidth);
            console.log('- innerHTML length:', pedidosList.innerHTML.length);
            
            const cards = pedidosList.querySelectorAll('.pedido-card');
            console.log('🔍 Cards encontrados:', cards.length);
            cards.forEach((card, index) => {
                console.log(`Card ${index}:`, {
                    display: card.style.display,
                    visibility: card.style.visibility,
                    opacity: card.style.opacity,
                    height: card.offsetHeight,
                    width: card.offsetWidth
                });
            });
        }
    };
    
    // Função de emergência para forçar exibição
    window.forceShowOrders = function() {
        console.log('🚨 FORÇANDO EXIBIÇÃO DOS PEDIDOS...');
        
        const pedidosList = document.getElementById('pedidosList');
        const pedidosListCardapio = document.getElementById('pedidosListCardapio');
        
        if (!pedidosList) {
            console.error('❌ pedidosList não encontrado!');
            return;
        }
        
        // Criar HTML simples e direto
        const simpleHTML = orders.map(order => `
            <div style="
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                display: block;
                visibility: visible;
                opacity: 1;
                position: relative;
                z-index: 1000;
                width: 100%;
                min-height: 100px;
            ">
                <h3>Pedido #${order.id}</h3>
                <p><strong>Cliente:</strong> ${order.customerName}</p>
                <p><strong>Telefone:</strong> ${order.customerPhone}</p>
                <p><strong>Endereço:</strong> ${order.customerAddress}</p>
                <p><strong>Total:</strong> R$ ${order.total.toFixed(2).replace('.', ',')}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            </div>
        `).join('');
        
        // Aplicar em ambas as seções
        const sections = [pedidosList, pedidosListCardapio].filter(Boolean);
        sections.forEach((section, index) => {
            section.innerHTML = simpleHTML;
            section.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: #f8f9fa !important;
                padding: 1rem !important;
                min-height: 200px !important;
                position: relative !important;
                z-index: 999 !important;
            `;
            console.log(`✅ HTML simples inserido na seção ${index + 1}!`);
        });
        
        console.log('📊 Total de pedidos:', orders.length);
    };
    
    // Função para testar as abas
    window.testTabs = function() {
        console.log('🧪 TESTANDO ABAS...');
        
        const menuTab = document.getElementById('menuTab');
        const pedidosTab = document.getElementById('pedidosTab');
        const cardapioContent = document.getElementById('cardapioTab');
        const pedidosContent = document.getElementById('pedidosTab');
        
        console.log('📋 Elementos encontrados:');
        console.log('- menuTab:', menuTab);
        console.log('- pedidosTab:', pedidosTab);
        console.log('- cardapioContent:', cardapioContent);
        console.log('- pedidosContent:', pedidosContent);
        
        console.log('🔄 Testando clique na aba Pedidos...');
        if (pedidosTab) {
            pedidosTab.click();
        }
        
        setTimeout(() => {
            console.log('📊 Estado após clique:');
            console.log('- pedidosContent.classList:', pedidosContent?.classList.toString());
            console.log('- pedidosContent.style.display:', pedidosContent?.style.display);
            console.log('- pedidosContent.offsetHeight:', pedidosContent?.offsetHeight);
        }, 100);
    };
    
    // Função para calcular vendas
    window.calculateSales = async function() {
        try {
            console.log('💰 Calculando vendas...');
            
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // Buscar TODOS os pedidos e filtrar no JavaScript (evita erro de índice)
            console.log('📋 Buscando todos os pedidos...');
            const allOrders = await db.collection('pedidos').get();
            
            console.log('📊 Total de pedidos encontrados:', allOrders.size);
            
            // Filtrar pedidos entregues por período
            const todayOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return data.status === 'Entregue' && timestamp >= today;
            });
            
            const weekOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return data.status === 'Entregue' && timestamp >= weekStart;
            });
            
            const monthOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return data.status === 'Entregue' && timestamp >= monthStart;
            });
            
            // Calcular totais
            const todayTotal = todayOrders.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            const weekTotal = weekOrders.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            const monthTotal = monthOrders.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            
            console.log('📊 Pedidos entregues - Hoje:', todayOrders.length, '| Semana:', weekOrders.length, '| Mês:', monthOrders.length);
            
            // Atualizar interface
            document.getElementById('salesToday').textContent = `R$ ${todayTotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('ordersToday').textContent = `${todayOrders.length} pedidos`;
            document.getElementById('statusToday').textContent = todayOrders.length > 0 ? '✅ Vendas confirmadas' : '⏳ Aguardando vendas';
            
            document.getElementById('salesWeek').textContent = `R$ ${weekTotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('ordersWeek').textContent = `${weekOrders.length} pedidos`;
            document.getElementById('statusWeek').textContent = weekOrders.length > 0 ? '📈 Crescimento semanal' : '📊 Sem vendas ainda';
            
            document.getElementById('salesMonth').textContent = `R$ ${monthTotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('ordersMonth').textContent = `${monthOrders.length} pedidos`;
            document.getElementById('statusMonth').textContent = monthOrders.length > 0 ? '🎯 Meta mensal' : '📅 Início do mês';
            
            // Atualizar datas
            document.getElementById('todayDate').textContent = today.toLocaleDateString('pt-BR');
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            document.getElementById('weekDate').textContent = `${weekStart.toLocaleDateString('pt-BR')} - ${weekEnd.toLocaleDateString('pt-BR')}`;
            
            document.getElementById('monthDate').textContent = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            
            console.log('✅ Vendas calculadas com sucesso!');
            console.log('💰 Valores - Hoje:', todayTotal, '| Semana:', weekTotal, '| Mês:', monthTotal);
            
        } catch (error) {
            console.error('❌ Erro ao calcular vendas:', error);
            showNotification('Erro ao calcular vendas: ' + error.message, 'error');
        }
    };
    
    // Função para atualizar vendas
    window.refreshSales = function() {
        calculateSales();
        showNotification('Vendas atualizadas!', 'success');
    };
    
    // Função para limpar pedidos do dia
    window.clearTodayOrders = async function() {
        if (!confirm('⚠️ Tem certeza que deseja excluir TODOS os pedidos de hoje?\n\nEsta ação não pode ser desfeita!')) {
            return;
        }
        
        try {
            console.log('🗑️ Limpando pedidos do dia...');
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Buscar pedidos de hoje
            const allOrders = await db.collection('pedidos').get();
            const todayOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return timestamp >= today && timestamp < tomorrow;
            });
            
            if (todayOrders.length === 0) {
                alert('✅ Nenhum pedido encontrado para hoje!');
                return;
            }
            
            // Deletar pedidos em lote
            const batch = db.batch();
            todayOrders.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            console.log(`✅ ${todayOrders.length} pedidos do dia removidos!`);
            alert(`✅ ${todayOrders.length} pedidos de hoje foram removidos com sucesso!`);
            
            // Recarregar pedidos e vendas
            loadOrders();
            calculateSales();
            
        } catch (error) {
            console.error('❌ Erro ao limpar pedidos:', error);
            alert('❌ Erro ao limpar pedidos: ' + error.message);
        }
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
    console.log('🔄 Trocando para tab:', tab);
    
    // Atualizar botões
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'cardapio') {
        console.log('📋 Ativando aba Cardápio');
        menuTabBtn.classList.add('active');
        cardapioTab.classList.add('active');
        cardapioTab.style.display = 'block';
        
        // Carregar vendas quando trocar para a aba
        console.log('💰 Carregando vendas...');
        calculateSales();
    } else if (tab === 'pedidos') {
        console.log('📋 Ativando aba Pedidos');
        pedidosTabBtn.classList.add('active');
        pedidosTab.classList.add('active');
        pedidosTab.style.display = 'block';
        
        // Carregar pedidos quando trocar para a aba
        console.log('🔄 Carregando pedidos...');
        loadOrders();
    }
    
    console.log('✅ Tab trocada com sucesso');
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
        console.log('🔥 Firebase config:', firebase.apps[0]?.options);
        console.log('🔥 DB object:', db);
        
        if (!db) {
            throw new Error('Firebase não inicializado');
        }
        
        // Primeiro, tentar fazer uma consulta simples para verificar se há dados
        console.log('🔍 Testando consulta simples...');
        const testQuery = await db.collection('pedidos').limit(1).get();
        console.log('📊 Teste de consulta:', testQuery.size, 'documentos encontrados');
        
        // Configurar listener em tempo real
        const unsubscribe = db.collection('pedidos').onSnapshot((snapshot) => {
            console.log('📋 Snapshot recebido:', snapshot.size, 'pedidos');
            console.log('📋 Snapshot empty:', snapshot.empty);
            console.log('📋 Snapshot docs:', snapshot.docs.length);
            
            const previousCount = orders.length;
            orders = [];
            
            if (snapshot.empty) {
                console.log('⚠️ Nenhum pedido encontrado no Firebase');
                renderOrders(); // Renderizar estado vazio
                updateOrderStats();
                return;
            }
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log('📄 Documento:', doc.id, data);
                orders.push({
                    id: doc.id,
                    ...data
                });
                console.log('✅ Pedido carregado:', doc.id, data.customerName || 'Sem nome');
            });
            
            // Ordenar por timestamp se disponível
            orders.sort((a, b) => {
                const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
                const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
                return timeB - timeA; // Mais recente primeiro
            });
            
            console.log('📊 Total de pedidos carregados:', orders.length);
            
            // Se há novos pedidos, tocar som e mostrar notificação
            if (orders.length > previousCount && previousCount > 0) {
                console.log('🎉 Novos pedidos detectados!');
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
            const pedidosList = document.getElementById('pedidosList');
            if (pedidosList) {
                pedidosList.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                        <h3>❌ Erro ao carregar pedidos</h3>
                        <p>Erro: ${error.message}</p>
                        <p>Código: ${error.code}</p>
                        <button onclick="loadOrders()" style="padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            🔄 Tentar Novamente
                        </button>
                    </div>
                `;
            }
        });
        
        // Salvar função de unsubscribe para limpeza posterior
        window.unsubscribeOrders = unsubscribe;
        
    } catch (error) {
        console.error('❌ Erro ao carregar pedidos:', error);
        const pedidosList = document.getElementById('pedidosList');
        if (pedidosList) {
            pedidosList.innerHTML = `
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
}

// Renderizar pedidos
function renderOrders() {
    console.log('🎨 Renderizando pedidos:', orders.length);
    const pedidosList = document.getElementById('pedidosList');
    const pedidosListCardapio = document.getElementById('pedidosListCardapio');
    
    if (!pedidosList) {
        console.error('❌ Elemento pedidosList não encontrado!');
        return;
    }
    
    console.log('📋 Elemento pedidosList encontrado:', pedidosList);
    
    // Verificar se a aba de pedidos está ativa
    const pedidosTab = document.getElementById('pedidosTab');
    if (pedidosTab && !pedidosTab.classList.contains('active')) {
        console.log('⚠️ Aba de pedidos não está ativa, mas renderizando mesmo assim');
        // Forçar a aba a ficar ativa
        pedidosTab.classList.add('active');
        pedidosTab.style.display = 'block';
    }
    
    if (orders.length === 0) {
        const emptyState = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🍣</div>
                <h3>Nenhum pedido encontrado</h3>
                <p>Faça um pedido no site principal para testar!</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">
                    Os pedidos aparecerão aqui automaticamente quando forem feitos.
                </p>
            </div>
        `;
        pedidosList.innerHTML = emptyState;
        if (pedidosListCardapio) {
            pedidosListCardapio.innerHTML = emptyState;
        }
        return;
    }
    
    let filteredOrders = orders;
    if (currentOrderFilter !== 'todos') {
        filteredOrders = orders.filter(order => order.status === currentOrderFilter);
    }
    
    console.log('🔍 Pedidos filtrados:', filteredOrders.length);
    
    if (filteredOrders.length === 0) {
        const noFilterState = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>Nenhum pedido com status "${currentOrderFilter}"</h3>
                <p>Mude o filtro para ver outros pedidos.</p>
            </div>
        `;
        pedidosList.innerHTML = noFilterState;
        if (pedidosListCardapio) {
            pedidosListCardapio.innerHTML = noFilterState;
        }
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
    
    // Função para renderizar em uma seção específica
    function renderInSection(sectionElement, sectionName) {
        if (!sectionElement) return;
        
        // Limpar completamente o conteúdo primeiro
        sectionElement.innerHTML = '';
        
        // Inserir o HTML
        sectionElement.innerHTML = htmlContent;
        
        // Forçar visibilidade com estilos inline mais agressivos
        sectionElement.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-height: 200px !important;
            position: relative !important;
            z-index: 999 !important;
            background: #f8f9fa !important;
            padding: 1rem !important;
            border-radius: 8px !important;
        `;
        
        console.log(`✅ HTML inserido na seção ${sectionName}!`);
    }
    
    // Renderizar em ambas as seções
    renderInSection(pedidosList, 'Pedidos');
    renderInSection(pedidosListCardapio, 'Cardápio');
    
    // Aguardar um pouco e forçar visibilidade de todos os cards
    setTimeout(() => {
        const allSections = [pedidosList, pedidosListCardapio].filter(Boolean);
        
        allSections.forEach((section, sectionIndex) => {
            const pedidoCards = section.querySelectorAll('.pedido-card');
            console.log(`🔍 Cards encontrados na seção ${sectionIndex + 1}:`, pedidoCards.length);
            
            pedidoCards.forEach((card, index) => {
                card.style.cssText = `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: relative !important;
                    z-index: 1000 !important;
                    background: white !important;
                    border: 2px solid #e9ecef !important;
                    border-radius: 12px !important;
                    padding: 1.5rem !important;
                    margin-bottom: 1rem !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                    width: 100% !important;
                    min-height: 100px !important;
                `;
                console.log(`Card ${index} estilizado na seção ${sectionIndex + 1}`);
            });
            
            // Forçar reflow
            section.offsetHeight;
        });
        
    }, 100);
    
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
    
    // Botão de excluir sempre disponível
    buttons.push(`<button class="status-btn excluir" onclick="deleteOrder('${orderId}')">🗑️ Excluir</button>`);
    
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
        
        // Se o pedido foi marcado como entregue, recalcular vendas
        if (newStatus === 'Entregue') {
            console.log('💰 Pedido entregue! Recalculando vendas...');
            calculateSales();
        }
        
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showNotification('Erro ao atualizar status', 'error');
    }
}

// Excluir pedido
async function deleteOrder(orderId) {
    try {
        // Confirmar exclusão
        if (!confirm('⚠️ Tem certeza que deseja excluir este pedido?\n\nEsta ação não pode ser desfeita!')) {
            return;
        }
        
        console.log('🗑️ Excluindo pedido:', orderId);
        
        // Buscar dados do pedido antes de excluir
        const orderDoc = await db.collection('pedidos').doc(orderId).get();
        const orderData = orderDoc.data();
        
        // Excluir do Firebase
        await db.collection('pedidos').doc(orderId).delete();
        
        // Remover da lista local
        const orderIndex = orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            orders.splice(orderIndex, 1);
        }
        
        // Recalcular vendas se o pedido era entregue
        if (orderData && orderData.status === 'Entregue') {
            console.log('💰 Pedido entregue excluído! Recalculando vendas...');
            calculateSales();
        }
        
        // Re-renderizar pedidos
        renderOrders();
        updateOrderStats();
        
        // Mostrar notificação
        showNotification('Pedido excluído com sucesso!', 'success');
        
        console.log('✅ Pedido excluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao excluir pedido:', error);
        showNotification('Erro ao excluir pedido: ' + error.message, 'error');
    }
}

// Função global para excluir pedido
window.deleteOrder = deleteOrder;

// Atualizar estatísticas dos pedidos
function updateOrderStats() {
    const totalPedidos = document.getElementById('totalPedidos');
    const novosPedidos = document.getElementById('novosPedidos');
    const totalPedidosCardapio = document.getElementById('totalPedidosCardapio');
    const novosPedidosCardapio = document.getElementById('novosPedidosCardapio');
    
    const totalCount = orders.length;
    const novosCount = orders.filter(order => order.status === 'Novo').length;
    
    if (totalPedidos) totalPedidos.textContent = totalCount;
    if (novosPedidos) novosPedidos.textContent = novosCount;
    if (totalPedidosCardapio) totalPedidosCardapio.textContent = totalCount;
    if (novosPedidosCardapio) novosPedidosCardapio.textContent = novosCount;
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
