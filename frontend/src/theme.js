import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4FC3F7',
      light: '#81D4FA',
      dark: '#0288D1',
    },
    secondary: {
      main: '#B39DDB',
    },
    background: {
      default: '#0D1117',
      paper: '#161B22',
    },
    success: { main: '#56D364' },
    warning: { main: '#E3B341' },
    error: { main: '#F85149' },
    text: {
      primary: '#E6EDF3',
      secondary: '#8B949E',
    },
    divider: '#30363D',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body2: { fontSize: '0.8125rem' },
    caption: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #30363D',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#161B22',
          color: '#8B949E',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #30363D',
        },
        body: {
          borderBottom: '1px solid #21262D',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(79, 195, 247, 0.04)',
            cursor: 'pointer',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.7rem' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
  },
});
