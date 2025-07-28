# Acervo Digital - Estante Virtual de Conteúdos Educacionais

Este projeto é uma aplicação React que permite visualizar e pesquisar conteúdos educacionais.

## 🌐 Demo Online

**Acesse o projeto em:** [https://luizsb.github.io/Acervo-Arco-Digital/](https://luizsb.github.io/Acervo-Arco-Digital/)

## Como executar o projeto

### Opção 1: Desenvolvimento (Recomendado)
```bash
npm install
npm run dev
```
O projeto será aberto automaticamente em `http://localhost:3000`

### Opção 2: Produção com servidor local
```bash
npm install
npm run build
npm run serve
```
O projeto será servido em `http://localhost:8080`

### Opção 3: Preview do Vite
```bash
npm install
npm run build
npm run preview
```
O projeto será servido em `http://localhost:4173`

## 🚀 Deploy no GitHub Pages

### Configuração Automática (Recomendado)

1. **Crie um repositório no GitHub** com o nome `Acervo-digital`
2. **Faça push do código** para o repositório
3. **Configure o GitHub Pages:**
   - Vá em Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. **O deploy será automático** a cada push na branch `main`

### Configuração Manual

Se preferir fazer o deploy manualmente:

```bash
# Build do projeto
npm run build

# Instale o gh-pages (se necessário)
npm install --save-dev gh-pages

# Deploy
npx gh-pages -d dist
```

## Problema conhecido

**NÃO abra o arquivo `dist/index.html` diretamente no navegador!** 

Isso causará erros de CORS porque o navegador não consegue carregar módulos JavaScript quando o arquivo é aberto via `file://`.

## Soluções para o erro de CORS

Se você está tentando abrir o arquivo HTML diretamente e recebendo erros de CORS:

1. **Use o servidor de desenvolvimento**: `npm run dev`
2. **Use o servidor local**: `npm run serve` (após build)
3. **Use o preview do Vite**: `npm run preview` (após build)
4. **Use o GitHub Pages**: Acesse a URL do deploy

## Tecnologias utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React (ícones)

## Estrutura do projeto

```
src/
├── components/     # Componentes React
├── hooks/         # Custom hooks
├── lib/           # Configurações (Supabase)
├── types/         # Definições de tipos TypeScript
└── App.tsx        # Componente principal
```

## 📝 Notas importantes

- O projeto está configurado para funcionar no GitHub Pages com o nome do repositório `Acervo-digital`
- Se você usar um nome diferente para o repositório, atualize o `base` no `vite.config.ts`
- O deploy é automático via GitHub Actions quando você faz push para a branch `main` 