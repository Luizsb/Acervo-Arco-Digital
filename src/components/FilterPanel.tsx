import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { FilterOptions } from '../types/content';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filterType: keyof FilterOptions, value: string, isAdd: boolean) => void;
  onClearFilters: () => void;
  availableOptions: {
    marca: string[];
    volume: string[];
    segmento: string[];
    ano_serie_modulo: string[];
    componente: string[];
    categoria: string[];
    tipologia: string[];
    samr: string[];
  };
}

const filterLabels = {
  marca: 'Marca',
  volume: 'Volume',
  segmento: 'Segmento',
  ano_serie_modulo: 'Ano/Série/Módulo',
  componente: 'Componente',
  categoria: 'Categoria',
  tipologia: 'Tipologia',
  samr: 'SAMR'
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableOptions
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    marca: true,
    volume: false,
    segmento: false,
    ano_serie_modulo: false,
    componente: false,
    categoria: false,
    tipologia: false,
    samr: false
  });

  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getFilteredOptions = (filterType: keyof FilterOptions) => {
    const searchTerm = searchTerms[filterType] || '';
    return availableOptions[filterType].filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getTotalActiveFilters = () => {
    return Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {getTotalActiveFilters() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getTotalActiveFilters()}
            </span>
          )}
        </div>
        {getTotalActiveFilters() > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(filterLabels).map(([filterType, label]) => {
          const isExpanded = expandedSections[filterType];
          const activeCount = filters[filterType as keyof FilterOptions].length;
          const filteredOptions = getFilteredOptions(filterType as keyof FilterOptions);

          return (
            <div key={filterType} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(filterType)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{label}</span>
                  {activeCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {activeCount}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-3">
                  {availableOptions[filterType as keyof FilterOptions].length > 5 && (
                    <input
                      type="text"
                      placeholder={`Buscar ${label.toLowerCase()}...`}
                      value={searchTerms[filterType] || ''}
                      onChange={(e) => setSearchTerms(prev => ({
                        ...prev,
                        [filterType]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  <div className="filter-options space-y-2">
                    {filteredOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={filters[filterType as keyof FilterOptions].includes(option)}
                          onChange={(e) => onFilterChange(
                            filterType as keyof FilterOptions,
                            option,
                            e.target.checked
                          )}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};