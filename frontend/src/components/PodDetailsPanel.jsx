import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TerminalIcon from '@mui/icons-material/Terminal';
import PodStatusChip from './PodStatusChip';
import LogViewer from './LogViewer';
import { podApi } from '../services/api';
import dayjs from 'dayjs';

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function InfoRow({ label, value }) {
  return (
    <TableRow>
      <TableCell
        sx={{
          color: 'text.secondary',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          width: 130,
          border: 'none',
          py: 0.75,
          pl: 0,
        }}
      >
        {label}
      </TableCell>
      <TableCell
        sx={{
          fontSize: '0.8rem',
          fontFamily: '"JetBrains Mono", monospace',
          border: 'none',
          py: 0.75,
        }}
      >
        {value || '—'}
      </TableCell>
    </TableRow>
  );
}

export default function PodDetailsPanel({ pod, open, onClose }) {
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pod || !open) return;
    setDetail(null);
    setError(null);
    setLoading(true);
    setTab(0);

    podApi
      .getPodDetail(pod.namespace, pod.podName)
      .then((res) => setDetail(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pod, open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', md: 620 },
          backgroundColor: 'background.paper',
          borderLeft: '1px solid #30363D',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid #30363D',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
              {pod?.serviceName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontFamily: '"JetBrains Mono", monospace',
                display: 'block',
                mt: 0.25,
              }}
              noWrap
            >
              {pod?.podName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {pod && <PodStatusChip status={pod.status} />}
              <Chip
                label={pod?.namespace}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(79,195,247,0.08)',
                  color: 'primary.main',
                  border: '1px solid rgba(79,195,247,0.2)',
                }}
              />
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs — Details and Logs only */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 3, borderBottom: '1px solid #30363D', minHeight: 40 }}
          TabIndicatorProps={{ style: { backgroundColor: '#4FC3F7' } }}
        >
          <Tab
            label="Details"
            sx={{ minHeight: 40, textTransform: 'none', fontSize: '0.8rem' }}
          />
          <Tab
            label="Logs"
            icon={<TerminalIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            sx={{ minHeight: 40, textTransform: 'none', fontSize: '0.8rem' }}
          />
        </Tabs>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
              <CircularProgress size={32} />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}

          {detail && (
            <>
              {/* Tab 0 — Details: pod info + containers */}
              <TabPanel value={tab} index={0}>
                <Table size="small" sx={{ mb: 3 }}>
                  <TableBody>
                    <InfoRow label="Namespace" value={detail.namespace} />
                    <InfoRow label="Node" value={detail.node} />
                    <InfoRow label="Status" value={detail.status} />
                    <InfoRow
                      label="Created"
                      value={
                        detail.creationTimestamp
                          ? dayjs(detail.creationTimestamp).format('YYYY-MM-DD HH:mm:ss')
                          : null
                      }
                    />
                  </TableBody>
                </Table>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Containers
                </Typography>

                {detail.containerStatuses?.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No container information available.
                  </Typography>
                )}

                {detail.containerStatuses?.map((cs) => (
                  <Box
                    key={cs.name}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 1,
                      border: '1px solid #30363D',
                      backgroundColor: '#0D1117',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {cs.name}
                      </Typography>
                      <Chip
                        label={cs.state}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          backgroundColor:
                            cs.state === 'Running'
                              ? 'rgba(86,211,100,0.12)'
                              : 'rgba(248,81,73,0.12)',
                          color: cs.state === 'Running' ? '#56D364' : '#F85149',
                          border: `1px solid ${
                            cs.state === 'Running'
                              ? 'rgba(86,211,100,0.3)'
                              : 'rgba(248,81,73,0.3)'
                          }`,
                        }}
                      />
                      <Chip
                        label={`${cs.restartCount} restarts`}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          backgroundColor:
                            cs.restartCount > 0
                              ? 'rgba(248,81,73,0.08)'
                              : 'rgba(86,211,100,0.08)',
                          color: cs.restartCount > 0 ? '#F85149' : '#56D364',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontFamily: '"JetBrains Mono", monospace',
                        display: 'block',
                        wordBreak: 'break-all',
                      }}
                    >
                      {cs.image}
                    </Typography>
                    {cs.reason && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {cs.reason}
                      </Typography>
                    )}
                  </Box>
                ))}
              </TabPanel>

              {/* Tab 1 — Logs */}
              <TabPanel value={tab} index={1}>
                <LogViewer namespace={pod?.namespace} podName={pod?.podName} />
              </TabPanel>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
