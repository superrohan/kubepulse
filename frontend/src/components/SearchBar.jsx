import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton } from '@mui/material';

export default function SearchBar({ value, onChange }) {
  return (
    <TextField
      size="small"
      placeholder="Search pods or services…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        minWidth: 280,
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#30363D' },
          '&:hover fieldset': { borderColor: 'primary.main' },
          '&.Mui-focused fieldset': { borderColor: 'primary.main' },
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange('')} edge="end">
              <ClearIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </IconButton>
          </InputAdornment>
        ) : null,
        sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' },
      }}
    />
  );
}
