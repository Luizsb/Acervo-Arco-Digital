# 🚀 Guia para Deploy no GitHub Pages

## Passo a Passo Completo

### 1. Preparar o Repositório

1. **Crie um repositório no GitHub:**
   - Nome: `Acervo-digital`
   - Descrição: "Estante Virtual de Conteúdos Educacionais"
   - Público ou Privado (sua escolha)

2. **Clone o repositório localmente:**
   ```bash
   git clone https://github.com/seu-usuario/Acervo-digital.git
   cd Acervo-digital
   ```

3. **Copie todos os arquivos do projeto para o repositório:**
   ```bash
   # Copie todos os arquivos da pasta project/ para a raiz do repositório
   ```

### 2. Configurar o Git

1. **Adicione os arquivos:**
   ```bash
   git add .
   git commit -m "Initial commit: Acervo Digital"
   git push origin main
   ```

### 3. Configurar GitHub Pages

1. **Vá para Settings do repositório:**
   - Acesse: `https://github.com/seu-usuario/Acervo-digital/settings`

2. **Configure o GitHub Pages:**
   - Role até "Pages" no menu lateral
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Clique em "Save"

### 4. Configurar GitHub Actions

O arquivo `.github/workflows/deploy.yml` já está configurado e irá:
- Fazer build automático a cada push
- Deployar para a branch `gh-pages`
- Atualizar o site automaticamente

### 5. Testar o Deploy

1. **Faça um pequeno teste:**
   ```bash
   # Edite o README.md
   echo "# Teste de deploy" >> README.md
   git add README.md
   git commit -m "Teste de deploy"
   git push origin main
   ```

2. **Aguarde alguns minutos** e acesse:
   `https://seu-usuario.github.io/Acervo-digital/`

### 6. Verificar se está funcionando

- ✅ Site carrega sem erros
- ✅ Layout responsivo funciona
- ✅ Pesquisa funciona
- ✅ Filtros funcionam
- ✅ Cards são exibidos corretamente

## 🔧 Configurações Importantes

### Se o nome do repositório for diferente:

Edite o `vite.config.ts`:
```typescript
base: process.env.NODE_ENV === 'production' ? '/SEU-NOME-REPOSITORIO/' : '/',
```

### Se quiser usar um domínio customizado:

1. Adicione um arquivo `CNAME` na raiz:
   ```
   seu-dominio.com
   ```

2. Configure no DNS do seu provedor

## 🐛 Solução de Problemas

### Site não carrega:
- Verifique se a branch `gh-pages` foi criada
- Aguarde alguns minutos após o push
- Verifique os logs do GitHub Actions

### Assets não carregam:
- Verifique se o `base` no `vite.config.ts` está correto
- Faça um novo build e push

### Erro 404:
- O arquivo `404.html` deve redirecionar corretamente
- Verifique se o roteamento está funcionando

## 📝 Comandos Úteis

```bash
# Build local
npm run build

# Deploy manual (se necessário)
npm run deploy

# Verificar status
git status
git log --oneline
```

## 🎉 Pronto!

Seu projeto estará disponível em:
`https://seu-usuario.github.io/Acervo-digital/`

O deploy será automático a cada push na branch `main`! 