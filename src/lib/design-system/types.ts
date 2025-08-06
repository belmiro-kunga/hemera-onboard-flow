/**
 * Design System Types
 * 
 * This file contains all TypeScript interfaces for design token categories
 * as specified in the design system requirements.
 */

export interface TypographyTokens {
  fontFamily: string;
  fontWeights: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  headings: {
    h1: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
    h2: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
    h3: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
    h4: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
    h5: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
    h6: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
  };
  body: { fontSize: string; fontWeight: string; lineHeight: string; responsive?: Record<string, string> };
  small: { fontSize: string; fontWeight: string; lineHeight: string };
  caption: { fontSize: string; fontWeight: string; lineHeight: string };
  breakpoints: Record<string, string>;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorTokens {
  // Base semantic colors
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  accent: string;
  
  // Complete color scales
  primaryScale: ColorScale;
  secondaryScale: ColorScale;
  successScale: ColorScale;
  warningScale: ColorScale;
  dangerScale: ColorScale;
  accentScale: ColorScale;
}

export interface SpacingTokens {
  "2xs": string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface ElevationTokens {
  none: string;
  low: string;
  medium: string;
  high: string;
}

export interface LayoutTokens {
  sidebarWidth: string;
  headerHeight: string;
  contentPadding: string;
}

export interface ComponentState {
  background?: string;
  color?: string;
  borderColor?: string;
  transform?: string;
  shadow?: string;
  outline?: string;
  outlineOffset?: string;
  cursor?: string;
}

export interface ComponentTokens {
  sidebar: {
    background: string;
    border: string;
    activeItemBackground: string;
    activeItemColor: string;
  };
  header: {
    background: string;
    border: string;
    fontSize: string;
    fontWeight: string;
  };
  card: {
    background: string;
    borderRadius: string;
    shadow: string;
    padding: string;
  };
  button: {
    sizes: {
      sm: {
        fontSize: string;
        padding: string;
        borderRadius: string;
      };
      md: {
        fontSize: string;
        padding: string;
        borderRadius: string;
      };
      lg: {
        fontSize: string;
        padding: string;
        borderRadius: string;
      };
    };
    primary: {
      background: string;
      color: string;
      borderRadius: string;
      padding: string;
      hover: ComponentState;
      active: ComponentState;
      focus: ComponentState;
      disabled: ComponentState;
    };
    secondary: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
      hover: ComponentState;
      active: ComponentState;
      focus: ComponentState;
      disabled: ComponentState;
    };
  };
  chart: {
    line: {
      colors: string[];
      fillColors: string[];
      pointRadius: string;
    };
    donut: {
      colors: string[];
    };
  };
  badge: {
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
    transition: string;
    sizes: {
      sm: {
        fontSize: string;
        padding: string;
        borderRadius: string;
      };
      md: {
        fontSize: string;
        padding: string;
        borderRadius: string;
      };
      lg: {
        fontSize: string;
        padding: string;
        borderRadius: string;
      };
    };
    colors: {
      [key: string]: {
        background: string;
        color: string;
        border: string;
      };
    };
    status: {
      [key: string]: {
        background: string;
        color: string;
        border: string;
        indicator: string;
      };
    };
    trends: {
      [key: string]: {
        background: string;
        color: string;
        border: string;
        arrow: string;
      };
    };
    solid: {
      [key: string]: {
        background: string;
        color: string;
        border: string;
      };
    };
  };
}

export interface IconTokens {
  defaultSize: string;
  style: string;
  sizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
  strokeWidth: {
    thin: string;
    normal: string;
    thick: string;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    muted: string;
  };
}

export interface FeedbackTokens {
  notification: {
    success: {
      background: string;
      color: string;
      border: string;
      icon: string;
    };
    error: {
      background: string;
      color: string;
      border: string;
      icon: string;
    };
    info: {
      background: string;
      color: string;
      border: string;
      icon: string;
    };
    warning: {
      background: string;
      color: string;
      border: string;
      icon: string;
    };
  };
  toast: {
    success: {
      background: string;
      color: string;
      border: string;
      shadow: string;
    };
    error: {
      background: string;
      color: string;
      border: string;
      shadow: string;
    };
    info: {
      background: string;
      color: string;
      border: string;
      shadow: string;
    };
    warning: {
      background: string;
      color: string;
      border: string;
      shadow: string;
    };
  };
  alert: {
    success: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
    };
    error: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
    };
    info: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
    };
    warning: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
    };
  };
}

export interface AnimationTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  delay: {
    none: string;
    short: string;
    medium: string;
    long: string;
  };
}

export interface DesignSystem {
  typography: TypographyTokens;
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  elevation: ElevationTokens;
  layout: LayoutTokens;
  components: ComponentTokens;
  icons: IconTokens;
  animation: AnimationTokens;
  feedback: FeedbackTokens;
}