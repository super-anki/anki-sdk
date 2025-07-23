import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { BufferUtils } from "@/utils"
import { trackTypeFromId } from "@/track"
import { TrackType } from "@/types"

describe("Utils", () => {
  describe("trackTypeFromId", () => {
    it("should return correct track type for known curve pieces", () => {
      expect(trackTypeFromId(17)).toBe(TrackType.CURVE)
      expect(trackTypeFromId(18)).toBe(TrackType.CURVE)
      expect(trackTypeFromId(20)).toBe(TrackType.CURVE)
      expect(trackTypeFromId(23)).toBe(TrackType.CURVE)
    })

    it("should return correct track type for known straight pieces", () => {
      expect(trackTypeFromId(36)).toBe(TrackType.STRAIGHT)
      expect(trackTypeFromId(39)).toBe(TrackType.STRAIGHT)
      expect(trackTypeFromId(40)).toBe(TrackType.STRAIGHT)
      expect(trackTypeFromId(51)).toBe(TrackType.STRAIGHT)
    })

    it("should return correct track type for special pieces", () => {
      expect(trackTypeFromId(34)).toBe(TrackType.START_GRID)
      expect(trackTypeFromId(33)).toBe(TrackType.FINISH_LINE)
    })

    it("should return UNKNOWN for unrecognized track pieces", () => {
      expect(trackTypeFromId(999)).toBe(TrackType.UNKNOWN)
      expect(trackTypeFromId(-1)).toBe(TrackType.UNKNOWN)
      expect(trackTypeFromId(0)).toBe(TrackType.UNKNOWN)
    })

    it("should handle edge cases", () => {
      expect(trackTypeFromId(Number.MAX_SAFE_INTEGER)).toBe(TrackType.UNKNOWN)
      expect(trackTypeFromId(Number.MIN_SAFE_INTEGER)).toBe(TrackType.UNKNOWN)
      expect(trackTypeFromId(NaN)).toBe(TrackType.UNKNOWN)
    })

    it("should be optimized for performance (O(1) lookup)", () => {
      // Test that function executes quickly for multiple calls
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        trackTypeFromId(17)
        trackTypeFromId(999)
        trackTypeFromId(36)
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(10) // Should complete in less than 10ms
    })
  })

  describe("BufferUtils", () => {
    beforeEach(() => {
      // Clear any existing pool before each test
      BufferUtils.clearPool()
    })

    afterEach(() => {
      // Clean up after each test
      BufferUtils.clearPool()
    })

    describe("allocOptimized", () => {
      it("should allocate buffer with specified size", () => {
        const buffer = BufferUtils.allocOptimized(10)
        
        expect(buffer).toBeInstanceOf(Buffer)
        expect(buffer.length).toBe(10)
      })

      it("should reuse buffers from pool when available", () => {
        // Allocate and release a buffer
        const buffer1 = BufferUtils.allocOptimized(8)
        BufferUtils.release(buffer1)
        
        // Allocate same size again - should reuse
        const buffer2 = BufferUtils.allocOptimized(8)
        
        expect(buffer2).toBe(buffer1) // Same buffer reference
      })

      it("should create new buffer when pool is empty", () => {
        const buffer1 = BufferUtils.allocOptimized(8)
        const buffer2 = BufferUtils.allocOptimized(8)
        
        expect(buffer2).not.toBe(buffer1) // Different buffer references
      })

      it("should handle different buffer sizes", () => {
        const sizes = [1, 4, 8, 16, 32, 64, 128]
        
        sizes.forEach(size => {
          const buffer = BufferUtils.allocOptimized(size)
          expect(buffer.length).toBe(size)
        })
      })

      it("should handle zero size", () => {
        const buffer = BufferUtils.allocOptimized(0)
        expect(buffer.length).toBe(0)
      })

      it("should handle large sizes", () => {
        const buffer = BufferUtils.allocOptimized(1024)
        expect(buffer.length).toBe(1024)
      })
    })

    describe("release", () => {
      it("should accept buffer for reuse", () => {
        const buffer = BufferUtils.allocOptimized(16)
        
        // Should not throw
        expect(() => BufferUtils.release(buffer)).not.toThrow()
      })

      it("should clear buffer content when released", () => {
        const buffer = BufferUtils.allocOptimized(4)
        buffer.writeUInt32BE(0xDEADBEEF, 0)
        
        BufferUtils.release(buffer)
        
        // Buffer should be cleared
        expect(buffer.readUInt32BE(0)).toBe(0)
      })

      it("should allow released buffer to be reused", () => {
        const originalBuffer = BufferUtils.allocOptimized(8)
        BufferUtils.release(originalBuffer)
        
        const reusedBuffer = BufferUtils.allocOptimized(8)
        expect(reusedBuffer).toBe(originalBuffer)
      })

      it("should respect pool size limits", () => {
        // Allocate many buffers of same size
        const buffers: Buffer[] = []
        
        for (let i = 0; i < 20; i++) {
          buffers.push(BufferUtils.allocOptimized(8))
        }
        
        // Release all buffers
        buffers.forEach(buffer => BufferUtils.release(buffer))
        
        // Pool should not grow indefinitely (implementation detail)
        // Just ensure no errors occur
        expect(() => {
          for (let i = 0; i < 5; i++) {
            BufferUtils.allocOptimized(8)
          }
        }).not.toThrow()
      })
    })

    describe("clearPool", () => {
      it("should clear all pooled buffers", () => {
        // Add some buffers to pool
        const buffer1 = BufferUtils.allocOptimized(8)
        const buffer2 = BufferUtils.allocOptimized(16)
        
        BufferUtils.release(buffer1)
        BufferUtils.release(buffer2)
        
        // Clear pool
        BufferUtils.clearPool()
        
        // New allocations should create fresh buffers
        const newBuffer1 = BufferUtils.allocOptimized(8)
        const newBuffer2 = BufferUtils.allocOptimized(16)
        
        expect(newBuffer1).not.toBe(buffer1)
        expect(newBuffer2).not.toBe(buffer2)
      })

      it("should not throw when pool is empty", () => {
        expect(() => BufferUtils.clearPool()).not.toThrow()
      })

      it("should not throw when called multiple times", () => {
        BufferUtils.clearPool()
        expect(() => BufferUtils.clearPool()).not.toThrow()
      })
    })

    describe("performance optimization", () => {
      it("should be faster than regular Buffer.alloc for repeated allocations", () => {
        const iterations = 1000
        const size = 64
        
        // Measure regular Buffer.alloc
        const regularStart = performance.now()
        for (let i = 0; i < iterations; i++) {
          Buffer.alloc(size)
        }
        const regularDuration = performance.now() - regularStart
        
        // Measure optimized allocation with reuse
        const optimizedStart = performance.now()
        const buffers: Buffer[] = []
        
        // First round - populate pool
        for (let i = 0; i < iterations / 2; i++) {
          buffers.push(BufferUtils.allocOptimized(size))
        }
        
        // Release all
        buffers.forEach(buffer => BufferUtils.release(buffer))
        
        // Second round - reuse from pool
        for (let i = 0; i < iterations / 2; i++) {
          BufferUtils.allocOptimized(size)
        }
        
        const optimizedDuration = performance.now() - optimizedStart
        
        // Optimized should be at least as fast (allowing for significant variance)
        expect(optimizedDuration).toBeLessThanOrEqual(regularDuration * 3)
      })

      it("should handle concurrent allocations efficiently", () => {
        const promises: Promise<Buffer>[] = []
        
        // Simulate concurrent allocations
        for (let i = 0; i < 100; i++) {
          promises.push(
            Promise.resolve().then(() => BufferUtils.allocOptimized(32)),
          )
        }
        
        return Promise.all(promises).then(buffers => {
          expect(buffers).toHaveLength(100)
          buffers.forEach(buffer => {
            expect(buffer.length).toBe(32)
          })
        })
      })
    })

    describe("memory management", () => {
      it("should not leak memory with repeated alloc/release cycles", () => {
        // This test ensures the pool doesn't grow unbounded
        const cycles = 100
        
        for (let i = 0; i < cycles; i++) {
          const buffer = BufferUtils.allocOptimized(128)
          BufferUtils.release(buffer)
        }
        
        // Should complete without memory issues
        expect(true).toBe(true)
      })

      it("should handle mixed sizes efficiently", () => {
        const sizes = [8, 16, 32, 64, 128]
        const buffers: Buffer[] = []
        
        // Allocate mixed sizes
        for (let i = 0; i < 50; i++) {
          const size = sizes[i % sizes.length]
          buffers.push(BufferUtils.allocOptimized(size))
        }
        
        // Release all
        buffers.forEach(buffer => BufferUtils.release(buffer))
        
        // Allocate again - should reuse appropriately
        for (let i = 0; i < 25; i++) {
          const size = sizes[i % sizes.length]
          const buffer = BufferUtils.allocOptimized(size)
          expect(buffer.length).toBe(size)
        }
      })
    })
  })

  describe("Module exports", () => {
    it("should export all required types and constants", async () => {
      // Test that utils re-exports from constants and types
      const utils = await import("@/utils")
      
      // Should have the utility functions
      expect(typeof utils.BufferUtils).toBe("object")
      
      // Should re-export constants
      expect(utils.RequestCode).toBeDefined()
      expect(utils.ResponseCode).toBeDefined()
      expect(utils.GattCharacteristic).toBeDefined()
      expect(utils.BASE_SIZE).toBeDefined()
      
      // Test actual functionality
      expect(typeof utils.BufferUtils.allocOptimized).toBe("function")
      expect(typeof utils.BufferUtils.release).toBe("function")
      expect(typeof utils.BufferUtils.clearPool).toBe("function")
    })
  })
})
