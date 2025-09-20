# 🍣 Fry Sushi Delivery

Site completo de delivery de sushi com painel administrativo integrado ao Firebase.

## 🚀 Funcionalidades

### Site Principal
- **Landing page** responsiva com hero section
- **Cardápio dinâmico** carregado do Firebase em tempo real
- **Sistema de filtros** por categoria (Big Hots, Mini Sushi Dog, Combos, etc.)
- **Autenticação** para acesso ao painel admin
- **PWA** (Progressive Web App) com Service Worker

### Painel Administrativo
- **Gerenciamento completo** de produtos (CRUD)
- **Upload de imagens** salvos em base64 no Firebase
- **Sincronização** em tempo real com o site principal
- **Sistema de login** protegido com sessão de 30 minutos
- **Interface responsiva** para mobile e desktop

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Firebase Firestore
- **Autenticação:** Firebase Auth
- **Hospedagem:** Vercel
- **PWA:** Service Worker + Manifest

## 📁 Estrutura do Projeto

```
fryfrydelivery/
├── index.html              # Página principal
├── painel-pedidos.html     # Painel administrativo
├── style.css               # Estilos principais
├── admin-style.css         # Estilos do painel admin
├── script.js               # Lógica principal
├── admin-script.js         # Lógica do painel admin
├── firebase-config.js      # Configuração Firebase
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── firestore.rules         # Regras do Firestore
├── vercel.json             # Configuração Vercel
└── README.md               # Este arquivo
```

## 🔧 Configuração

### 1. Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Firestore Database
3. Configure as regras de segurança (veja `firestore.rules`)
4. Atualize as credenciais em `firebase-config.js`

### 2. Deploy
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente se necessário
3. Faça o deploy automático

## 🔐 Credenciais de Acesso

**Painel Administrativo:**
- **CPF:** 123.456.789-00
- **Senha:** admin123

## 📊 Estrutura de Dados

### Firebase Collection: `cardapio/menu`
```json
{
  "bigHots": [
    {
      "id": 1,
      "name": "Big Hot de Tilápia",
      "description": "Crocante e gostoso!",
      "price": 49.90,
      "emoji": "🍣",
      "category": "bigHots",
      "image": "data:image/jpeg;base64,..."
    }
  ],
  "miniSushiDog": [...],
  "combos": [...],
  "bebidas": [...],
  "adicionais": [...]
}
```

### LocalStorage
- `fryMenuData` - Cache dos dados do cardápio
- `fry_session` - Sessão de login do admin
- `product_image_${id}` - Backup das imagens

## 🎯 Como Usar

### Site Principal
1. Acesse `index.html`
2. Navegue pelo cardápio usando os filtros
3. Clique em "Admin" para acessar o painel

### Painel Administrativo
1. Faça login com as credenciais
2. Gerencie produtos na aba "Cardápio"
3. Adicione/edite/exclua produtos
4. Faça upload de imagens
5. As mudanças são sincronizadas automaticamente

## 🔄 Sincronização

- **Firebase → Site:** Tempo real via onSnapshot
- **Admin → Firebase:** Salvamento imediato
- **LocalStorage:** Cache local para performance

## 📱 PWA

O site é uma Progressive Web App com:
- Service Worker para cache offline
- Manifest para instalação
- Ícones responsivos
- Funciona offline (dados em cache)

## 🚀 Deploy

1. **Vercel:** Conecte o repositório e faça deploy automático
2. **Firebase Hosting:** Use `firebase deploy`
3. **GitHub Pages:** Ative nas configurações do repositório

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador para erros
2. Configuração do Firebase
3. Regras do Firestore
4. Conectividade com a internet

---

**Desenvolvido com ❤️ para Fry Sushi Delivery**
