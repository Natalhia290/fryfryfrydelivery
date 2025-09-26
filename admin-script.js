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
        
        // Carregar códigos de desconto
        console.log('🎟️ Carregando códigos de desconto...');
        loadCodigosDesconto();
        
        // Inicializar sistema de upload de imagens
        console.log('📷 Inicializando sistema de upload...');
        initializeImageUpload();
        
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
            
            // Filtrar pedidos por período (todos os status)
            const todayOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return timestamp >= today;
            });
            
            const weekOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return timestamp >= weekStart;
            });
            
            const monthOrders = allOrders.docs.filter(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || 0);
                return timestamp >= monthStart;
            });
            
            // Calcular totais
            const todayTotal = todayOrders.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            const weekTotal = weekOrders.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            const monthTotal = monthOrders.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            
            console.log('📊 Pedidos totais - Hoje:', todayOrders.length, '| Semana:', weekOrders.length, '| Mês:', monthOrders.length);
            
            // Atualizar interface
            document.getElementById('salesToday').textContent = `R$ ${todayTotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('ordersToday').textContent = `${todayOrders.length} pedidos`;
            document.getElementById('statusToday').textContent = todayOrders.length > 0 ? '✅ Pedidos recebidos' : '⏳ Aguardando pedidos';
            
            document.getElementById('salesWeek').textContent = `R$ ${weekTotal.toFixed(2).replace('.', ',')}`;
            document.getElementById('ordersWeek').textContent = `${weekOrders.length} pedidos`;
            document.getElementById('statusWeek').textContent = weekOrders.length > 0 ? '📈 Crescimento semanal' : '📊 Sem pedidos ainda';
            
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
    }
    
    
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

// ==================== SISTEMA DE CÓDIGOS DE DESCONTO ====================

// Variáveis globais para descontos
let codigosDesconto = [];
let currentCodigoId = null;

// Elementos DOM para descontos
const descontoModal = document.getElementById('descontoModal');
const descontoForm = document.getElementById('descontoModal');
const codigosList = document.getElementById('codigosList');

// Função para carregar códigos de desconto
async function loadCodigosDesconto() {
    try {
        console.log('🎟️ Carregando códigos de desconto...');
        console.log('🎟️ Elemento codigosList:', document.getElementById('codigosList'));
        
        const snapshot = await db.collection('codigosDesconto').get();
        codigosDesconto = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('✅ Códigos carregados:', codigosDesconto.length);
        renderCodigosDesconto();
        updateDescontoStats();
        
    } catch (error) {
        console.error('❌ Erro ao carregar códigos:', error);
        showNotification('Erro ao carregar códigos: ' + error.message, 'error');
    }
}

// Função para renderizar códigos de desconto
function renderCodigosDesconto() {
    console.log('🎟️ Renderizando códigos...', codigosDesconto.length);
    console.log('🎟️ Elemento codigosList:', codigosList);
    
    if (!codigosList) {
        console.error('❌ Elemento codigosList não encontrado!');
        return;
    }
    
    // Forçar visibilidade da seção
    const descontoSection = codigosList.closest('.admin-section');
    if (descontoSection) {
        descontoSection.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            margin-top: 2rem !important;
            background: white !important;
            border-radius: 10px !important;
            padding: 1.5rem !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        `;
        console.log('✅ Seção de descontos forçada a ser visível');
    }
    
    // Forçar visibilidade do elemento codigosList
    codigosList.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        min-height: 100px !important;
        background: #f8f9fa !important;
        border-radius: 8px !important;
        padding: 1rem !important;
        border: 2px solid #e9ecef !important;
    `;
    
    if (codigosDesconto.length === 0) {
        codigosList.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <h3 style="color: #2e7d32; margin: 0 0 1rem 0;">🎟️ Seção de Códigos de Desconto</h3>
                <p style="margin: 0 0 1rem 0; color: #666;">Nenhum código de desconto encontrado</p>
                <button onclick="openDescontoModal()" style="background: #4caf50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    ➕ Criar Primeiro Código
                </button>
            </div>
        `;
        return;
    }
    
    codigosList.innerHTML = codigosDesconto.map(codigo => {
        const totalUsos = Object.keys(codigo).filter(key => key.startsWith('usado_')).length;
        const limiteText = codigo.limiteUsos ? `${totalUsos}/${codigo.limiteUsos}` : `${totalUsos}/∞`;
        
        return `
            <div class="codigo-card">
                <div class="codigo-header">
                    <div class="codigo-info">
                        <span class="codigo-codigo">${codigo.codigo}</span>
                        <span class="codigo-desconto">${codigo.desconto}% OFF</span>
                        <span class="codigo-status ${codigo.ativo ? 'ativo' : 'inativo'}">
                            ${codigo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>
                
                <div class="codigo-details">
                    <div><strong>Parceiro:</strong> ${codigo.parceiroNome} (ID: ${codigo.parceiroId})</div>
                    <div><strong>Usos:</strong> ${limiteText}</div>
                    <div><strong>Criado:</strong> ${codigo.criadoEm ? codigo.criadoEm.toDate().toLocaleDateString('pt-BR') : 'N/A'}</div>
                    <div><strong>Observações:</strong> ${codigo.observacoes || 'Nenhuma'}</div>
                </div>
                
                <div class="codigo-actions">
                    <button class="codigo-btn editar" onclick="editCodigo('${codigo.id}')">✏️ Editar</button>
                    <button class="codigo-btn duplicar" onclick="duplicarCodigo('${codigo.id}')">📋 Duplicar</button>
                    <button class="codigo-btn excluir" onclick="deleteCodigo('${codigo.id}')">🗑️ Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

// Função para atualizar estatísticas de descontos
function updateDescontoStats() {
    const totalCodigos = codigosDesconto.length;
    const codigosAtivos = codigosDesconto.filter(c => c.ativo).length;
    const totalUsos = codigosDesconto.reduce((sum, codigo) => {
        return sum + Object.keys(codigo).filter(key => key.startsWith('usado_')).length;
    }, 0);
    
    const totalCodigosEl = document.getElementById('totalCodigos');
    const codigosAtivosEl = document.getElementById('codigosAtivos');
    const totalUsosEl = document.getElementById('totalUsos');
    
    if (totalCodigosEl) totalCodigosEl.textContent = totalCodigos;
    if (codigosAtivosEl) codigosAtivosEl.textContent = codigosAtivos;
    if (totalUsosEl) totalUsosEl.textContent = totalUsos;
    
    // Forçar visibilidade das estatísticas
    const statsContainer = document.querySelector('.desconto-stats');
    if (statsContainer) {
        statsContainer.style.cssText = `
            display: grid !important;
            visibility: visible !important;
            opacity: 1 !important;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 1rem !important;
            margin-bottom: 2rem !important;
        `;
        console.log('✅ Estatísticas de descontos forçadas a ser visíveis');
    }
}

// Função para abrir modal de desconto
function openDescontoModal(codigoId = null) {
    console.log('🎟️ Abrindo modal de desconto...', codigoId);
    currentCodigoId = codigoId;
    const modal = document.getElementById('descontoModal');
    const title = document.getElementById('descontoModalTitle');
    
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    if (codigoId) {
        title.textContent = 'Editar Código de Desconto';
        const codigo = codigosDesconto.find(c => c.id === codigoId);
        if (codigo) {
            document.getElementById('codigo').value = codigo.codigo;
            document.getElementById('desconto').value = codigo.desconto;
            document.getElementById('parceiroNome').value = codigo.parceiroNome;
            document.getElementById('parceiroId').value = codigo.parceiroId;
            document.getElementById('limiteUsos').value = codigo.limiteUsos || '';
            document.getElementById('ativo').value = codigo.ativo.toString();
            document.getElementById('observacoes').value = codigo.observacoes || '';
        }
    } else {
        title.textContent = 'Novo Código de Desconto';
        document.getElementById('descontoForm').reset();
        document.getElementById('desconto').value = '10';
        document.getElementById('ativo').value = 'true';
    }
    
    modal.style.display = 'block';
    console.log('✅ Modal aberto com sucesso!');
}

// Função para salvar código de desconto
async function saveCodigoDesconto() {
    try {
        console.log('🎟️ Salvando código de desconto...');
        console.log('🎟️ currentCodigoId:', currentCodigoId);
        
        // Verificar se os elementos existem
        const codigoEl = document.getElementById('codigo');
        const descontoEl = document.getElementById('desconto');
        const parceiroNomeEl = document.getElementById('parceiroNome');
        const parceiroIdEl = document.getElementById('parceiroId');
        const limiteUsosEl = document.getElementById('limiteUsos');
        const ativoEl = document.getElementById('ativo');
        const observacoesEl = document.getElementById('observacoes');
        
        console.log('🎟️ Elementos encontrados:', {
            codigo: !!codigoEl,
            desconto: !!descontoEl,
            parceiroNome: !!parceiroNomeEl,
            parceiroId: !!parceiroIdEl,
            limiteUsos: !!limiteUsosEl,
            ativo: !!ativoEl,
            observacoes: !!observacoesEl
        });
        
        if (!codigoEl || !descontoEl || !parceiroNomeEl || !parceiroIdEl) {
            console.error('❌ Elementos do formulário não encontrados!');
            alert('Erro: Elementos do formulário não encontrados!');
            return;
        }
        
        const codigo = codigoEl.value.trim().toUpperCase();
        const desconto = parseInt(descontoEl.value);
        const parceiroNome = parceiroNomeEl.value.trim();
        const parceiroId = parceiroIdEl.value.trim();
        const limiteUsos = limiteUsosEl.value ? parseInt(limiteUsosEl.value) : null;
        const ativo = ativoEl.value === 'true';
        const observacoes = observacoesEl ? observacoesEl.value.trim() : '';
        
        console.log('📝 Dados do código:', { codigo, desconto, parceiroNome, parceiroId, limiteUsos, ativo, observacoes });
        
        if (!codigo || !parceiroNome || !parceiroId) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
        
        // Verificar se código já existe (exceto se estiver editando)
        if (!currentCodigoId) {
            const existingCodigo = codigosDesconto.find(c => c.codigo === codigo);
            if (existingCodigo) {
                alert('Este código já existe!');
                return;
            }
        }
        
        const codigoData = {
            codigo: codigo,
            desconto: desconto,
            parceiroNome: parceiroNome,
            parceiroId: parceiroId,
            limiteUsos: limiteUsos,
            ativo: ativo,
            observacoes: observacoes,
            criadoEm: currentCodigoId ? undefined : new Date(),
            atualizadoEm: new Date()
        };
        
        console.log('💾 Salvando no Firebase...', codigoData);
        
        if (currentCodigoId) {
            // Editar código existente
            await db.collection('codigosDesconto').doc(currentCodigoId).update(codigoData);
            console.log('✅ Código atualizado:', codigo);
        } else {
            // Criar novo código
            const docRef = await db.collection('codigosDesconto').add(codigoData);
            console.log('✅ Código criado:', codigo, 'ID:', docRef.id);
        }
        
        // Fechar modal e recarregar
        document.getElementById('descontoModal').style.display = 'none';
        await loadCodigosDesconto();
        showNotification('Código salvo com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao salvar código:', error);
        console.error('❌ Stack trace:', error.stack);
        showNotification('Erro ao salvar código: ' + error.message, 'error');
    }
}

// Função para editar código
function editCodigo(codigoId) {
    openDescontoModal(codigoId);
}

// Função para duplicar código
function duplicarCodigo(codigoId) {
    const codigo = codigosDesconto.find(c => c.id === codigoId);
    if (codigo) {
        openDescontoModal();
        document.getElementById('codigo').value = codigo.codigo + '_COPY';
        document.getElementById('desconto').value = codigo.desconto;
        document.getElementById('parceiroNome').value = codigo.parceiroNome;
        document.getElementById('parceiroId').value = codigo.parceiroId + '_COPY';
        document.getElementById('limiteUsos').value = codigo.limiteUsos || '';
        document.getElementById('ativo').value = 'true';
        document.getElementById('observacoes').value = `Cópia de ${codigo.codigo} - ${codigo.observacoes || ''}`;
    }
}

// Função para excluir código
async function deleteCodigo(codigoId) {
    if (!confirm('⚠️ Tem certeza que deseja excluir este código?\n\nEsta ação não pode ser desfeita!')) {
        return;
    }
    
    try {
        await db.collection('codigosDesconto').doc(codigoId).delete();
        console.log('✅ Código excluído:', codigoId);
        
        await loadCodigosDesconto();
        showNotification('Código excluído com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao excluir código:', error);
        showNotification('Erro ao excluir código: ' + error.message, 'error');
    }
}


// Event listeners para descontos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎟️ Inicializando event listeners de desconto...');
    
    // Adicionar event listener para o formulário de desconto
    const form = document.getElementById('descontoForm');
    console.log('🎟️ Formulário encontrado:', form);
    
    if (form) {
        console.log('🎟️ Adicionando event listener ao formulário de desconto');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('🎟️ Formulário submetido!');
            saveCodigoDesconto();
        });
        
        // Também adicionar listener no botão de salvar
        const saveBtn = form.querySelector('button[type="submit"]');
        if (saveBtn) {
            console.log('🎟️ Botão de salvar encontrado:', saveBtn);
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎟️ Botão de salvar clicado!');
                saveCodigoDesconto();
            });
        }
        
        // Adicionar listener também por ID
        const saveBtnById = document.querySelector('.save-btn');
        if (saveBtnById) {
            console.log('🎟️ Botão de salvar por ID encontrado:', saveBtnById);
            saveBtnById.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🎟️ Botão de salvar por ID clicado!');
                saveCodigoDesconto();
            });
        }
    } else {
        console.error('❌ Formulário de desconto não encontrado!');
    }
    
    // Adicionar event listener para o botão cancelar
    const cancelDescontoBtn = document.getElementById('cancelDescontoBtn');
    if (cancelDescontoBtn) {
        console.log('🎟️ Botão cancelar encontrado');
        cancelDescontoBtn.addEventListener('click', function() {
            console.log('🎟️ Botão cancelar clicado');
            document.getElementById('descontoModal').style.display = 'none';
        });
    }
    
    // Adicionar event listener para o X de fechar
    const closeBtn = document.querySelector('#descontoModal .close');
    if (closeBtn) {
        console.log('🎟️ Botão X encontrado');
        closeBtn.addEventListener('click', function() {
            console.log('🎟️ Botão X clicado');
            document.getElementById('descontoModal').style.display = 'none';
        });
    }
    
    // Fechar modal clicando fora dele
    const modal = document.getElementById('descontoModal');
    if (modal) {
        console.log('🎟️ Modal encontrado para click outside');
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('🎟️ Click fora do modal');
                modal.style.display = 'none';
            }
        });
    }
    
    // Converter código para maiúsculas automaticamente
    const codigoInput = document.getElementById('codigo');
    if (codigoInput) {
        codigoInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    }
});

// Função de teste para descontos
window.testDescontos = function() {
    console.log('🧪 Testando seção de descontos...');
    
    // Verificar se os elementos existem
    const codigosList = document.getElementById('codigosList');
    const totalCodigos = document.getElementById('totalCodigos');
    const codigosAtivos = document.getElementById('codigosAtivos');
    const totalUsos = document.getElementById('totalUsos');
    
    console.log('🧪 Elementos encontrados:');
    console.log('- codigosList:', codigosList);
    console.log('- totalCodigos:', totalCodigos);
    console.log('- codigosAtivos:', codigosAtivos);
    console.log('- totalUsos:', totalUsos);
    
    // Forçar exibição da seção inteira
    const descontoSection = document.querySelector('.admin-section:has(#codigosList)');
    if (descontoSection) {
        descontoSection.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            margin-top: 2rem !important;
            background: white !important;
            border-radius: 10px !important;
            padding: 1.5rem !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            border: 3px solid #4caf50 !important;
        `;
        console.log('✅ Seção de descontos forçada a ser visível');
    }
    
    // Forçar exibição das estatísticas
    const statsContainer = document.querySelector('.desconto-stats');
    if (statsContainer) {
        statsContainer.style.cssText = `
            display: grid !important;
            visibility: visible !important;
            opacity: 1 !important;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 1rem !important;
            margin-bottom: 2rem !important;
            background: #f0f8ff !important;
            padding: 1rem !important;
            border-radius: 8px !important;
            border: 2px solid #007bff !important;
        `;
        console.log('✅ Estatísticas forçadas a ser visíveis');
    }
    
    // Forçar exibição da lista
    if (codigosList) {
        codigosList.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-height: 100px !important;
            background: #e8f5e8 !important;
            border-radius: 8px !important;
            padding: 1rem !important;
            border: 2px solid #4caf50 !important;
        `;
        
        codigosList.innerHTML = `
            <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; border: 2px solid #4caf50;">
                <h3 style="color: #2e7d32; margin: 0 0 1rem 0;">✅ Seção de Descontos Funcionando!</h3>
                <p style="margin: 0 0 1rem 0;">A seção de códigos de desconto está carregada e funcionando.</p>
                <button onclick="loadCodigosDesconto()" style="background: #4caf50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    🔄 Recarregar Códigos
                </button>
            </div>
        `;
    }
    
    // Atualizar estatísticas de teste
    if (totalCodigos) totalCodigos.textContent = '0';
    if (codigosAtivos) codigosAtivos.textContent = '0';
    if (totalUsos) totalUsos.textContent = '0';
    
    // Tentar carregar códigos
    loadCodigosDesconto();
};

// Função para testar salvamento de código
function testSaveCodigo() {
    console.log('🧪 Testando salvamento de código...');
    
    // Preencher campos de teste
    document.getElementById('codigo').value = 'TESTE' + Date.now().toString().slice(-4);
    document.getElementById('desconto').value = '15';
    document.getElementById('parceiroNome').value = 'Teste Manual';
    document.getElementById('parceiroId').value = 'MANUAL' + Date.now().toString().slice(-3);
    document.getElementById('limiteUsos').value = '50';
    document.getElementById('ativo').value = 'true';
    document.getElementById('observacoes').value = 'Teste manual do salvamento';
    
    console.log('🧪 Campos preenchidos, chamando saveCodigoDesconto...');
    
    // Chamar função de salvar
    saveCodigoDesconto();
}

// Função para testar salvamento direto no Firebase
async function testFirebaseDesconto() {
    try {
        console.log('🧪 Testando salvamento direto no Firebase...');
        
        const codigoData = {
            codigo: 'DIRETO' + Date.now().toString().slice(-4),
            desconto: 20,
            parceiroNome: 'Teste Direto',
            parceiroId: 'DIR' + Date.now().toString().slice(-3),
            limiteUsos: 25,
            ativo: true,
            observacoes: 'Teste direto no Firebase',
            criadoEm: new Date(),
            atualizadoEm: new Date()
        };
        
        console.log('💾 Salvando diretamente no Firebase...', codigoData);
        
        const docRef = await db.collection('codigosDesconto').add(codigoData);
        console.log('✅ Código salvo diretamente:', codigoData.codigo, 'ID:', docRef.id);
        
        // Recarregar códigos
        await loadCodigosDesconto();
        showNotification('Código salvo diretamente com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro no teste direto:', error);
        showNotification('Erro no teste direto: ' + error.message, 'error');
    }
}

// Função para criar código de teste
async function criarCodigoTeste() {
    try {
        console.log('🧪 Criando código de teste...');
        
        // Primeiro testar a conexão
        console.log('🔍 Testando conexão Firebase...');
        console.log('🔍 DB object:', db);
        console.log('🔍 Firebase config:', firebase.app().options);
        
        const codigoData = {
            codigo: 'TESTE' + Date.now().toString().slice(-4),
            desconto: 10,
            parceiroNome: 'Teste Automático',
            parceiroId: 'TEST' + Date.now().toString().slice(-3),
            limiteUsos: 100,
            ativo: true,
            observacoes: 'Código criado automaticamente para teste',
            criadoEm: new Date(),
            atualizadoEm: new Date()
        };
        
        console.log('💾 Salvando código de teste no Firebase...', codigoData);
        
        // Tentar salvar
        const docRef = await db.collection('codigosDesconto').add(codigoData);
        console.log('✅ Código de teste criado:', codigoData.codigo, 'ID:', docRef.id);
        
        // Recarregar códigos
        await loadCodigosDesconto();
        showNotification('Código de teste criado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao criar código de teste:', error);
        console.error('❌ Detalhes do erro:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        // Tentar diagnóstico
        if (error.code === 'permission-denied') {
            showNotification('Erro: Permissão negada. Verifique as regras do Firestore.', 'error');
        } else if (error.code === 'unavailable') {
            showNotification('Erro: Firebase indisponível. Verifique sua conexão.', 'error');
        } else if (error.message.includes('API key')) {
            showNotification('Erro: Chave da API inválida. Verifique a configuração do Firebase.', 'error');
        } else {
            showNotification('Erro ao criar código de teste: ' + error.message, 'error');
        }
    }
}

// Listener global para botões de salvar (apenas códigos de desconto)
document.addEventListener('click', function(e) {
    // Verificar se é especificamente um botão de salvar código de desconto
    if (e.target.classList.contains('save-btn') && e.target.closest('#descontoModal')) {
        e.preventDefault();
        console.log('🎟️ Botão de salvar código clicado globalmente!');
        saveCodigoDesconto();
    }
    
    // Verificar se é um botão que contém "Salvar Código" especificamente
    if (e.target.textContent.includes('Salvar Código') && e.target.closest('#descontoModal')) {
        e.preventDefault();
        console.log('🎟️ Botão "Salvar Código" clicado globalmente!');
        saveCodigoDesconto();
    }
});

// ==================== SISTEMA DE UPLOAD DE IMAGENS ====================

// Inicializar funcionalidades de upload de imagem
function initializeImageUpload() {
    console.log('📷 Inicializando sistema de upload de imagens...');
    
    const imageUploadArea = document.getElementById('imageUploadArea');
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!imageUploadArea || !productImageInput || !imagePreview) {
        console.log('⚠️ Elementos de upload não encontrados, aguardando...');
        setTimeout(initializeImageUpload, 1000);
        return;
    }
    
    // Clique na área de upload
    imageUploadArea.addEventListener('click', () => {
        productImageInput.click();
    });
    
    // Drag and drop
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
    });
    
    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('dragover');
    });
    
    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    // Mudança no input de arquivo
    productImageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
    
    console.log('✅ Sistema de upload de imagens inicializado!');
}

// Processar arquivo de imagem
function handleImageFile(file) {
    console.log('📷 Processando arquivo de imagem:', file.name);
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem!', 'error');
        return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('A imagem deve ter no máximo 5MB!', 'error');
        return;
    }
    
    // Converter para Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        displayImagePreview(e.target.result, file.name, file.size);
    };
    reader.readAsDataURL(file);
}

// Exibir preview da imagem
function displayImagePreview(imageData, fileName, fileSize) {
    const imagePreview = document.getElementById('imagePreview');
    const imageUploadArea = document.getElementById('imageUploadArea');
    
    // Esconder área de upload
    imageUploadArea.style.display = 'none';
    
    // Mostrar preview
    imagePreview.innerHTML = `
        <img src="${imageData}" alt="Preview da imagem">
        <div class="image-info">
            📷 ${fileName} (${formatFileSize(fileSize)})
        </div>
        <div class="image-actions">
            <button type="button" class="btn-change-image" onclick="changeImage()">
                🔄 Trocar Imagem
            </button>
            <button type="button" class="btn-remove-image" onclick="removeImage()">
                🗑️ Remover
            </button>
        </div>
    `;
    
    console.log('✅ Preview da imagem exibido!');
}

// Trocar imagem
function changeImage() {
    const productImageInput = document.getElementById('productImage');
    productImageInput.click();
}

// Remover imagem
function removeImage() {
    const imagePreview = document.getElementById('imagePreview');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const productImageInput = document.getElementById('productImage');
    
    // Limpar input
    productImageInput.value = '';
    
    // Mostrar área de upload
    imageUploadArea.style.display = 'block';
    
    // Mostrar mensagem de nenhuma imagem
    imagePreview.innerHTML = '<div class="no-image">Nenhuma imagem selecionada</div>';
    
    console.log('🗑️ Imagem removida!');
}

// Formatar tamanho do arquivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Obter dados da imagem para salvar
function getImageData() {
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (productImageInput.files.length > 0) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(productImageInput.files[0]);
        });
    } else if (imagePreview.querySelector('img')) {
        // Se há uma imagem no preview mas não no input (caso de edição)
        return imagePreview.querySelector('img').src;
    }
    
    return null;
}

// Funções globais
window.openDescontoModal = openDescontoModal;
window.editCodigo = editCodigo;
window.duplicarCodigo = duplicarCodigo;
window.changeImage = changeImage;
window.removeImage = removeImage;
window.deleteCodigo = deleteCodigo;
window.loadCodigosDesconto = loadCodigosDesconto;
window.criarCodigoTeste = criarCodigoTeste;
window.testSaveCodigo = testSaveCodigo;
window.testFirebaseDesconto = testFirebaseDesconto;
window.getImageData = getImageData;
window.handleProductSubmit = handleProductSubmit;
window.openProductModal = openProductModal;
window.handleImageUpload = handleImageUpload;
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
        
        // Carregar códigos de desconto quando trocar para a aba
        console.log('🎟️ Carregando códigos de desconto...');
        loadCodigosDesconto();
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
            const imageUploadArea = document.getElementById('imageUploadArea');
            
            if (produto.image) {
                // Esconder área de upload e mostrar preview
                imageUploadArea.style.display = 'none';
                imagePreview.innerHTML = `
                    <img src="${produto.image}" alt="Imagem atual">
                    <div class="image-info">
                        📷 Imagem atual do produto
                    </div>
                    <div class="image-actions">
                        <button type="button" class="btn-change-image" onclick="changeImage()">
                            🔄 Trocar Imagem
                        </button>
                        <button type="button" class="btn-remove-image" onclick="removeImage()">
                            🗑️ Remover
                        </button>
                    </div>
                `;
            } else {
                const imageData = localStorage.getItem(`product_image_${productId}`);
                if (imageData) {
                    // Esconder área de upload e mostrar preview
                    imageUploadArea.style.display = 'none';
                    imagePreview.innerHTML = `
                        <img src="${imageData}" alt="Imagem atual">
                        <div class="image-info">
                            📷 Imagem atual do produto
                        </div>
                        <div class="image-actions">
                            <button type="button" class="btn-change-image" onclick="changeImage()">
                                🔄 Trocar Imagem
                            </button>
                            <button type="button" class="btn-remove-image" onclick="removeImage()">
                                🗑️ Remover
                            </button>
                        </div>
                    `;
                } else {
                    // Mostrar área de upload e mensagem de nenhuma imagem
                    imageUploadArea.style.display = 'block';
                    imagePreview.innerHTML = '<div class="no-image">Nenhuma imagem selecionada</div>';
                }
            }
        }
    } else {
        modalTitle.textContent = 'Adicionar Produto';
        productForm.reset();
        
        // Resetar interface de imagem
        const imagePreview = document.getElementById('imagePreview');
        const imageUploadArea = document.getElementById('imageUploadArea');
        
        imageUploadArea.style.display = 'block';
        imagePreview.innerHTML = '<div class="no-image">Nenhuma imagem selecionada</div>';
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
    
    // Validar campos obrigatórios
    if (!name || !category || !price || !description) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Desabilitar botão e mostrar loading
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';
    
    try {
        // Obter dados da imagem
        console.log('📷 Obtendo dados da imagem...');
        const imageData = await getImageData();
        console.log('📷 Dados da imagem obtidos:', imageData ? 'Sim' : 'Não');
        
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
        if (imageData) {
            console.log('📷 Salvando imagem no produto...');
            try {
                // Salvar imagem no produto
                const produto = findProductById(productId);
                if (produto) {
                    produto.image = imageData;
                    console.log('✅ Imagem salva no produto!');
                }
                // Também salvar no localStorage como backup
                localStorage.setItem(`product_image_${productId}`, imageData);
                console.log('✅ Imagem salva no localStorage!');
            } catch (error) {
                console.error('❌ Erro ao salvar imagem:', error);
                showNotification('Erro ao processar imagem: ' + error.message, 'error');
            }
        } else {
            console.log('📷 Nenhuma imagem selecionada');
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

// Função para atualizar vendas quando novos pedidos chegarem
function updateSalesOnNewOrder() {
    console.log('🔄 Atualizando vendas devido a novo pedido...');
    calculateSales();
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
    
    // Atualizar vendas quando pedidos são renderizados
    updateSalesOnNewOrder();
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
            console.log('🗑️ Pedido removido da lista local:', orderId);
        } else {
            console.log('⚠️ Pedido não encontrado na lista local:', orderId);
        }
        
        // Recalcular vendas se o pedido era entregue
        if (orderData && orderData.status === 'Entregue') {
            console.log('💰 Pedido entregue excluído! Recalculando vendas...');
            calculateSales();
        }
        
        // Re-renderizar pedidos
        console.log('🔄 Re-renderizando pedidos após exclusão...');
        console.log('📊 Total de pedidos na lista local:', orders.length);
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
        
        // Som de notificação de novo pedido - 30 segundos
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
        
        // Volume constante por 30 segundos
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 29.9);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 30);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 30); // 30 segundos
        
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
