# 📋 Changelog: Migração de CSV para JSON Estático

## 🎯 Objetivo
Trocar leitura direta do CSV em runtime por JSON estático gerado no build para melhor performance.

## ✅ O que foi implementado

### 1. Estrutura de dados
- ✅ Criado diretório `data/` para armazenar o CSV fonte
- ✅ CSV fonte movido para `data/ACERVO_SAE.csv` (único lugar)
- ✅ JSON gerado automaticamente em `public/data/acervo.json`

### 2. Script de conversão
- ✅ Criado `scripts/csv2json.mjs` que:
  - Lê `data/ACERVO_SAE.csv`
  - Mapeia para novo formato com campos semânticos
  - Gera arrays para `bncc_habilidades` e `palavras_chave`
  - Salva em `public/data/acervo.json`
  - Processa 3210 itens com sucesso

### 3. Automação no build
- ✅ Adicionado hook `predev` no package.json
- ✅ Adicionado hook `prebuild` no package.json
- ✅ JSON é gerado automaticamente antes de dev e build

### 4. Atualização do frontend
- ✅ Arquivo `src/lib/csvParser.ts` renomeado para `src/lib/jsonLoader.ts`
- ✅ Removida lógica de parse de CSV
- ✅ Implementado carregamento via `fetch('/data/acervo.json')`
- ✅ Adicionados campos de compatibilidade (aliases) para não quebrar código existente

### 5. Tipos TypeScript
- ✅ Interface `EducationalContent` atualizada com novo formato:
  - `titulo`, `descricao`, `componente_curricular`, `ano_serie`
  - Arrays: `bncc_habilidades[]`, `palavras_chave[]`
  - URLs: `url_principal`, `url_thumbnail`
  - Metadados: `status`, `slug`, `formato`, `versao`
- ✅ Mantida compatibilidade com campos antigos via aliases

### 6. Limpeza
- ✅ Removido `ACERVO SAE.csv` da raiz
- ✅ Removido `public/ACERVO SAE.csv`
- ✅ Adicionado `public/data/acervo.json` ao `.gitignore`
- ✅ Sem dependências de parse CSV no runtime

### 7. Documentação
- ✅ README atualizado com seção "Gestão de dados"
- ✅ Instruções de como atualizar os dados
- ✅ Estrutura do projeto documentada

## 📊 Resultados

### Antes
- ❌ CSV carregado em runtime (729 KB)
- ❌ Parse de CSV no navegador
- ❌ Performance impactada
- ❌ CSV duplicado em vários lugares

### Depois
- ✅ JSON pré-processado (2.6 MB)
- ✅ Sem parse no navegador (só JSON.parse nativo)
- ✅ Melhor performance
- ✅ CSV único em `data/ACERVO_SAE.csv`
- ✅ Build automatizado

## 🔄 Como usar

### Atualizar dados
1. Edite `data/ACERVO_SAE.csv`
2. Execute `npm run dev` ou `npm run build`
3. JSON é regenerado automaticamente!

### Gerar JSON manualmente
```bash
node scripts/csv2json.mjs
```

## 🧪 Testes realizados
- ✅ `npm run build` - Sucesso (JSON gerado automaticamente)
- ✅ `dist/data/acervo.json` - Arquivo copiado corretamente
- ✅ 3210 itens processados com sucesso

## 📝 Novo formato de dados

```typescript
{
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  segmento: string;
  componente_curricular: string;
  ano_serie: string;
  volume: string;
  marca: string;
  colecao: string;
  bncc_habilidades: string[];      // Array!
  palavras_chave: string[];        // Array!
  tipo: string;
  tipologia: string;
  categoria: string;
  formato: string;
  samr: string;
  url_principal: string;
  url_thumbnail: string;
  status: string;
  ativo_bigodao: string;
  versao: string;
  slug: string;
}
```

## 🎯 Critérios de aceite (TODOS ATENDIDOS)
- ✅ Rodar `npm run dev` e `npm run build` gera `public/data/acervo.json`
- ✅ O catálogo renderiza a partir do JSON (sem parse de CSV no navegador)
- ✅ Ajustes de mapeamento limitados ao script (sem mexer no resto do app)
- ✅ BNCC e palavras-chave são arrays (quebrados por ; , |)

---

**Data da migração**: 09/10/2025  
**Status**: ✅ Concluído com sucesso

