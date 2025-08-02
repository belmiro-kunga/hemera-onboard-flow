// Test setup file for Vitest

import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'hemera_db';
  process.env.DB_USER = 'hemera_user';
  process.env.DB_PASSWORD = 'hemera_password';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';

  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  
  // Keep error logs for debugging
  const originalError = console.error;
  vi.spyOn(console, 'error').mockImplementation((...args) => {
    if (process.env.VITEST_DEBUG) {
      originalError(...args);
    }
  });
});

afterAll(() => {
  // Restore console methods
  vi.restoreAllMocks();
});

// Mock localStorage for browser environment
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock URL.createObjectURL for file upload tests
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
  writable: true,
});

// Mock URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock performance.now for performance tests
if (!global.performance) {
  global.performance = {
    now: vi.fn(() => Date.now()),
  } as any;
}

// Increase timeout for database operations
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
});