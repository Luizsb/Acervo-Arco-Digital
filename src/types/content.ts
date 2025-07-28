export interface EducationalContent {
  id: string;
  nome_conteudo: string;
  tipo_conteudo: 'ODA' | 'videoaula';
  tags: string[];
  bncc: string;
  tipo_ensino: string;
  disciplina: string;
  url_conteudo: string;
  thumbnail_url?: string;
  created_at?: string;
}

export interface FilterOptions {
  tipo_conteudo: string[];
  bncc: string[];
  tipo_ensino: string[];
  disciplina: string[];
}