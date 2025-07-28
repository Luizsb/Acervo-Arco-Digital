import React, { useState, useMemo } from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { TabNavigation } from './components/TabNavigation';
import { ContentCard } from './components/ContentCard';
import { LoadingCard } from './components/LoadingCard';
import { useEducationalContent } from './hooks/useEducationalContent';

function App() {
  const [activeTab, setActiveTab] = useState<'ODA' | 'videoaula'>('ODA');
  const [showFilters, setShowFilters] = useState(false);

  const {
    contents,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilters,
    updateFilter,
    clearFilters,
    getUniqueValues,
    refetch
  } = useEducationalContent();

  const filteredByTab = useMemo(() => {
    return contents.filter(content => content.tipo_conteudo === activeTab);
  }, [contents, activeTab]);

  const availableOptions = useMemo(() => ({
    tipo_conteudo: getUniqueValues('tipo_conteudo').filter((value): value is string => Boolean(value)),
    bncc: getUniqueValues('bncc').filter((value): value is string => Boolean(value)),
    tipo_ensino: getUniqueValues('tipo_ensino').filter((value): value is string => Boolean(value)),
    disciplina: getUniqueValues('disciplina').filter((value): value is string => Boolean(value))
  }), [contents]);

  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    contents.forEach(content => {
      suggestions.add(content.nome_conteudo);
      suggestions.add(content.disciplina);
      suggestions.add(content.bncc);
      content.tags.forEach(tag => suggestions.add(tag));
    });
    return Array.from(suggestions);
  }, [contents]);

  const odaCount = contents.filter(c => c.tipo_conteudo === 'ODA').length;
  const videoaulaCount = contents.filter(c => c.tipo_conteudo === 'videoaula').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                {/* <Layers className="w-6 h-6 text-green-600 -ml-2" /> */}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Acervo Arco Digital</h1>
                {/* <p className="text-sm text-gray-600">Acervo Digital</p> */}
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Filtros
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <FilterPanel
                filters={activeFilters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                availableOptions={availableOptions}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  suggestions={searchSuggestions}
                />
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  odaCount={odaCount}
                  videoaulaCount={videoaulaCount}
                />
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {loading ? 'Carregando...' : error ? 'Erro ao carregar' : `${filteredByTab.length} conteúdo${filteredByTab.length !== 1 ? 's' : ''} encontrado${filteredByTab.length !== 1 ? 's' : ''}`}
                </p>
                {error && (
                  <button
                    onClick={refetch}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>

              {/* Content Grid */}
              <div className="grid-cards">
                {error ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Erro ao carregar conteúdos
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {error}
                    </p>
                    <button
                      onClick={refetch}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <LoadingCard key={index} />
                  ))
                ) : filteredByTab.length > 0 ? (
                  filteredByTab.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum conteúdo encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tente ajustar seus filtros ou termo de busca
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;