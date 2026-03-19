import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Box,
  Chip,
  Skeleton,
} from '@mui/material';
import PodStatusChip from './PodStatusChip';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const COLUMNS = [
  { id: 'serviceName', label: 'Service', sortable: true },
  { id: 'podName', label: 'Pod Name', sortable: true },
  { id: 'namespace', label: 'Namespace', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'readyContainers', label: 'Ready', sortable: false },
  { id: 'restartCount', label: 'Restarts', sortable: true },
  { id: 'node', label: 'Node', sortable: true },
  { id: 'creationTimestamp', label: 'Age', sortable: true },
];

function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] ?? '';
  const valB = b[orderBy] ?? '';
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function PodTable({ pods, loading, onPodClick }) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('serviceName');

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedPods = useMemo(
    () => [...pods].sort(getComparator(order, orderBy)),
    [pods, order, orderBy]
  );

  if (loading) {
    return (
      <Paper>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (!loading && pods.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          No pods found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Try changing the namespace filter or search query.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.id} sortDirection={orderBy === col.id ? order : false}>
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={() => handleSort(col.id)}
                    sx={{ '& .MuiTableSortLabel-icon': { color: 'text.secondary !important' } }}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedPods.map((pod) => (
            <PodRow key={`${pod.namespace}/${pod.podName}`} pod={pod} onClick={onPodClick} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PodRow({ pod, onClick }) {
  const isCritical = ['CrashLoopBackOff', 'Failed', 'Error'].includes(pod.status);

  return (
    <TableRow
      onClick={() => onClick(pod)}
      sx={{
        borderLeft: isCritical ? '3px solid #F85149' : '3px solid transparent',
        transition: 'background-color 0.15s',
      }}
    >
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {pod.serviceName}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="caption"
          sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'text.secondary' }}
        >
          {pod.podName}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={pod.namespace}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.65rem',
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
            color: 'primary.main',
            border: '1px solid rgba(79, 195, 247, 0.2)',
          }}
        />
      </TableCell>
      <TableCell>
        <PodStatusChip status={pod.status} />
      </TableCell>
      <TableCell>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            color: pod.ready ? 'success.main' : 'warning.main',
          }}
        >
          {pod.readyContainers}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            color: pod.restartCount > 0 ? 'error.main' : 'text.primary',
            fontWeight: pod.restartCount > 5 ? 700 : 400,
          }}
        >
          {pod.restartCount}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontFamily: '"JetBrains Mono", monospace' }}
        >
          {pod.node || '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {pod.creationTimestamp ? dayjs(pod.creationTimestamp).fromNow() : '—'}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
