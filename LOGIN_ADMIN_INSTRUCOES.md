# 🔐 INSTRUÇÕES DE LOGIN - PAINEL ADMINISTRATIVO

## ✅ **CREDENCIAIS CORRETAS:**

### **CPF:** `123.456.789-00`
### **Senha:** `admin123`

## 🚀 **COMO FAZER LOGIN:**

### **Passo 1: Acessar o Site**
1. **Abra** o arquivo `index.html` no navegador
2. **Clique** no botão "Painel Admin" (canto superior direito)

### **Passo 2: Inserir Credenciais**
1. **CPF:** Digite exatamente `123.456.789-00`
2. **Senha:** Digite exatamente `admin123`
3. **Clique** em "Entrar"

### **Passo 3: Acesso ao Painel**
1. **Aguarde** o redirecionamento automático
2. **Você será** direcionado para `painel-pedidos.html`
3. **Clique** na aba "Pedidos" para ver os pedidos

## 🔧 **CORREÇÕES IMPLEMENTADAS:**

### **1. Validação Melhorada:**
- ✅ Remove espaços em branco automaticamente
- ✅ Remove formatação do CPF para comparação
- ✅ Logs detalhados para debug
- ✅ Validação mais robusta

### **2. Experiência do Usuário:**
- ✅ Aguarda 500ms antes de redirecionar
- ✅ Fecha modal automaticamente
- ✅ Atualiza botão para "Painel Admin"
- ✅ Mensagens de erro claras

## 🐛 **SE AINDA NÃO FUNCIONAR:**

### **Verificar Console (F12):**
1. **Abra** o console do navegador
2. **Tente** fazer login
3. **Verifique** as mensagens de log:
   - `🔐 Tentativa de login:` - mostra o que foi digitado
   - `🔍 Validação:` - mostra a comparação
   - `✅ Login bem-sucedido!` - confirma sucesso
   - `❌ Login falhou!` - indica falha

### **Possíveis Problemas:**
1. **Espaços extras** no CPF ou senha
2. **Formatação incorreta** do CPF
3. **JavaScript desabilitado**
4. **Cache do navegador**

### **Solução:**
1. **Limpe** o cache do navegador (Ctrl+F5)
2. **Digite** as credenciais exatamente como mostrado
3. **Verifique** se o JavaScript está habilitado

## 📋 **TESTE RÁPIDO:**

### **No Console (F12):**
```javascript
// Testar validação diretamente
const cpf = '123.456.789-00';
const senha = 'admin123';
const cpfLimpo = cpf.replace(/\D/g, '');
console.log('CPF limpo:', cpfLimpo);
console.log('Senha:', senha);
console.log('CPF correto:', cpfLimpo === '12345678900');
console.log('Senha correta:', senha === 'admin123');
```

---

**As credenciais estão corretas e o sistema foi melhorado!** 🔐✅
