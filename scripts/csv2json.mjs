#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para gerar slug a partir de string
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

// Função para quebrar string em array por múltiplos delimitadores
function splitToArray(text, delimiters = [';', ',', '|']) {
  if (!text || text === '-') return [];
  
  let result = [text];
  for (const delimiter of delimiters) {
    result = result.flatMap(item => item.split(delimiter));
  }
  
  return result
    .map(item => item.trim())
    .filter(item => item && item !== '-');
}

// Parse de linha CSV considerando aspas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Converte CSV para JSON
function csv2json() {
  console.log('🔄 Iniciando conversão CSV → JSON...');
  
  const csvPath = join(__dirname, '..', 'data', 'ACERVO_SAE.csv');
  const outputDir = join(__dirname, '..', 'public', 'data');
  const outputPath = join(outputDir, 'acervo.json');
  
  try {
    // Lê o arquivo CSV
    console.log(`📖 Lendo CSV: ${csvPath}`);
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV vazio ou inválido');
    }
    
    // Primeira linha é o cabeçalho
    const header = parseCSVLine(lines[0]);
    console.log(`📋 Colunas encontradas: ${header.length}`);
    
    const items = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    // Processa cada linha (pula cabeçalho)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        skippedCount++;
        continue;
      }
      
      const columns = parseCSVLine(line);
      if (columns.length < 8) {
        skippedCount++;
        continue;
      }
      
      // Mapeamento das colunas do CSV original
      const marca = columns[0] || '';
      const colecao = columns[1] || '';
      const segmento = columns[2] || '';
      const anoSerieModulo = columns[3] || '';
      const volume = columns[4] || '';
      const componente = columns[5] || '';
      const codigo = columns[6] || '';
      const nome = columns[7] || '';
      const categoria = columns[8] || '';
      const ativoBigodao = columns[9] || '';
      const link = columns[12] || '';
      const tipologia = columns[13] || '';
      const samr = columns[16] || '';
      
      // Validação: precisa ter pelo menos nome e código
      if (!nome || !codigo) {
        skippedCount++;
        continue;
      }
      
      // Cria o objeto no novo formato especificado
      const item = {
        id: codigo,
        codigo: codigo,
        titulo: nome,
        descricao: `${categoria || tipologia || 'Conteúdo educacional'} - ${componente || ''}`.trim(),
        
        // Metadados educacionais
        segmento: segmento || '',
        componente_curricular: componente || '',
        ano_serie: anoSerieModulo || '',
        volume: volume || '',
        marca: marca || '',
        colecao: colecao || '',
        
        // Arrays (quebrar por ; , |)
        bncc_habilidades: splitToArray(columns[21] || ''), // Coluna se existir, senão vazio
        palavras_chave: splitToArray(`${categoria},${tipologia},${componente},${segmento}`),
        
        // Categorização
        tipo: categoria || tipologia || '',
        tipologia: tipologia || '',
        categoria: categoria || '',
        formato: 'digital',
        samr: samr || '',
        
        // URLs
        url_principal: link || '',
        url_thumbnail: link ? `${link}/thumbnail` : '',
        
        // Metadados adicionais
        status: ativoBigodao?.toUpperCase() === 'SIM' ? 'ativo' : 'inativo',
        ativo_bigodao: ativoBigodao || '',
        versao: colecao || '2024',
        
        // Slug para URLs amigáveis
        slug: slugify(`${codigo}-${nome}`)
      };
      
      items.push(item);
      processedCount++;
    }
    
    console.log(`✅ Processados: ${processedCount} itens`);
    console.log(`⏭️  Ignorados: ${skippedCount} linhas`);
    
    // Cria diretório de saída se não existir
    mkdirSync(outputDir, { recursive: true });
    
    // Salva JSON formatado
    const jsonContent = JSON.stringify(items, null, 2);
    writeFileSync(outputPath, jsonContent, 'utf-8');
    
    console.log(`💾 JSON salvo em: ${outputPath}`);
    console.log(`📊 Total de itens no JSON: ${items.length}`);
    console.log('✨ Conversão concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conversão:', error.message);
    process.exit(1);
  }
}

// Executa a conversão
csv2json();

