import { useCallback, useEffect, useState } from 'react';
import { historyService } from '../services/historyService.js';

export const useActivitySummary = () => {
  const [resumo, setResumo] = useState(null);
  const [ultimaAtividade, setUltimaAtividade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resumoData, ultimaData] = await Promise.all([
        historyService.getResumo(),
        historyService.getUltima(),
      ]);
      setResumo(resumoData.resumo || {});
      setUltimaAtividade(ultimaData.ultimaAtividade);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    resumo,
    ultimaAtividade,
    loading,
    error,
    refresh: loadSummary,
  };
};
