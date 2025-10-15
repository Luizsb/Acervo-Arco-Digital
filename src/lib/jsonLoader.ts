import { EducationalContent } from '../types/content';

/**
 * Carrega os dados do acervo a partir do JSON estático gerado no build
 */
export async function loadCSVData(): Promise<EducationalContent[]> {
  try {
    // Carrega o JSON gerado pelo script csv2json.mjs
    // Usa import.meta.env.BASE_URL para funcionar com GitHub Pages
    const baseUrl = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${baseUrl}data/acervo.json`);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
    }
    
    const data: EducationalContent[] = await response.json();
    
    // Adiciona campos de compatibilidade (aliases) para não quebrar código existente
    const enrichedData = data.map(item => ({
      ...item,
      nome: item.titulo,              // alias para titulo
      componente: item.componente_curricular, // alias para componente_curricular
      ano_serie_modulo: item.ano_serie,       // alias para ano_serie
      link: item.url_principal        // alias para url_principal
    }));
    
    // Remove duplicatas baseado no código único
    const uniqueData = enrichedData.filter((item, index, self) => 
      index === self.findIndex(i => i.codigo === item.codigo)
    );
    
    console.log(`✅ Carregados ${uniqueData.length} itens únicos do acervo (removidas ${enrichedData.length - uniqueData.length} duplicatas)`);
    
    return uniqueData;
  } catch (error) {
    console.error('❌ Erro ao carregar dados do acervo:', error);
    throw error;
  }
}

