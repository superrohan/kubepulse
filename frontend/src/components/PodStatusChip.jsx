import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HelpIcon from '@mui/icons-material/Help';
import CancelIcon from '@mui/icons-material/Cancel';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';

const STATUS_CONFIG = {
  Running: {
    color: '#56D364',
    bg: 'rgba(86, 211, 100, 0.12)',
    border: 'rgba(86, 211, 100, 0.3)',
    icon: <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />,
  },
  Pending: {
    color: '#E3B341',
    bg: 'rgba(227, 179, 65, 0.12)',
    border: 'rgba(227, 179, 65, 0.3)',
    icon: <HourglassEmptyIcon sx={{ fontSize: '0.85rem !important' }} />,
  },
  CrashLoopBackOff: {
    color: '#F85149',
    bg: 'rgba(248, 81, 73, 0.12)',
    border: 'rgba(248, 81, 73, 0.3)',
    icon: <SyncProblemIcon sx={{ fontSize: '0.85rem !important' }} />,
  },
  Failed: {
    color: '#F85149',
    bg: 'rgba(248, 81, 73, 0.12)',
    border: 'rgba(248, 81, 73, 0.3)',
    icon: <ErrorIcon sx={{ fontSize: '0.85rem !important' }} />,
  },
  Terminating: {
    color: '#E3B341',
    bg: 'rgba(227, 179, 65, 0.12)',
    border: 'rgba(227, 179, 65, 0.3)',
    icon: <CancelIcon sx={{ fontSize: '0.85rem !important' }} />,
  },
  Succeeded: {
    color: '#8B949E',
    bg: 'rgba(139, 148, 158, 0.12)',
    border: 'rgba(139, 148, 158, 0.3)',
    icon: <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />,
  },
};

const getStatusConfig = (status) => {
  if (!status) return null;
  const exact = STATUS_CONFIG[status];
  if (exact) return exact;
  if (status.startsWith('Init:')) return STATUS_CONFIG['Pending'];
  if (['OOMKilled', 'Error', 'ErrImagePull', 'ImagePullBackOff'].includes(status))
    return STATUS_CONFIG['Failed'];
  return {
    color: '#8B949E',
    bg: 'rgba(139, 148, 158, 0.12)',
    border: 'rgba(139, 148, 158, 0.3)',
    icon: <HelpIcon sx={{ fontSize: '0.85rem !important' }} />,
  };
};

export default function PodStatusChip({ status }) {
  const config = getStatusConfig(status);
  if (!config) return null;

  return (
    <Tooltip title={status} placement="top">
      <Chip
        icon={config.icon}
        label={status}
        size="small"
        sx={{
          color: config.color,
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          '& .MuiChip-icon': { color: `${config.color} !important` },
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.7rem',
          fontWeight: 500,
          maxWidth: 180,
        }}
      />
    </Tooltip>
  );
}
