# 🔥 Configuração do Firebase - FRY Sushi Delivery

## 📋 Passos para Configurar o Firebase

### 1. **Acesse o Firebase Console**
- Vá para: https://console.firebase.google.com
- Faça login com sua conta Google

### 2. **Crie um Novo Projeto**
- Clique em "Adicionar projeto"
- Nome do projeto: `fryfrydelivery` (ou o nome que preferir)
- Ative o Google Analytics (opcional)
- Clique em "Criar projeto"

### 3. **Configure o Firestore Database**
- No menu lateral, clique em "Firestore Database"
- Clique em "Criar banco de dados"
- Escolha "Começar no modo de teste" (por enquanto)
- Escolha uma localização (recomendo: us-central1)

### 4. **Configure as Regras de Segurança**
- Na aba "Regras" do Firestore
- Cole as regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura para todos (cardápio público)
    match /cardapio/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Permitir leitura e escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- Clique em "Publicar"

### 5. **Obtenha as Credenciais do Projeto**
- No menu lateral, clique em "Configurações do projeto" (ícone de engrenagem)
- Na aba "Geral", role para baixo até "Seus aplicativos"
- Clique em "Adicionar aplicativo" e escolha "Web" (ícone </>)
- Dê um nome para o app: `fry-sushi-web`
- Clique em "Registrar app"
- **IMPORTANTE:** As credenciais já estão configuradas no arquivo `firebase-config.js`

### 6. **Teste a Configuração**
- Abra o arquivo `index.html` no navegador
- Verifique se não há erros no console (F12)
- Teste o painel administrativo

## 🔐 Credenciais do Painel Admin

- **CPF:** 123.456.789-00
- **Senha:** admin123

## 📱 Como Testar

### Site Principal:
1. Abra `index.html`
2. Verifique se carrega "Nenhum produto cadastrado ainda"
3. Clique em "Admin" para acessar o painel

### Painel Administrativo:
1. Faça login com as credenciais
2. Adicione um produto de teste
3. Faça upload de uma imagem
4. Salve o produto
5. Volte ao site principal e verifique se o produto aparece

## 🚨 Solução de Problemas

### Erro de Conexão:
- Verifique se as credenciais do Firebase estão corretas
- Verifique se o Firestore está ativado
- Verifique se as regras de segurança estão configuradas

### Erro de Autenticação:
- Verifique se o Firebase Auth está ativado
- Verifique se as regras permitem leitura/escrita

### Imagens não aparecem:
- Verifique se o upload está funcionando
- Verifique se as imagens estão sendo salvas em base64

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Verifique se o Firebase está configurado corretamente
3. Teste com um produto simples primeiro

---

**O site está configurado para funcionar 100% com Firebase!** 🎉
