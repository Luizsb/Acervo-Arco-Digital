import React, { useState } from 'react';
import { ExternalLink, Tag, Calendar, BookOpen } from 'lucide-react';
import { EducationalContent } from '../types/content';

interface ContentCardCompactProps {
  content: EducationalContent;
}

export const ContentCardCompact: React.FC<ContentCardCompactProps> = ({ content }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Construir o caminho da thumbnail local baseado no código do ODA
  const baseUrl = import.meta.env.BASE_URL || '/';
  const thumbnailPath = `${baseUrl}thumbs/${content.codigo}.png`;

  // Função para obter o ano (assumindo que está no campo ano_serie_modulo ou volume)
  const getYear = () => {
    if (content.ano_serie_modulo && content.ano_serie_modulo !== '-') {
      // Extrair ano se estiver no formato "Ano: 2024"
      const yearMatch = content.ano_serie_modulo.match(/(\d{4})/);
      if (yearMatch) return yearMatch[1];
    }
    return '2024'; // Ano padrão
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="flex h-40">
        {/* Image/Thumbnail Section */}
        <div className="w-64 h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {!imageError && (
            <img 
              src={thumbnailPath}
              alt={content.nome || content.titulo}
              className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {(!imageLoaded || imageError) && (
            <div className="flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  Capa do jogo
                </div>
                <div className="text-xs text-gray-400">
                  {content.nome || content.titulo}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between h-full">
          {/* Top Section - Title and Tags */}
          <div className="flex-grow-0 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-shrink-0">
                {content.nome || content.titulo}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {content.segmento && content.segmento !== '-' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    <Tag className="w-3 h-3" />
                    {content.segmento}
                  </span>
                )}
                {content.componente && content.componente !== '-' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    <Tag className="w-3 h-3" />
                    {content.componente}
                  </span>
                )}
                {content.categoria && content.categoria !== '-' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                    <Tag className="w-3 h-3" />
                    {content.categoria}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section - Description */}
          <div className="flex-grow">
            <p className="text-sm text-gray-600 line-clamp-2">
              {content.descricao || `${content.categoria || 'Conteúdo educacional'} sobre ${content.componente || 'diversos temas'}.`}
            </p>
          </div>

          {/* Bottom Section - Metadata and Button */}
          <div className="flex-grow-0 space-y-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Ano: {getYear()}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Vol: {content.volume && content.volume !== '-' ? content.volume : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Marca: {content.marca && content.marca !== '-' ? content.marca : 'N/A'}</span>
              </div>
            </div>

            {/* Access Button */}
            <button
            onClick={() => {
              if (content.link && content.link !== '-' && content.link.trim() !== '') {
                window.open(content.link, '_blank');
              } else {
                alert('Link não disponível para este conteúdo');
              }
            }}
            className={`mt-4 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              content.link && content.link !== '-' && content.link.trim() !== ''
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            disabled={!content.link || content.link === '-' || content.link.trim() === ''}
          >
            <ExternalLink className="w-4 h-4" />
            {content.link && content.link !== '-' && content.link.trim() !== '' 
              ? 'Acessar Conteúdo' 
              : 'Link Indisponível'
            }
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};
