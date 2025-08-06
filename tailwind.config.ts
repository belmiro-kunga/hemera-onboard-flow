import type { Config } from "tailwindcss";
import { designSystem } from "./src/lib/design-system/tokens";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	safelist: [
		// Badge system classes
		'ds-badge',
		'ds-badge-sm',
		'ds-badge-md',
		'ds-badge-lg',
		'ds-badge-primary',
		'ds-badge-success',
		'ds-badge-warning',
		'ds-badge-danger',
		'ds-badge-info',
		'ds-badge-secondary',
		'ds-badge-neutral',
		'ds-badge-solid-primary',
		'ds-badge-solid-success',
		'ds-badge-solid-warning',
		'ds-badge-solid-danger',
		'ds-badge-solid-info',
		'ds-badge-solid-secondary',
		'ds-badge-with-icon',
		// Status indicator classes
		'ds-status',
		'ds-status-active',
		'ds-status-inactive',
		'ds-status-pending',
		'ds-status-error',
		'ds-status-processing',
		// Trend indicator classes
		'ds-trend',
		'ds-trend-positive',
		'ds-trend-negative',
		'ds-trend-neutral',
		// Design system component classes
		'ds-sidebar',
		'ds-header',
		'ds-card',
		'ds-button',
		'ds-button-primary',
		'ds-button-secondary',
		'ds-button-sm',
		'ds-button-md',
		'ds-button-lg',
		'ds-chart',
		// Icon system classes
		'ds-icon',
		'ds-icon-xs',
		'ds-icon-sm',
		'ds-icon-md',
		'ds-icon-lg',
		'ds-icon-xl',
		'ds-icon-2xl',
		'ds-icon-thin',
		'ds-icon-normal',
		'ds-icon-thick',
		'ds-icon-primary',
		'ds-icon-secondary',
		'ds-icon-success',
		'ds-icon-warning',
		'ds-icon-danger',
		'ds-icon-info',
		'ds-icon-muted',
		// Feedback system classes
		'ds-notification',
		'ds-notification-success',
		'ds-notification-error',
		'ds-notification-info',
		'ds-notification-warning',
		'ds-toast',
		'ds-toast-success',
		'ds-toast-error',
		'ds-toast-info',
		'ds-toast-warning',
		'ds-alert',
		'ds-alert-success',
		'ds-alert-error',
		'ds-alert-info',
		'ds-alert-warning',
		'ds-feedback-title',
		'ds-feedback-message',
		'ds-feedback-actions',
		'ds-feedback-close',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			// Design System Spacing Tokens (Requirement 4.1) - Expanded
			spacing: {
				'ds-2xs': designSystem.spacing["2xs"],
				'ds-xs': designSystem.spacing.xs,
				'ds-sm': designSystem.spacing.sm,
				'ds-md': designSystem.spacing.md,
				'ds-lg': designSystem.spacing.lg,
				'ds-xl': designSystem.spacing.xl,
				'ds-2xl': designSystem.spacing["2xl"],
				'ds-3xl': designSystem.spacing["3xl"],
				'ds-4xl': designSystem.spacing["4xl"],
			},
			// Design System Layout Tokens (Requirement 4.4)
			width: {
				'sidebar': designSystem.layout.sidebarWidth,
			},
			height: {
				'header': designSystem.layout.headerHeight,
			},
			padding: {
				'content': designSystem.layout.contentPadding,
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				inter: ['Inter', 'sans-serif'],
			},
			fontWeight: {
				regular: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
				extrabold: '800',
			},
			fontSize: {
				// Responsive typography - Mobile first
				'heading-1': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
				'heading-1-tablet': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
				'heading-1-desktop': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
				'heading-1-large': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
				
				'heading-2': ['20px', { lineHeight: '1.3', fontWeight: '700' }],
				'heading-2-tablet': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
				'heading-2-desktop': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
				'heading-2-large': ['28px', { lineHeight: '1.3', fontWeight: '700' }],
				
				'heading-3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
				'heading-3-tablet': ['19px', { lineHeight: '1.4', fontWeight: '600' }],
				'heading-3-desktop': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
				'heading-3-large': ['22px', { lineHeight: '1.4', fontWeight: '600' }],
				
				'heading-4': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
				'heading-4-tablet': ['17px', { lineHeight: '1.4', fontWeight: '600' }],
				'heading-4-desktop': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
				'heading-4-large': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
				
				'heading-5': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
				'heading-5-tablet': ['15px', { lineHeight: '1.5', fontWeight: '500' }],
				'heading-5-desktop': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
				'heading-5-large': ['18px', { lineHeight: '1.5', fontWeight: '500' }],
				
				'heading-6': ['13px', { lineHeight: '1.5', fontWeight: '500' }],
				'heading-6-tablet': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
				'heading-6-desktop': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
				'heading-6-large': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
				
				'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
				'body-large': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
				'small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
				'caption': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
			},
			colors: {
				// Design System Colors - Complete scales from design system
				primary: {
					DEFAULT: designSystem.colors.primary,
					50: designSystem.colors.primaryScale[50],
					100: designSystem.colors.primaryScale[100],
					200: designSystem.colors.primaryScale[200],
					300: designSystem.colors.primaryScale[300],
					400: designSystem.colors.primaryScale[400],
					500: designSystem.colors.primaryScale[500],
					600: designSystem.colors.primaryScale[600],
					700: designSystem.colors.primaryScale[700],
					800: designSystem.colors.primaryScale[800],
					900: designSystem.colors.primaryScale[900],
				},
				secondary: {
					DEFAULT: designSystem.colors.secondary,
					50: designSystem.colors.secondaryScale[50],
					100: designSystem.colors.secondaryScale[100],
					200: designSystem.colors.secondaryScale[200],
					300: designSystem.colors.secondaryScale[300],
					400: designSystem.colors.secondaryScale[400],
					500: designSystem.colors.secondaryScale[500],
					600: designSystem.colors.secondaryScale[600],
					700: designSystem.colors.secondaryScale[700],
					800: designSystem.colors.secondaryScale[800],
					900: designSystem.colors.secondaryScale[900],
				},
				success: {
					DEFAULT: designSystem.colors.success,
					50: designSystem.colors.successScale[50],
					100: designSystem.colors.successScale[100],
					200: designSystem.colors.successScale[200],
					300: designSystem.colors.successScale[300],
					400: designSystem.colors.successScale[400],
					500: designSystem.colors.successScale[500],
					600: designSystem.colors.successScale[600],
					700: designSystem.colors.successScale[700],
					800: designSystem.colors.successScale[800],
					900: designSystem.colors.successScale[900],
				},
				warning: {
					DEFAULT: designSystem.colors.warning,
					50: designSystem.colors.warningScale[50],
					100: designSystem.colors.warningScale[100],
					200: designSystem.colors.warningScale[200],
					300: designSystem.colors.warningScale[300],
					400: designSystem.colors.warningScale[400],
					500: designSystem.colors.warningScale[500],
					600: designSystem.colors.warningScale[600],
					700: designSystem.colors.warningScale[700],
					800: designSystem.colors.warningScale[800],
					900: designSystem.colors.warningScale[900],
				},
				danger: {
					DEFAULT: designSystem.colors.danger,
					50: designSystem.colors.dangerScale[50],
					100: designSystem.colors.dangerScale[100],
					200: designSystem.colors.dangerScale[200],
					300: designSystem.colors.dangerScale[300],
					400: designSystem.colors.dangerScale[400],
					500: designSystem.colors.dangerScale[500],
					600: designSystem.colors.dangerScale[600],
					700: designSystem.colors.dangerScale[700],
					800: designSystem.colors.dangerScale[800],
					900: designSystem.colors.dangerScale[900],
				},
				info: {
					DEFAULT: designSystem.colors.info,
					50: designSystem.colors.primaryScale[50], // Info uses primary scale
					100: designSystem.colors.primaryScale[100],
					200: designSystem.colors.primaryScale[200],
					300: designSystem.colors.primaryScale[300],
					400: designSystem.colors.primaryScale[400],
					500: designSystem.colors.primaryScale[500],
					600: designSystem.colors.primaryScale[600],
					700: designSystem.colors.primaryScale[700],
					800: designSystem.colors.primaryScale[800],
					900: designSystem.colors.primaryScale[900],
				},
				accent: {
					DEFAULT: designSystem.colors.accent,
					50: designSystem.colors.accentScale[50],
					100: designSystem.colors.accentScale[100],
					200: designSystem.colors.accentScale[200],
					300: designSystem.colors.accentScale[300],
					400: designSystem.colors.accentScale[400],
					500: designSystem.colors.accentScale[500],
					600: designSystem.colors.accentScale[600],
					700: designSystem.colors.accentScale[700],
					800: designSystem.colors.accentScale[800],
					900: designSystem.colors.accentScale[900],
				},
				// Semantic colors
				background: '#F9FAFB',
				surface: '#FFFFFF',
				border: '#E5E7EB',
				'text-primary': '#111827',
				'text-secondary': '#6B7280',
				// Legacy HSL-based colors for backward compatibility
				foreground: 'hsl(var(--foreground))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			// Design System Border Radius Tokens (Requirement 4.2)
			borderRadius: {
				'ds-sm': designSystem.radius.sm,
				'ds-md': designSystem.radius.md,
				'ds-lg': designSystem.radius.lg,
				// Keep legacy values for backward compatibility
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			// Design System Elevation/Shadow Tokens (Requirement 4.3)
			boxShadow: {
				'ds-none': designSystem.elevation.none,
				'ds-low': designSystem.elevation.low,
				'ds-medium': designSystem.elevation.medium,
				'ds-high': designSystem.elevation.high,
				// Component-specific shadows (Task 5)
				'ds-card': designSystem.components.card.shadow,
				// Keep legacy values for backward compatibility
				'elegant': 'var(--shadow-lg)',
				'glow': 'var(--shadow-glow)',
				'corporate': 'var(--shadow-md)'
			},
			// Component-specific utilities (Task 5 Implementation)
			backgroundColor: {
				// Sidebar component colors (Requirement 5.1)
				'ds-sidebar': designSystem.components.sidebar.background,
				'ds-sidebar-active': designSystem.components.sidebar.activeItemBackground,
				// Header component colors (Requirement 5.2)
				'ds-header': designSystem.components.header.background,
				// Card component colors (Requirement 5.3)
				'ds-card': designSystem.components.card.background,
				// Button component colors (Requirement 5.4)
				'ds-button-primary': designSystem.components.button.primary.background,
				'ds-button-secondary': designSystem.components.button.secondary.background,
				// Chart component colors (Requirement 5.5)
				'ds-chart-fill-1': designSystem.components.chart.line.fillColors[0],
				'ds-chart-fill-2': designSystem.components.chart.line.fillColors[1],
				'ds-chart-fill-3': designSystem.components.chart.line.fillColors[2],
				'ds-chart-fill-4': designSystem.components.chart.line.fillColors[3],
				'ds-chart-fill-5': designSystem.components.chart.line.fillColors[4],
				'ds-chart-donut-1': designSystem.components.chart.donut.colors[0],
				'ds-chart-donut-2': designSystem.components.chart.donut.colors[1],
				'ds-chart-donut-3': designSystem.components.chart.donut.colors[2],
				'ds-chart-donut-4': designSystem.components.chart.donut.colors[3],
				'ds-chart-donut-5': designSystem.components.chart.donut.colors[4],
				'ds-chart-donut-6': designSystem.components.chart.donut.colors[5],
			},
			textColor: {
				// Sidebar component text colors (Requirement 5.1)
				'ds-sidebar-active': designSystem.components.sidebar.activeItemColor,
				// Button component text colors (Requirement 5.4)
				'ds-button-primary': designSystem.components.button.primary.color,
				'ds-button-secondary': designSystem.components.button.secondary.color,
			},
			borderColor: {
				// Sidebar component border colors (Requirement 5.1)
				'ds-sidebar': designSystem.components.sidebar.border,
				// Header component border colors (Requirement 5.2)
				'ds-header': designSystem.components.header.border,
				// Button component border colors (Requirement 5.4)
				'ds-button-secondary': designSystem.components.button.secondary.border,
				// Chart component colors (Requirement 5.5)
				'ds-chart-line-1': designSystem.components.chart.line.colors[0],
				'ds-chart-line-2': designSystem.components.chart.line.colors[1],
				'ds-chart-line-3': designSystem.components.chart.line.colors[2],
				'ds-chart-line-4': designSystem.components.chart.line.colors[3],
				'ds-chart-line-5': designSystem.components.chart.line.colors[4],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			// Design System Animation Tokens
			transitionDuration: {
				'ds-fast': designSystem.animation.duration.fast,
				'ds-normal': designSystem.animation.duration.normal,
				'ds-slow': designSystem.animation.duration.slow,
				'ds-slower': designSystem.animation.duration.slower,
			},
			transitionTimingFunction: {
				'ds-linear': designSystem.animation.easing.linear,
				'ds-ease-in': designSystem.animation.easing.easeIn,
				'ds-ease-out': designSystem.animation.easing.easeOut,
				'ds-ease-in-out': designSystem.animation.easing.easeInOut,
			},
			transitionDelay: {
				'ds-none': designSystem.animation.delay.none,
				'ds-short': designSystem.animation.delay.short,
				'ds-medium': designSystem.animation.delay.medium,
				'ds-long': designSystem.animation.delay.long,
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
