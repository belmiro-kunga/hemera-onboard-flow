/**
 * Chart Utilities Tests
 * 
 * Tests for chart styling utilities and functions
 */

import {
  getChartLineColors,
  getChartFillColors,
  getDonutChartColors,
  getChartPointRadius,
  getLineColor,
  getFillColor,
  getDonutColor,
  createChartTheme,
  generateChartCSSProperties,
  getChartColorPalette,
  createChartConfig,
  getChartThemeClasses,
  generateChartLegend
} from '../chart-utils';

describe('Chart Utilities', () => {
  describe('Color getters', () => {
    test('getChartLineColors returns array of colors', () => {
      const colors = getChartLineColors();
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
      expect(colors[0]).toMatch(/^#[0-9A-F]{6}$/i);
    });

    test('getChartFillColors returns array of rgba colors', () => {
      const colors = getChartFillColors();
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
      expect(colors[0]).toMatch(/^rgba\(/);
    });

    test('getDonutChartColors returns array of colors', () => {
      const colors = getDonutChartColors();
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
      expect(colors[0]).toMatch(/^#[0-9A-F]{6}$/i);
    });

    test('getChartPointRadius returns valid CSS value', () => {
      const radius = getChartPointRadius();
      expect(typeof radius).toBe('string');
      expect(radius).toMatch(/^\d+px$/);
    });
  });

  describe('Individual color getters', () => {
    test('getLineColor returns correct color by index', () => {
      const color = getLineColor(0);
      const allColors = getChartLineColors();
      expect(color).toBe(allColors[0]);
    });

    test('getLineColor wraps around for large indices', () => {
      const allColors = getChartLineColors();
      const color = getLineColor(allColors.length);
      expect(color).toBe(allColors[0]);
    });

    test('getFillColor returns correct fill color by index', () => {
      const color = getFillColor(0);
      const allColors = getChartFillColors();
      expect(color).toBe(allColors[0]);
    });

    test('getDonutColor returns correct donut color by index', () => {
      const color = getDonutColor(0);
      const allColors = getDonutChartColors();
      expect(color).toBe(allColors[0]);
    });
  });

  describe('Chart theme creation', () => {
    test('createChartTheme returns complete theme object', () => {
      const theme = createChartTheme();
      expect(theme).toHaveProperty('lineColors');
      expect(theme).toHaveProperty('fillColors');
      expect(theme).toHaveProperty('donutColors');
      expect(theme).toHaveProperty('pointRadius');
      expect(Array.isArray(theme.lineColors)).toBe(true);
      expect(Array.isArray(theme.fillColors)).toBe(true);
      expect(Array.isArray(theme.donutColors)).toBe(true);
    });
  });

  describe('CSS properties generation', () => {
    test('generateChartCSSProperties returns CSS custom properties', () => {
      const properties = generateChartCSSProperties();
      expect(typeof properties).toBe('object');
      expect(properties).toHaveProperty('--chart-line-color-1');
      expect(properties).toHaveProperty('--chart-fill-color-1');
      expect(properties).toHaveProperty('--chart-donut-color-1');
      expect(properties).toHaveProperty('--chart-point-radius');
    });
  });

  describe('Chart color palette', () => {
    test('getChartColorPalette returns line colors by default', () => {
      const palette = getChartColorPalette();
      const lineColors = getChartLineColors();
      expect(palette).toEqual(lineColors);
    });

    test('getChartColorPalette returns donut colors when specified', () => {
      const palette = getChartColorPalette('donut');
      const donutColors = getDonutChartColors();
      expect(palette).toEqual(donutColors);
    });
  });

  describe('Chart configuration', () => {
    test('createChartConfig returns line chart config by default', () => {
      const config = createChartConfig();
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('fill');
      expect(config).toHaveProperty('markers');
      expect(config).toHaveProperty('stroke');
    });

    test('createChartConfig returns donut chart config when specified', () => {
      const config = createChartConfig('donut');
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('plotOptions');
    });
  });

  describe('Chart theme classes', () => {
    test('getChartThemeClasses returns container classes by default', () => {
      const classes = getChartThemeClasses();
      expect(Array.isArray(classes)).toBe(true);
      expect(classes).toContain('ds-chart-container');
    });

    test('getChartThemeClasses returns line classes when specified', () => {
      const classes = getChartThemeClasses('line');
      expect(classes).toContain('ds-chart-container');
      expect(classes).toContain('ds-chart-line');
    });
  });

  describe('Chart legend generation', () => {
    test('generateChartLegend returns legend items', () => {
      const labels = ['Series 1', 'Series 2', 'Series 3'];
      const legend = generateChartLegend(labels);
      
      expect(Array.isArray(legend)).toBe(true);
      expect(legend).toHaveLength(3);
      expect(legend[0]).toHaveProperty('label', 'Series 1');
      expect(legend[0]).toHaveProperty('color');
      expect(legend[0]).toHaveProperty('className');
    });

    test('generateChartLegend works with donut type', () => {
      const labels = ['Segment 1', 'Segment 2'];
      const legend = generateChartLegend(labels, 'donut');
      
      expect(legend[0].className).toMatch(/ds-chart-donut-/);
    });
  });
});