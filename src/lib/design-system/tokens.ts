/**
 * Design System Tokens
 * 
 * This file contains the main design system configuration object with all token values
 * as specified in the design system requirements and design document.
 */

import type { DesignSystem } from './types';

export const designSystem: DesignSystem = {
  typography: {
    fontFamily: "Inter, sans-serif",
    fontWeights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    // Responsive typography - Mobile first approach
    headings: {
      h1: { 
        fontSize: "24px", 
        fontWeight: "700", 
        lineHeight: "1.2",
        responsive: {
          tablet: "28px",
          desktop: "32px",
          large: "36px"
        }
      },
      h2: { 
        fontSize: "20px", 
        fontWeight: "700", 
        lineHeight: "1.3",
        responsive: {
          tablet: "22px",
          desktop: "24px",
          large: "28px"
        }
      },
      h3: { 
        fontSize: "18px", 
        fontWeight: "600", 
        lineHeight: "1.4",
        responsive: {
          tablet: "19px",
          desktop: "20px",
          large: "22px"
        }
      },
      h4: { 
        fontSize: "16px", 
        fontWeight: "600", 
        lineHeight: "1.4",
        responsive: {
          tablet: "17px",
          desktop: "18px",
          large: "20px"
        }
      },
      h5: { 
        fontSize: "14px", 
        fontWeight: "500", 
        lineHeight: "1.5",
        responsive: {
          tablet: "15px",
          desktop: "16px",
          large: "18px"
        }
      },
      h6: { 
        fontSize: "13px", 
        fontWeight: "500", 
        lineHeight: "1.5",
        responsive: {
          tablet: "14px",
          desktop: "14px",
          large: "16px"
        }
      }
    },
    body: { 
      fontSize: "14px", 
      fontWeight: "400", 
      lineHeight: "1.5",
      responsive: {
        large: "15px"
      }
    },
    small: { fontSize: "12px", fontWeight: "400", lineHeight: "1.4" },
    caption: { fontSize: "11px", fontWeight: "400", lineHeight: "1.3" },
    // Responsive breakpoints
    breakpoints: {
      mobile: "0px",
      tablet: "768px",
      desktop: "1024px",
      large: "1280px"
    }
  },
  colors: {
    // Base semantic colors
    primary: "#3B82F6",
    secondary: "#64748B",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    accent: "#9333EA",
    
    // Complete color scales (50-900)
    primaryScale: {
      50: "#EBF8FF",
      100: "#BEE3F8",
      200: "#90CDF4",
      300: "#63B3ED",
      400: "#4299E1",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A"
    },
    secondaryScale: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A"
    },
    successScale: {
      50: "#D1FAE5",
      100: "#A7F3D0",
      200: "#6EE7B7",
      300: "#34D399",
      400: "#10B981",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B"
    },
    warningScale: {
      50: "#FEF3C7",
      100: "#FDE68A",
      200: "#FCD34D",
      300: "#FBBF24",
      400: "#F59E0B",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F"
    },
    dangerScale: {
      50: "#FEE2E2",
      100: "#FECACA",
      200: "#FCA5A5",
      300: "#F87171",
      400: "#EF4444",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D"
    },
    accentScale: {
      50: "#F3E8FF",
      100: "#E9D5FF",
      200: "#DDD6FE",
      300: "#C4B5FD",
      400: "#A78BFA",
      500: "#9333EA",
      600: "#7C3AED",
      700: "#6D28D9",
      800: "#5B21B6",
      900: "#4C1D95"
    }
  },
  spacing: {
    "2xs": "2px",
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
    "4xl": "96px"
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px"
  },
  elevation: {
    none: "none",
    low: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    high: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
  },
  layout: {
    sidebarWidth: "250px",
    headerHeight: "64px",
    contentPadding: "24px"
  },
  components: {
    sidebar: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      activeItemBackground: "#EBF8FF",
      activeItemColor: "#3B82F6"
    },
    header: {
      background: "#FFFFFF",
      border: "#E5E7EB",
      fontSize: "16px",
      fontWeight: "500"
    },
    card: {
      background: "#FFFFFF",
      borderRadius: "8px",
      shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      padding: "16px"
    },
    button: {
      // Size variants
      sizes: {
        sm: {
          fontSize: "12px",
          padding: "6px 12px",
          borderRadius: "6px"
        },
        md: {
          fontSize: "14px",
          padding: "8px 16px",
          borderRadius: "8px"
        },
        lg: {
          fontSize: "16px",
          padding: "12px 24px",
          borderRadius: "8px"
        }
      },
      primary: {
        background: "#3B82F6",
        color: "#FFFFFF",
        borderRadius: "8px",
        padding: "8px 16px",
        // Component states
        hover: {
          background: "#2563EB",
          transform: "translateY(-1px)",
          shadow: "0 4px 8px rgba(59, 130, 246, 0.3)"
        },
        active: {
          background: "#1D4ED8",
          transform: "translateY(0)",
          shadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
        },
        focus: {
          outline: "2px solid #93C5FD",
          outlineOffset: "2px"
        },
        disabled: {
          background: "#9CA3AF",
          color: "#D1D5DB",
          cursor: "not-allowed",
          transform: "none",
          shadow: "none"
        }
      },
      secondary: {
        background: "#FFFFFF",
        color: "#374151",
        border: "#D1D5DB",
        borderRadius: "8px",
        padding: "8px 16px",
        // Component states
        hover: {
          background: "#F9FAFB",
          borderColor: "#9CA3AF",
          transform: "translateY(-1px)",
          shadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
        },
        active: {
          background: "#F3F4F6",
          borderColor: "#6B7280",
          transform: "translateY(0)",
          shadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
        },
        focus: {
          outline: "2px solid #93C5FD",
          outlineOffset: "2px"
        },
        disabled: {
          background: "#F9FAFB",
          color: "#9CA3AF",
          borderColor: "#E5E7EB",
          cursor: "not-allowed",
          transform: "none",
          shadow: "none"
        }
      }
    },
    chart: {
      line: {
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#9333EA"],
        fillColors: ["rgba(59, 130, 246, 0.1)", "rgba(16, 185, 129, 0.1)", "rgba(245, 158, 11, 0.1)", "rgba(239, 68, 68, 0.1)", "rgba(147, 51, 234, 0.1)"],
        pointRadius: "4px"
      },
      donut: {
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#9333EA", "#64748B"]
      }
    },
    badge: {
      // Base badge styling
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
      padding: "4px 8px",
      transition: "all 0.2s ease-in-out",
      
      // Size variants
      sizes: {
        sm: {
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "8px"
        },
        md: {
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "12px"
        },
        lg: {
          fontSize: "14px",
          padding: "6px 12px",
          borderRadius: "16px"
        }
      },
      
      // Semantic color variants
      colors: {
        primary: {
          background: "#EBF8FF",
          color: "#1E40AF",
          border: "#BFDBFE"
        },
        success: {
          background: "#D1FAE5",
          color: "#065F46",
          border: "#A7F3D0"
        },
        warning: {
          background: "#FEF3C7",
          color: "#92400E",
          border: "#FDE68A"
        },
        danger: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "#FECACA"
        },
        info: {
          background: "#EBF8FF",
          color: "#1E40AF",
          border: "#BFDBFE"
        },
        secondary: {
          background: "#F1F5F9",
          color: "#475569",
          border: "#E2E8F0"
        },
        neutral: {
          background: "#F9FAFB",
          color: "#374151",
          border: "#E5E7EB"
        }
      },
      
      // Status indicators
      status: {
        active: {
          background: "#D1FAE5",
          color: "#065F46",
          border: "#A7F3D0",
          indicator: "#10B981"
        },
        inactive: {
          background: "#F1F5F9",
          color: "#64748B",
          border: "#E2E8F0",
          indicator: "#94A3B8"
        },
        pending: {
          background: "#FEF3C7",
          color: "#92400E",
          border: "#FDE68A",
          indicator: "#F59E0B"
        },
        error: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "#FECACA",
          indicator: "#EF4444"
        },
        processing: {
          background: "#EBF8FF",
          color: "#1E40AF",
          border: "#BFDBFE",
          indicator: "#3B82F6"
        }
      },
      
      // Trend indicators
      trends: {
        positive: {
          background: "#D1FAE5",
          color: "#065F46",
          border: "#A7F3D0",
          arrow: "#10B981"
        },
        negative: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "#FECACA",
          arrow: "#EF4444"
        },
        neutral: {
          background: "#F1F5F9",
          color: "#64748B",
          border: "#E2E8F0",
          arrow: "#94A3B8"
        }
      },
      
      // Solid variants (higher contrast)
      solid: {
        primary: {
          background: "#3B82F6",
          color: "#FFFFFF",
          border: "#3B82F6"
        },
        success: {
          background: "#10B981",
          color: "#FFFFFF",
          border: "#10B981"
        },
        warning: {
          background: "#F59E0B",
          color: "#FFFFFF",
          border: "#F59E0B"
        },
        danger: {
          background: "#EF4444",
          color: "#FFFFFF",
          border: "#EF4444"
        },
        info: {
          background: "#3B82F6",
          color: "#FFFFFF",
          border: "#3B82F6"
        },
        secondary: {
          background: "#64748B",
          color: "#FFFFFF",
          border: "#64748B"
        }
      }
    }
  },
  icons: {
    defaultSize: "20px",
    style: "outline",
    sizes: {
      xs: "12px",
      sm: "16px",
      md: "20px",
      lg: "24px",
      xl: "32px",
      "2xl": "48px"
    },
    strokeWidth: {
      thin: "1",
      normal: "1.5",
      thick: "2"
    },
    colors: {
      primary: "#3B82F6",
      secondary: "#64748B",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#3B82F6",
      muted: "#9CA3AF"
    }
  },
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
      slower: "500ms"
    },
    easing: {
      linear: "linear",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    delay: {
      none: "0ms",
      short: "100ms",
      medium: "200ms",
      long: "500ms"
    }
  },
  feedback: {
    notification: {
      success: {
        background: "#D1FAE5",
        color: "#065F46",
        border: "#A7F3D0",
        icon: "#10B981"
      },
      error: {
        background: "#FEE2E2",
        color: "#991B1B",
        border: "#FECACA",
        icon: "#EF4444"
      },
      info: {
        background: "#EBF8FF",
        color: "#1E40AF",
        border: "#BFDBFE",
        icon: "#3B82F6"
      },
      warning: {
        background: "#FEF3C7",
        color: "#92400E",
        border: "#FDE68A",
        icon: "#F59E0B"
      }
    },
    toast: {
      success: {
        background: "#FFFFFF",
        color: "#065F46",
        border: "#10B981",
        shadow: "0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05)"
      },
      error: {
        background: "#FFFFFF",
        color: "#991B1B",
        border: "#EF4444",
        shadow: "0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)"
      },
      info: {
        background: "#FFFFFF",
        color: "#1E40AF",
        border: "#3B82F6",
        shadow: "0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)"
      },
      warning: {
        background: "#FFFFFF",
        color: "#92400E",
        border: "#F59E0B",
        shadow: "0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)"
      }
    },
    alert: {
      success: {
        background: "#D1FAE5",
        color: "#065F46",
        border: "#A7F3D0",
        borderRadius: "8px",
        padding: "12px 16px"
      },
      error: {
        background: "#FEE2E2",
        color: "#991B1B",
        border: "#FECACA",
        borderRadius: "8px",
        padding: "12px 16px"
      },
      info: {
        background: "#EBF8FF",
        color: "#1E40AF",
        border: "#BFDBFE",
        borderRadius: "8px",
        padding: "12px 16px"
      },
      warning: {
        background: "#FEF3C7",
        color: "#92400E",
        border: "#FDE68A",
        borderRadius: "8px",
        padding: "12px 16px"
      }
    }
  }
};