import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Chip,
} from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';

const NAMESPACE_COLORS = {
  prod: '#F85149',
  uat: '#E3B341',
  qa: '#B39DDB',
  dev: '#56D364',
};

export default function NamespaceFilter({ namespaces, selected, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel sx={{ color: 'text.secondary' }}>Namespace</InputLabel>
      <Select
        value={selected}
        label="Namespace"
        onChange={(e) => onChange(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#30363D',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        }}
        startAdornment={
          <LayersIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
        }
        renderValue={(value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {value === 'all' ? (
              <span>All Namespaces</span>
            ) : (
              <Chip
                label={value}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.7rem',
                  backgroundColor: NAMESPACE_COLORS[value]
                    ? `${NAMESPACE_COLORS[value]}22`
                    : 'rgba(79, 195, 247, 0.12)',
                  color: NAMESPACE_COLORS[value] || 'primary.main',
                  border: `1px solid ${NAMESPACE_COLORS[value] || '#4FC3F7'}44`,
                }}
              />
            )}
          </Box>
        )}
      >
        <MenuItem value="all">All Namespaces</MenuItem>
        {namespaces.map((ns) => (
          <MenuItem key={ns} value={ns}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: NAMESPACE_COLORS[ns] || '#4FC3F7',
                }}
              />
              {ns}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
