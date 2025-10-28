import { useState, useEffect } from 'react';
import { loadCSVData } from '../lib/jsonLoader';
import { EducationalContent, FilterOptions } from '../types/content';

export const useEducationalContent = () => {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<EducationalContent[]>([]);
  const [paginatedContents, setPaginatedContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    marca: [],
    volume: [],
    segmento: [],
    ano_serie_modulo: [],
    componente: [],
    categoria: [],
    tipologia: [],
    samr: []
  });

  // Fetch educational content from JSON
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await loadCSVData();

      setContents(data || []);
      setFilteredContents(data || []);
    } catch (err) {
      console.error('Erro ao buscar conteúdos:', err);
      setError('Erro ao carregar conteúdos. Verifique se o arquivo de dados está disponível.');
      setContents([]);
      setFilteredContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    let filtered = [...contents]; // Create a fresh copy

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      filtered = filtered.filter(content =>
        (content.nome || content.titulo).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (content.componente || content.componente_curricular).toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(content => {
          const contentValue = content[key as keyof EducationalContent];
          if (Array.isArray(contentValue)) {
            return values.some((value: string) => contentValue.includes(value));
          }
          return values.includes(contentValue as string);
        });
      }
    });

    setFilteredContents(filtered);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [contents, searchTerm, activeFilters]);

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredContents.slice(startIndex, endIndex);
    setPaginatedContents(paginated);
  }, [filteredContents, currentPage, itemsPerPage]);

  const updateFilter = (filterType: keyof FilterOptions, value: string, isAdd: boolean) => {
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: isAdd
          ? [...prev[filterType], value]
          : prev[filterType].filter(item => item !== value)
      };

      // Clear dependent filters when segmento changes
      if (filterType === 'segmento') {
        // Reset filters that depend on segmento
        newFilters.ano_serie_modulo = [];
        newFilters.volume = [];
        newFilters.componente = [];
      }

      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      marca: [],
      volume: [],
      segmento: [],
      ano_serie_modulo: [],
      componente: [],
      categoria: [],
      tipologia: [],
      samr: []
    });
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing filters
    // Force re-filtering by resetting filtered contents
    setFilteredContents(contents);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing search
    // Force re-filtering by resetting filtered contents
    setFilteredContents(contents);
  };

  const getUniqueValues = (field: keyof EducationalContent) => {
    // Get filtered contents based on other active filters
    let filteredContents = contents;

    // Apply filters excluding the current field
    Object.entries(activeFilters).forEach(([filterKey, filterValues]) => {
      if (filterKey !== field && filterValues.length > 0) {
        filteredContents = filteredContents.filter(content => {
          const contentValue = content[filterKey as keyof EducationalContent];
          if (Array.isArray(contentValue)) {
            return filterValues.some((value: string) => contentValue.includes(value));
          }
          return filterValues.includes(contentValue as string);
        });
      }
    });

    const values = filteredContents.flatMap(content => {
      const value = content[field];
      return Array.isArray(value) ? value : [value];
    });
    const uniqueValues = [...new Set(values)].filter(Boolean);
    
    // Sort alphabetically, with special handling for segmento (EI, AI, AF)
    if (field === 'segmento') {
      return uniqueValues.sort((a, b) => {
        const order = ['EI', 'AI', 'AF'];
        const aIndex = order.indexOf(a as string);
        const bIndex = order.indexOf(b as string);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return (a as string).localeCompare(b as string);
      });
    }
    
    return uniqueValues.sort((a, b) => (a as string).localeCompare(b as string));
  };

  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    contents: paginatedContents,
    allContents: filteredContents,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilters,
    updateFilter,
    clearFilters,
    clearSearch,
    getUniqueValues,
    refetch: fetchContents,
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: filteredContents.length,
    goToPage,
    nextPage,
    prevPage
  };
};