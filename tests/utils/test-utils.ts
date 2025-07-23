import { vi, expect } from "vitest"

// Test utilities for common patterns
export class TestUtils {
  // Create a promise that resolves after a delay
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Create a buffer with specific content for testing
  static createTestBuffer(data: number[]): Buffer {
    return Buffer.from(data)
  }

  // Create a mock function that resolves with a value
  static createResolvingMock<T>(value: T, delay = 0): ReturnType<typeof vi.fn> {
    return vi.fn().mockImplementation(() => 
      delay > 0 ? 
        new Promise(resolve => setTimeout(() => resolve(value), delay)) :
        Promise.resolve(value),
    )
  }

  // Create a mock function that rejects with an error
  static createRejectingMock(error: Error, delay = 0): ReturnType<typeof vi.fn> {
    return vi.fn().mockImplementation(() => 
      delay > 0 ?
        new Promise((_, reject) => setTimeout(() => reject(error), delay)) :
        Promise.reject(error),
    )
  }

  // Create a callback mock that calls the callback with specific arguments
  static createCallbackMock(args: unknown[], delay = 0): ReturnType<typeof vi.fn> {
    return vi.fn().mockImplementation((callback: (...args: unknown[]) => void) => {
      if (delay > 0) {
        setTimeout(() => callback(...args), delay)
      } else {
        callback(...args)
      }
    })
  }

  // Assert that a mock was called with specific arguments
  static expectCalledWith(mockFn: ReturnType<typeof vi.fn>, ...args: unknown[]): void {
    expect(mockFn).toHaveBeenCalledWith(...args)
  }

  // Assert that a mock was called a specific number of times
  static expectCalledTimes(mockFn: ReturnType<typeof vi.fn>, times: number): void {
    expect(mockFn).toHaveBeenCalledTimes(times)
  }

  // Wait for all pending promises to resolve
  static async flushPromises(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  // Create a mock implementation that tracks calls
  static createTrackingMock(): {
    mock: ReturnType<typeof vi.fn>
    getCalls: () => unknown[][]
    getCallCount: () => number
    reset: () => void
    } {
    const calls: unknown[][] = []
    const mock = vi.fn().mockImplementation((...args: unknown[]) => {
      calls.push(args)
    })

    return {
      mock,
      getCalls: () => [...calls],
      getCallCount: () => calls.length,
      reset: () => {
        calls.length = 0
        mock.mockReset()
      },
    }
  }
}

// Common test data generators
export class TestDataGenerator {
  static createAnkiMessage(messageId: number, payload?: Buffer): Buffer {
    const defaultPayload = payload || Buffer.from([0x05, messageId, 0x00, 0x00, 0x00, 0x00])
    return defaultPayload
  }

  static createVersionResponse(): Buffer {
    return Buffer.from([0x04, 0x19, 0x88, 0x13]) // Version response: 5000
  }

  static createBatteryResponse(level: number): Buffer {
    const levelBytes = Buffer.allocUnsafe(2)
    levelBytes.writeUInt16LE(level, 0)
    return Buffer.from([0x04, 0x1b, levelBytes[0], levelBytes[1]])
  }

  static createPingResponse(): Buffer {
    return Buffer.from([0x02, 0x17]) // Simple ping response
  }

  static createPositionUpdate(roadPieceId: number, parsingFlags = 0x47): Buffer {
    return Buffer.from([
      0x11, 0x27, // Size and message ID
      0x01, roadPieceId, // Location ID and road piece ID
      0x00, 0x00, 0x00, 0x00, // Offset from road center (float)
      0x00, 0x00, // Speed
      parsingFlags, // Parsing flags
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Other fields
    ])
  }

  static createTransitionUpdate(uphillCounter = 0, downhillCounter = 0): Buffer {
    return Buffer.from([
      0x12, 0x29, // Size and message ID
      0x01, 0x02, // Road piece IDs
      0x00, 0x00, 0x00, 0x00, // Offset
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Lane change data
      uphillCounter, downhillCounter, // Elevation counters
      0x00, 0x00, // Wheel distances
    ])
  }
}

// Mock timers utility
export class MockTimers {
  static setup(): void {
    vi.useFakeTimers()
  }

  static teardown(): void {
    vi.useRealTimers()
  }

  static advanceTime(ms: number): void {
    vi.advanceTimersByTime(ms)
  }

  static runAllTimers(): void {
    vi.runAllTimers()
  }
}

// Simple utility for waiting/delays in tests
export const waitFor = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))
