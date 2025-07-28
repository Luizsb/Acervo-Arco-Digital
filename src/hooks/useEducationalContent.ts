import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EducationalContent, FilterOptions } from '../types/content';

export const useEducationalContent = () => {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    tipo_conteudo: [],
    bncc: [],
    tipo_ensino: [],
    disciplina: []
  });

  // Fetch educational content from Supabase
  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('educational_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setContents(data || []);
      setFilteredContents(data || []);
    } catch (err) {
      console.error('Erro ao buscar conteúdos:', err);
      setError('Erro ao carregar conteúdos. Verifique sua conexão.');
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
    let filtered = contents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.nome_conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.bncc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(content => {
          const contentValue = content[key as keyof EducationalContent];
          if (Array.isArray(contentValue)) {
            return values.some(value => contentValue.includes(value));
          }
          return values.includes(contentValue as string);
        });
      }
    });

    setFilteredContents(filtered);
  }, [contents, searchTerm, activeFilters]);

  const updateFilter = (filterType: keyof FilterOptions, value: string, isAdd: boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: isAdd
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      tipo_conteudo: [],
      bncc: [],
      tipo_ensino: [],
      disciplina: []
    });
    setSearchTerm('');
  };

  const getUniqueValues = (field: keyof EducationalContent) => {
    const values = contents.flatMap(content => {
      const value = content[field];
      return Array.isArray(value) ? value : [value];
    });
    return [...new Set(values)].filter(Boolean);
  };

  return {
    contents: filteredContents,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    activeFilters,
    updateFilter,
    clearFilters,
    getUniqueValues,
    refetch: fetchContents
  };
};