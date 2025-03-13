export const colors = {
  // Base colors
  primary: '#FFFFFF',
  
  // Accent colors
  accent: {
    primary: '#89DFC2',   // Mint green
    primaryLight: '#C5EED9',
    secondary: '#FF69B4'  // Hot pink
  },

  // Utility colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#FFFFFF'
  },

  // Status colors
  status: {
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500'
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F8F8'
  }
} as const

export type Colors = typeof colors 