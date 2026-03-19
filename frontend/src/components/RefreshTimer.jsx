import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Tooltip,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const REFRESH_INTERVAL = 10000;

export default function RefreshTimer({
  lastRefreshed,
  autoRefresh,
  onToggle,
  onRefresh,
}) {
  const [progress, setProgress] = useState(0);
  const [relTime, setRelTime] = useState('');

  useEffect(() => {
    if (!autoRefresh) {
      setProgress(0);
      return;
    }
    const startTime = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / REFRESH_INTERVAL) * 100, 100));
    }, 200);
    return () => clearInterval(tick);
  }, [autoRefresh, lastRefreshed]);

  useEffect(() => {
    if (!lastRefreshed) return;
    const update = () => setRelTime(dayjs(lastRefreshed).fromNow());
    update();
    const timer = setInterval(update, 5000);
    return () => clearInterval(timer);
  }, [lastRefreshed]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {lastRefreshed && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Updated {relTime}
        </Typography>
      )}
      <Tooltip title="Refresh now">
        <IconButton size="small" onClick={onRefresh} sx={{ color: 'primary.main' }}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <FormControlLabel
        control={
          <Switch
            checked={autoRefresh}
            onChange={(e) => onToggle(e.target.checked)}
            size="small"
            color="primary"
          />
        }
        label={
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Auto (10s)
          </Typography>
        }
        sx={{ m: 0 }}
      />
      {autoRefresh && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: 60,
            height: 3,
            borderRadius: 2,
            backgroundColor: '#30363D',
            '& .MuiLinearProgress-bar': { borderRadius: 2 },
          }}
        />
      )}
    </Box>
  );
}
