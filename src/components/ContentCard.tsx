import React, { useState } from 'react';
import { ExternalLink, Tag, BookOpen, GraduationCap, Layers } from 'lucide-react';
import { EducationalContent } from '../types/content';

interface ContentCardProps {
  content: EducationalContent;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [imageError, setImageError] = useState(false);

  const visibleTags = showAllTags ? content.tags : content.tags.slice(0, 3);
  const hiddenTagsCount = Math.max(0, content.tags.length - 3);

  const getTypeIcon = (type: string) => {
    return type === 'ODA' ? <Layers className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'ODA' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group content-card min-h-[400px]">
      <div className="relative flex-shrink-0">
        {content.thumbnail_url && !imageError ? (
          <img
            src={content.thumbnail_url}
            alt={content.nome_conteudo}
            onError={() => setImageError(true)}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            {getTypeIcon(content.tipo_conteudo)}
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(content.tipo_conteudo)}`}>
            {getTypeIcon(content.tipo_conteudo)}
            {content.tipo_conteudo}
          </span>
        </div>
      </div>

      <div className="p-4 content-card-content">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">
          {content.nome_conteudo}
        </h3>

        <div className="flex-grow space-y-3 min-h-0">
          <div className="flex flex-wrap gap-1">
            {visibleTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            
            {hiddenTagsCount > 0 && !showAllTags && (
              <button
                onClick={() => setShowAllTags(true)}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors duration-150"
              >
                +{hiddenTagsCount}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 block">BNCC:</span>
              <span className="font-medium text-gray-900">{content.bncc}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Ensino:</span>
              <span className="font-medium text-gray-900">{content.tipo_ensino}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-sm block">Disciplina:</span>
            <div className="flex items-center gap-1 mt-1">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">{content.disciplina}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.open(content.url_conteudo, '_blank')}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 content-card-button"
        >
          <ExternalLink className="w-4 h-4" />
          Acessar Conteúdo
        </button>
      </div>
    </div>
  );
};