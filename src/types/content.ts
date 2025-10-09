export interface EducationalContent {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  
  // Metadados educacionais
  segmento: string;
  componente_curricular: string;
  ano_serie: string;
  volume: string;
  marca: string;
  colecao: string;
  
  // Arrays
  bncc_habilidades: string[];
  palavras_chave: string[];
  
  // Categorização
  tipo: string;
  tipologia: string;
  categoria: string;
  formato: string;
  samr: string;
  
  // URLs
  url_principal: string;
  url_thumbnail: string;
  
  // Metadados adicionais
  status: string;
  ativo_bigodao: string;
  versao: string;
  slug: string;
  
  // Compatibilidade com código antigo (mapeamentos)
  nome?: string;              // alias para titulo
  componente?: string;        // alias para componente_curricular
  ano_serie_modulo?: string;  // alias para ano_serie
  link?: string;              // alias para url_principal
}

export interface FilterOptions {
  marca: string[];
  volume: string[];
  segmento: string[];
  ano_serie_modulo: string[];
  componente: string[];
  categoria: string[];
  tipologia: string[];
  samr: string[];
}