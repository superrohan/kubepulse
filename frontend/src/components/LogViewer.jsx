import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { podApi } from '../services/api';

const TAIL_OPTIONS = [100, 250, 500, 1000];

export default function LogViewer({ namespace, podName }) {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tailLines, setTailLines] = useState(500);
  const [copied, setCopied] = useState(false);
  const logRef = useRef(null);

  const fetchLogs = async () => {
    if (!namespace || !podName) return;
    setLoading(true);
    setError(null);
    try {
      const response = await podApi.getPodLogs(namespace, podName, null, tailLines);
      setLogs(response.data || '');
      setTimeout(() => {
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [namespace, podName, tailLines]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podName}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Tail lines:
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          {TAIL_OPTIONS.map((n) => (
            <Button
              key={n}
              onClick={() => setTailLines(n)}
              variant={tailLines === n ? 'contained' : 'outlined'}
              sx={{ fontSize: '0.7rem', minWidth: 48 }}
            >
              {n}
            </Button>
          ))}
        </ButtonGroup>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchLogs} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton size="small" onClick={handleCopy} disabled={!logs}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download logs">
            <IconButton size="small" onClick={handleDownload} disabled={!logs}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {!loading && (
        <Box
          ref={logRef}
          sx={{
            flex: 1,
            backgroundColor: '#0D1117',
            border: '1px solid #30363D',
            borderRadius: 1,
            p: 2,
            overflow: 'auto',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.72rem',
            lineHeight: 1.6,
            color: '#E6EDF3',
            whiteSpace: 'pre',
            minHeight: 300,
            maxHeight: 480,
          }}
        >
          {logs ||
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No logs available.
            </Typography>
          }
        </Box>
      )}
    </Box>
  );
}
