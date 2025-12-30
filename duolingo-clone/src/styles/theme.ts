// Duolingo color palette and theme
export const theme = {
  colors: {
    // Primary colors (Duolingo green)
    primary: '#58cc02',
    primaryHover: '#4caf00',
    primaryLight: '#89e219',
    primaryDark: '#46a302',

    // Secondary colors
    secondary: '#1cb0f6',
    secondaryHover: '#0ea5e9',
    
    // Status colors
    success: '#58cc02',
    error: '#ff4b4b',
    warning: '#ffc800',
    info: '#1cb0f6',

    // Hearts and gems
    heart: '#ff4b4b',
    gem: '#1cb0f6',
    xp: '#ffc800',

    // Neutral colors
    white: '#ffffff',
    background: '#ffffff',
    backgroundGray: '#f7f7f7',
    backgroundDark: '#235390',
    
    // Text colors
    text: '#3c3c3c',
    textLight: '#777777',
    textDark: '#235390',
    textWhite: '#ffffff',

    // Border colors
    border: '#e5e5e5',
    borderLight: '#f0f0f0',
    borderDark: '#d0d0d0',

    // Interactive states
    hover: '#f7f7f7',
    active: '#e5e5e5',
    disabled: '#afafaf',
    disabledBackground: '#f5f5f5',

    // League colors
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    diamond: '#b9f2ff',

    // Skill tree colors
    skillLocked: '#e5e5e5',
    skillAvailable: '#58cc02',
    skillCompleted: '#ffc800',
    skillPerfect: '#ff4b4b',
  },

  // Typography
  fonts: {
    primary: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Monaco', 'Consolas', monospace",
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    button: '0 4px 0 0 rgba(0, 0, 0, 0.2)',
    buttonHover: '0 2px 0 0 rgba(0, 0, 0, 0.2)',
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Transitions
  transitions: {
    fast: '0.15s ease-out',
    normal: '0.3s ease-out',
    slow: '0.5s ease-out',
  },
};

export type Theme = typeof theme;