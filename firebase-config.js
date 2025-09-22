// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA3E52_IoX2tk2CiuxroAUiW8bWJ3SKXNA",
    authDomain: "fryfrydelivery-d1ae1.firebaseapp.com",
    projectId: "fryfrydelivery-d1ae1",
    storageBucket: "fryfrydelivery-d1ae1.firebasestorage.app",
    messagingSenderId: "748640197913",
    appId: "1:748640197913:web:b5e866dc9d4a1c008bf988"
};

// Verificar se Firebase já foi inicializado
if (!firebase.apps.length) {
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado');
} else {
    console.log('🔥 Firebase já inicializado');
}

// Inicializar serviços
const db = firebase.firestore();
// Removido auth para evitar erro de API key
// const auth = firebase.auth();

// Configurações do Firestore
const settings = {
    timestampsInSnapshots: true
};
db.settings(settings);

// Verificar conexão
db.enableNetwork().then(() => {
    console.log('✅ Firestore conectado');
}).catch((error) => {
    console.error('❌ Erro de conexão Firestore:', error);
});

// Exportar para uso global
window.db = db;
// window.auth = auth; // Removido
window.firebase = firebase;

// Função de teste de conexão
window.testFirebaseConnection = async function() {
    try {
        console.log('🧪 Testando conexão Firebase...');
        
        // Testar leitura
        const testSnapshot = await db.collection('pedidos').limit(1).get();
        console.log('✅ Leitura OK - Pedidos encontrados:', testSnapshot.size);
        
        // Testar escrita
        const testDoc = await db.collection('test').add({
            test: true,
            timestamp: new Date()
        });
        console.log('✅ Escrita OK - Documento criado:', testDoc.id);
        
        // Limpar teste
        await db.collection('test').doc(testDoc.id).delete();
        console.log('✅ Limpeza OK');
        
        return true;
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return false;
    }
};
