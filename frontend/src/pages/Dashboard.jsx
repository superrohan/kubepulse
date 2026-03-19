import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import Header from '../components/Header';
import PodTable from '../components/PodTable';
import NamespaceFilter from '../components/NamespaceFilter';
import SearchBar from '../components/SearchBar';
import RefreshTimer from '../components/RefreshTimer';
import StatsBar from '../components/StatsBar';
import PodDetailsPanel from '../components/PodDetailsPanel';
import { usePods } from '../hooks/usePods';

export default function Dashboard() {
  const {
    pods,
    namespaces,
    selectedNamespace,
    setSelectedNamespace,
    loading,
    error,
    lastRefreshed,
    autoRefresh,
    setAutoRefresh,
    refresh,
  } = usePods();

  const [search, setSearch] = useState('');
  const [selectedPod, setSelectedPod] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredPods = useMemo(() => {
    if (!search.trim()) return pods;
    const q = search.toLowerCase();
    return pods.filter(
      (p) =>
        p.podName?.toLowerCase().includes(q) ||
        p.serviceName?.toLowerCase().includes(q)
    );
  }, [pods, search]);

  const handlePodClick = (pod) => {
    setSelectedPod(pod);
    setDrawerOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '56px',
          backgroundColor: 'background.default',
          pt: 3,
          pb: 6,
        }}
      >
        <Container maxWidth="xl">
          {/* Page title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Pod Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Real-time health of services running in your AKS cluster
            </Typography>
          </Box>

          {/* Stats bar */}
          <Box sx={{ mb: 3 }}>
            <StatsBar pods={pods} />
          </Box>

          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            <NamespaceFilter
              namespaces={namespaces}
              selected={selectedNamespace}
              onChange={(ns) => {
                setSelectedNamespace(ns);
                setSearch('');
              }}
            />
            <SearchBar value={search} onChange={setSearch} />
            <Box sx={{ ml: 'auto' }}>
              <RefreshTimer
                lastRefreshed={lastRefreshed}
                autoRefresh={autoRefresh}
                onToggle={setAutoRefresh}
                onRefresh={refresh}
              />
            </Box>
          </Box>

          {/* Count */}
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
          >
            Showing {filteredPods.length} of {pods.length} pods
            {search && ` matching "${search}"`}
          </Typography>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Pod Table */}
          <PodTable
            pods={filteredPods}
            loading={loading}
            onPodClick={handlePodClick}
          />
        </Container>
      </Box>

      {/* Pod detail drawer */}
      <PodDetailsPanel
        pod={selectedPod}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Box>
  );
}
