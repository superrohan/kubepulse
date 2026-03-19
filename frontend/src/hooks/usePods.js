import { useState, useCallback, useEffect } from 'react';
import { podApi, namespaceApi } from '../services/api';
import { useAutoRefresh } from './useAutoRefresh';

export function usePods() {
  const [pods, setPods] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchNamespaces = useCallback(async () => {
    try {
      const response = await namespaceApi.getNamespaces();
      setNamespaces(response.data || []);
    } catch (err) {
      console.error('Failed to fetch namespaces:', err);
    }
  }, []);

  const fetchPods = useCallback(async () => {
    try {
      setError(null);
      const response =
        selectedNamespace === 'all'
          ? await podApi.getAllPods()
          : await podApi.getPodsByNamespace(selectedNamespace);
      setPods(response.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedNamespace]);

  useEffect(() => {
    setLoading(true);
    fetchPods();
  }, [fetchPods]);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  useAutoRefresh(fetchPods, 10000, autoRefresh);

  return {
    pods,
    namespaces,
    selectedNamespace,
    setSelectedNamespace,
    loading,
    error,
    lastRefreshed,
    autoRefresh,
    setAutoRefresh,
    refresh: fetchPods,
  };
}
