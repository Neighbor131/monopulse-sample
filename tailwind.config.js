export default {
  content: [
    './index.html',
    './App.tsx',
    './main.tsx',
    './routes.tsx',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './screens/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'surface-hover': 'var(--surface-hover)',
        'line-subtle': 'var(--border-subtle)',
        'line-strong': 'var(--border-strong)',
        'fg-primary': 'var(--fg-primary)',
        'fg-secondary': 'var(--fg-secondary)',
        'fg-muted': 'var(--fg-muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-fg': 'var(--accent-fg)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
};
