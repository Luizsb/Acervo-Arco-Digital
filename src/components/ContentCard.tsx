import React, { useState } from 'react';
import { ExternalLink, Tag, Layers, BookOpen, Calendar } from 'lucide-react';
import { EducationalContent } from '../types/content';

interface ContentCardProps {
  content: EducationalContent;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getTypeIcon = () => {
    return <Layers className="w-4 h-4" />;
  };

  // Construir o caminho da thumbnail local baseado no código do ODA
  // Usa import.meta.env.BASE_URL para funcionar com GitHub Pages
  const baseUrl = import.meta.env.BASE_URL || '/';
  const thumbnailPath = `${baseUrl}thumbs/${content.codigo}.png`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group content-card min-h-[350px]">
      <div className="relative flex-shrink-0">
        <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
          {!imageError && (
            <img 
              src={thumbnailPath}
              alt={content.nome || content.titulo}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {(!imageLoaded || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              {getTypeIcon()}
            </div>
          )}
        </div>
        
        {content.categoria && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {content.categoria}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 content-card-content">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">
          {content.nome}
        </h3>

        <div className="flex-grow space-y-3 min-h-0">
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">Código:</span> {content.codigo}
          </div>

          {/* Tags for Segmento and Componente */}
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
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 block text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Ano/Série:
              </span>
              <span className="font-medium text-gray-900 text-xs">
                {content.ano_serie_modulo && content.ano_serie_modulo !== '-' ? content.ano_serie_modulo : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Volume:
              </span>
              <span className="font-medium text-gray-900 text-xs">
                {content.volume && content.volume !== '-' ? content.volume : '-'}
              </span>
            </div>
          </div>

          {content.tipologia && content.tipologia !== '-' && (
            <div className="text-sm">
              <span className="text-gray-500 text-xs">Tipologia:</span>
              <span className="ml-1 font-medium text-gray-900 text-xs">{content.tipologia}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (content.link && content.link !== '-' && content.link.trim() !== '') {
              window.open(content.link, '_blank');
            } else {
              alert('Link não disponível para este conteúdo');
            }
          }}
          className={`w-full mt-4 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 content-card-button ${
            content.link && content.link !== '-' && content.link.trim() !== ''
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          {content.link && content.link !== '-' && content.link.trim() !== '' 
            ? 'Acessar Conteúdo' 
            : 'Link Indisponível'
          }
        </button>
      </div>
    </div>
  );
};