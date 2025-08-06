/**
 * Chart Utilities
 * 
 * This file contains utilities for accessing chart styling tokens and creating
 * consistent visualization styling as specified in requirement 5.5.
 */

import { designSystem } from './tokens';

export interface ChartTheme {
  lineColors: string[];
  fillColors: string[];
  donutColors: string[];
  pointRadius: string;
}

/**
 * Get chart line colors from design system
 */
export function getChartLineColors(): string[] {
  return designSystem.components.chart.line.colors;
}

/**
 * Get chart fill colors from design system
 */
export function getChartFillColors(): string[] {
  return designSystem.components.chart.line.fillColors;
}

/**
 * Get donut chart colors from design system
 */
export function getDonutChartColors(): string[] {
  return designSystem.components.chart.donut.colors;
}

/**
 * Get chart point radius from design system
 */
export function getChartPointRadius(): string {
  return designSystem.components.chart.line.pointRadius;
}

/**
 * Get a specific line color by index
 */
export function getLineColor(index: number): string {
  const colors = getChartLineColors();
  return colors[index % colors.length];
}

/**
 * Get a specific fill color by index
 */
export function getFillColor(index: number): string {
  const colors = getChartFillColors();
  return colors[index % colors.length];
}

/**
 * Get a specific donut color by index
 */
export function getDonutColor(index: number): string {
  const colors = getDonutChartColors();
  return colors[index % colors.length];
}

/**
 * Create a complete chart theme object
 */
export function createChartTheme(): ChartTheme {
  return {
    lineColors: getChartLineColors(),
    fillColors: getChartFillColors(),
    donutColors: getDonutChartColors(),
    pointRadius: getChartPointRadius()
  };
}

/**
 * Generate CSS custom properties for chart colors
 */
export function generateChartCSSProperties(): Record<string, string> {
  const lineColors = getChartLineColors();
  const fillColors = getChartFillColors();
  const donutColors = getDonutChartColors();
  
  const properties: Record<string, string> = {};
  
  // Line colors
  lineColors.forEach((color, index) => {
    properties[`--chart-line-color-${index + 1}`] = color;
  });
  
  // Fill colors
  fillColors.forEach((color, index) => {
    properties[`--chart-fill-color-${index + 1}`] = color;
  });
  
  // Donut colors
  donutColors.forEach((color, index) => {
    properties[`--chart-donut-color-${index + 1}`] = color;
  });
  
  // Point radius
  properties['--chart-point-radius'] = getChartPointRadius();
  
  return properties;
}

/**
 * Generate chart color palette for data visualization libraries
 */
export function getChartColorPalette(type: 'line' | 'donut' = 'line'): string[] {
  return type === 'line' ? getChartLineColors() : getDonutChartColors();
}

/**
 * Create chart configuration object for popular charting libraries
 */
export function createChartConfig(type: 'line' | 'donut' = 'line') {
  const theme = createChartTheme();
  
  if (type === 'line') {
    return {
      colors: theme.lineColors,
      fill: {
        colors: theme.fillColors,
        opacity: 0.1
      },
      markers: {
        size: parseInt(theme.pointRadius.replace('px', ''))
      },
      stroke: {
        width: 2,
        curve: 'smooth' as const
      }
    };
  }
  
  if (type === 'donut') {
    return {
      colors: theme.donutColors,
      plotOptions: {
        pie: {
          donut: {
            size: '60%'
          }
        }
      }
    };
  }
  
  return {};
}

/**
 * Utility to apply chart theme classes to elements
 */
export function getChartThemeClasses(type: 'line' | 'donut' | 'container' = 'container'): string[] {
  const baseClasses = ['ds-chart-container'];
  
  if (type === 'line') {
    return [...baseClasses, 'ds-chart-line'];
  }
  
  if (type === 'donut') {
    return baseClasses;
  }
  
  return baseClasses;
}

/**
 * Generate legend items for charts
 */
export function generateChartLegend(labels: string[], type: 'line' | 'donut' = 'line'): Array<{
  label: string;
  color: string;
  className: string;
}> {
  const colors = type === 'line' ? getChartLineColors() : getDonutChartColors();
  
  return labels.map((label, index) => ({
    label,
    color: colors[index % colors.length],
    className: `ds-chart-${type}-${(index % colors.length) + 1}`
  }));
}