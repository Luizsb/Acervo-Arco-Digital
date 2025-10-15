import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { ContentCard } from './components/ContentCard';
import { LoadingCard } from './components/LoadingCard';
import { Pagination } from './components/Pagination';
import { useEducationalContent } from './hooks/useEducationalContent';

function App() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    contents,
    allContents,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilters,
    updateFilter,
    clearFilters,
    clearSearch,
    getUniqueValues,
    refetch,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    goToPage,
    nextPage,
    prevPage
  } = useEducationalContent();

  const availableOptions = useMemo(() => ({
    marca: getUniqueValues('marca').filter((value): value is string => Boolean(value) && value !== '-'),
    volume: getUniqueValues('volume').filter((value): value is string => Boolean(value) && value !== '-'),
    segmento: getUniqueValues('segmento').filter((value): value is string => Boolean(value) && value !== '-'),
    ano_serie_modulo: getUniqueValues('ano_serie_modulo').filter((value): value is string => Boolean(value) && value !== '-'),
    componente: getUniqueValues('componente').filter((value): value is string => Boolean(value) && value !== '-'),
    categoria: getUniqueValues('categoria').filter((value): value is string => Boolean(value) && value !== '-'),
    tipologia: getUniqueValues('tipologia').filter((value): value is string => Boolean(value) && value !== '-'),
    samr: getUniqueValues('samr').filter((value): value is string => Boolean(value) && value !== '-')
  }), [contents]);

  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    contents.forEach(content => {
      if (content.nome) suggestions.add(content.nome);
      if (content.componente && content.componente !== '-') suggestions.add(content.componente);
      if (content.categoria && content.categoria !== '-') suggestions.add(content.categoria);
    });
    return Array.from(suggestions);
  }, [contents]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Sidebar Filters */}
          <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="filter-panel">
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
                  onClearSearch={clearSearch}
                  suggestions={searchSuggestions}
                />
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {loading ? 'Carregando...' : error ? 'Erro ao carregar' : `${totalItems} conteúdo${totalItems !== 1 ? 's' : ''} encontrado${totalItems !== 1 ? 's' : ''}`}
                </p>
                <div className="flex items-center gap-2">
                  {error && (
                    <button
                      onClick={refetch}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              </div>

              {/* Content Display */}
              {error ? (
                <div className="text-center py-12">
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
                <div className="grid-cards">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <LoadingCard key={index} />
                  ))}
                </div>
              ) : contents.length > 0 ? (
                <div className="grid-cards">
                  {contents.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
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

              {/* Pagination */}
              {!loading && !error && allContents.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={goToPage}
                  onPrevPage={prevPage}
                  onNextPage={nextPage}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;