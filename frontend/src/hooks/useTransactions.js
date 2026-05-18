import { useCallback, useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      setTransactions(await transactionService.listAll(user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, loading, error, refresh };
};
