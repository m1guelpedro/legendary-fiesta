import { useCallback, useEffect, useState } from 'react';
import { historyService } from '../services/historyService.js';

export const useHistory = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [filters, setFilters] = useState({});

  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await historyService.list({
        page,
        limit,
        ...filters,
      });
      setEventos(data.eventos || []);
      setTotal(data.total || 0);
      setPages(data.pages || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
    }
  }, [pages]);

  return {
    eventos,
    loading,
    error,
    page,
    limit,
    total,
    pages,
    setLimit,
    applyFilters,
    goToPage,
    refresh: loadEventos,
  };
};
