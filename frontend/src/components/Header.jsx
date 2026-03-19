import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Header() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#161B22',
        borderBottom: '1px solid #30363D',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ minHeight: 56 }}>
        <HubIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #4FC3F7, #B39DDB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          KubePulse
        </Typography>
        <Chip
          label="READ ONLY"
          size="small"
          sx={{
            ml: 1.5,
            fontSize: '0.65rem',
            height: 18,
            backgroundColor: 'rgba(86, 211, 100, 0.12)',
            color: 'success.main',
            border: '1px solid rgba(86, 211, 100, 0.3)',
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
          AKS Monitor
        </Typography>
        <Tooltip title="View on GitHub">
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
