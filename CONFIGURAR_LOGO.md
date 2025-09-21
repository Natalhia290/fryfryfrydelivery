# 🖼️ Como Configurar a Logo do Site

## 📁 Estrutura de Pastas

Crie a seguinte estrutura na raiz do seu projeto:

```
fryfrydelivery/
├── public/
│   └── imagens/
│       └── logo.png  ← Sua logo aqui
├── index.html
├── style.css
└── ...outros arquivos
```

## 🎯 Passos para Configurar

### 1. Criar as Pastas
```bash
mkdir public
mkdir public/imagens
```

### 2. Colocar a Logo
- Coloque sua logo na pasta `public/imagens/`
- Nome do arquivo: `logo.png`
- Formato recomendado: PNG com fundo transparente
- Tamanho recomendado: 200x60 pixels (ou proporção similar)

### 3. Verificar o Caminho
A logo será acessível em:
- **URL local:** `http://localhost:3000/public/imagens/logo.png`
- **URL produção:** `https://fryfryfrydelivery.vercel.app/public/imagens/logo.png`

## 🔧 Meta Tags Configuradas

As meta tags já estão configuradas no `index.html`:

```html
<!-- Open Graph / Facebook -->
<meta property="og:image" content="https://fryfryfrydelivery.vercel.app/public/imagens/logo.png">

<!-- Twitter -->
<meta property="twitter:image" content="https://fryfryfrydelivery.vercel.app/public/imagens/logo.png">
```

## 📱 Onde a Logo Aparecerá

- ✅ **WhatsApp** - Quando compartilhar o link
- ✅ **Facebook** - Quando postar o link
- ✅ **Twitter** - Quando tuitar o link
- ✅ **LinkedIn** - Quando compartilhar o link
- ✅ **Telegram** - Quando enviar o link
- ✅ **Outros apps** - Que suportam Open Graph

## 🚀 Deploy

Após colocar a logo na pasta `public/imagens/`:

1. **Commit e push:**
```bash
git add .
git commit -m "Adicionar logo do site"
git push origin main
```

2. **Deploy no Vercel:**
- O Vercel fará o deploy automaticamente
- A logo estará disponível em: `https://fryfryfrydelivery.vercel.app/public/imagens/logo.png`

## 🧪 Testar a Logo

### Teste Local:
1. Abra `http://localhost:3000/public/imagens/logo.png`
2. Deve mostrar sua logo

### Teste de Compartilhamento:
1. Use o [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Cole a URL: `https://fryfryfrydelivery.vercel.app/`
3. Clique em "Debug" para ver como ficará

### Teste no WhatsApp:
1. Envie o link para alguém
2. A logo deve aparecer no preview

## ⚠️ Dicas Importantes

- **Nome do arquivo:** Deve ser exatamente `logo.png`
- **Formato:** PNG é recomendado (suporta transparência)
- **Tamanho:** Máximo 5MB
- **Dimensões:** 200x60px ou proporção similar
- **Qualidade:** Alta resolução para ficar nítida

## 🔄 Atualizar Logo

Para trocar a logo:
1. Substitua o arquivo `public/imagens/logo.png`
2. Faça commit e push
3. A nova logo aparecerá automaticamente

---

**✅ Pronto! Sua logo aparecerá quando o link for compartilhado!**
