# 🔥 CORRIGIR REGRAS DO FIRESTORE - URGENTE!

## ❌ **PROBLEMA ATUAL:**
- Erro: "Missing or insufficient permissions"
- As regras do Firestore estão bloqueando a escrita
- O painel admin não consegue salvar produtos

## ✅ **SOLUÇÃO:**

### 1. **Acesse o Firebase Console:**
- Vá para: https://console.firebase.google.com
- Selecione seu projeto: `fryfrydelivery-d1ae1`

### 2. **Vá para Firestore Database:**
- No menu lateral, clique em "Firestore Database"
- Clique na aba "Regras"

### 3. **Cole as regras corretas:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todos (cardápio público)
    match /cardapio/{document} {
      allow read, write: if true;
    }
    
    // Permitir leitura e escrita para todos os outros documentos
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. **Publique as regras:**
- Clique no botão "Publicar"
- Aguarde a confirmação

### 5. **Teste novamente:**
- Volte ao painel admin
- Tente adicionar um produto
- Deve funcionar agora!

## 🚨 **IMPORTANTE:**
- Essas regras permitem acesso total (apenas para desenvolvimento)
- Em produção, você deve restringir o acesso
- Por enquanto, use assim para testar

## 🔍 **Verificar se funcionou:**
1. Abra o painel admin
2. Tente adicionar um produto
3. Se não der erro, está funcionando!
4. Verifique se o produto aparece no site principal

---

**Depois de corrigir as regras, o salvamento deve funcionar perfeitamente!** 🎉
