import { afterEach, beforeEach, vi } from "vitest"

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // Reset all mocks after each test
  vi.resetAllMocks()
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep console.error and console.warn for debugging
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
}

// Setup global test timeout
vi.setConfig({ testTimeout: 10000 })
