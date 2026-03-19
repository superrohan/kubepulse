import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';

function StatCard({ icon, label, count, color }) {
  return (
    <Paper
      sx={{
        px: 2.5,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flex: 1,
        minWidth: 140,
      }}
    >
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color, lineHeight: 1.1 }}
        >
          {count}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function StatsBar({ pods }) {
  const running = pods.filter((p) => p.status === 'Running').length;
  const crashLoop = pods.filter((p) => p.status === 'CrashLoopBackOff').length;
  const pending = pods.filter((p) => p.status === 'Pending').length;
  const failed = pods.filter(
    (p) => p.status === 'Failed' || p.status === 'Error'
  ).length;

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <StatCard
        icon={<CheckCircleOutlineIcon />}
        label="Running"
        count={running}
        color="#56D364"
      />
      <StatCard
        icon={<SyncProblemIcon />}
        label="CrashLoop"
        count={crashLoop}
        color="#F85149"
      />
      <StatCard
        icon={<HourglassEmptyIcon />}
        label="Pending"
        count={pending}
        color="#E3B341"
      />
      <StatCard
        icon={<ErrorOutlineIcon />}
        label="Failed"
        count={failed}
        color="#F85149"
      />
      <StatCard
        icon={<CheckCircleOutlineIcon sx={{ color: '#8B949E' }} />}
        label="Total Pods"
        count={pods.length}
        color="#8B949E"
      />
    </Box>
  );
}
