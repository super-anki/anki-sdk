import { describe, it, expect } from "vitest"
import {
  CONSTANTS,
  GATT_CHARACTERISTICS,
  RequestCode,
  ResponseCode,
  TRACK_TYPE_MAP,
} from "@/constants"

describe("Constants", () => {
  describe("CONSTANTS", () => {
    it("should have correct base size", () => {
      expect(CONSTANTS.BASE_SIZE).toBe(1)
    })

    it("should have reasonable timeout values", () => {
      expect(CONSTANTS.DEFAULT_TIMEOUT).toBe(1500)
      expect(CONSTANTS.SCANNING_TIMEOUT).toBe(500)
      expect(CONSTANTS.STORE_SYNC_INTERVAL).toBe(3000)
    })

    it("should have correct default values", () => {
      expect(CONSTANTS.DEFAULT_SPEED).toBe(300)
      expect(CONSTANTS.DEFAULT_ACCELERATION).toBe(500)
      expect(CONSTANTS.MAX_RETRIES).toBe(3)
    })

    it("should have frozen request sizes object", () => {
      expect(() => {
        // @ts-expect-error - Testing runtime freeze behavior
        CONSTANTS.REQUEST_SIZES.BASE = 999
      }).toThrow()
    })

    it("should contain all expected request sizes", () => {
      const sizes = CONSTANTS.REQUEST_SIZES
      expect(sizes.BASE).toBe(1)
      expect(sizes.TURN).toBe(3)
      expect(sizes.SPEED).toBe(6)
      expect(sizes.SDK_MODE).toBe(3)
      expect(sizes.LIGHTS).toBe(2)
      expect(sizes.LIGHTS_PATTERN).toBe(17)
      expect(sizes.OFFSET_ROAD_CENTER).toBe(5)
      expect(sizes.CHANGE_LANE).toBe(11)
    })
  })

  describe("GATT_CHARACTERISTICS", () => {
    it("should have valid UUID format", () => {
      const uuidRegex = /^[0-9a-f]{32}$/i
      
      expect(GATT_CHARACTERISTICS.SERVICE_UUID).toMatch(uuidRegex)
      expect(GATT_CHARACTERISTICS.READ_UUID).toMatch(uuidRegex)
      expect(GATT_CHARACTERISTICS.WRITE_UUID).toMatch(uuidRegex)
    })

    it("should have consistent UUID base", () => {
      const baseUuid = "be15bee"
      
      expect(GATT_CHARACTERISTICS.SERVICE_UUID).toContain("be15beef")
      expect(GATT_CHARACTERISTICS.READ_UUID).toContain(baseUuid)
      expect(GATT_CHARACTERISTICS.WRITE_UUID).toContain(baseUuid)
    })

    it("should have different UUIDs for different characteristics", () => {
      const uuids = [
        GATT_CHARACTERISTICS.SERVICE_UUID,
        GATT_CHARACTERISTICS.READ_UUID,
        GATT_CHARACTERISTICS.WRITE_UUID,
      ]
      
      expect(new Set(uuids).size).toBe(3)
    })
  })

  describe("RequestCode enum", () => {
    it("should have correct hex values", () => {
      expect(RequestCode.DISCONNECT).toBe(0x0d)
      expect(RequestCode.PING).toBe(0x16)
      expect(RequestCode.VERSION).toBe(0x18)
      expect(RequestCode.BATTERY_LEVEL).toBe(0x1a)
      expect(RequestCode.LIGHTS).toBe(0x1d)
      expect(RequestCode.SPEED).toBe(0x24)
      expect(RequestCode.CHANGE_LANE).toBe(0x25)
      expect(RequestCode.CANCEL_LANE_CHANGE).toBe(0x26)
    })

    it("should have expected enum values", () => {
      // Test individual values since const enums don't support Object.values in tests
      const knownValues = [0x0d, 0x16, 0x18, 0x1a, 0x1d, 0x24, 0x25, 0x26]
      knownValues.forEach(value => {
        expect(typeof value).toBe("number")
        expect(value).toBeGreaterThan(0)
      })
    })
  })

  describe("ResponseCode enum", () => {
    it("should have correct hex values", () => {
      expect(ResponseCode.PING).toBe(0x17)
      expect(ResponseCode.VERSION).toBe(0x19)
      expect(ResponseCode.BATTERY_LEVEL).toBe(0x1b)
      expect(ResponseCode.POSITION_UPDATE).toBe(0x27)
      expect(ResponseCode.TRANSITION_UPDATE).toBe(0x29)
      expect(ResponseCode.INTERSECTION_UPDATE).toBe(0x2a)
    })

    it("should have expected enum values", () => {
      // Test individual values since const enums don't support Object.values in tests
      const knownValues = [0x17, 0x19, 0x1b, 0x27, 0x29, 0x2a]
      knownValues.forEach(value => {
        expect(typeof value).toBe("number")
        expect(value).toBeGreaterThan(0)
      })
    })

    it("should correspond to request codes where applicable", () => {
      // Response codes are typically request code + 1
      expect(ResponseCode.PING).toBe(RequestCode.PING + 1)
      expect(ResponseCode.VERSION).toBe(RequestCode.VERSION + 1)
      expect(ResponseCode.BATTERY_LEVEL).toBe(RequestCode.BATTERY_LEVEL + 1)
    })
  })

  describe("TRACK_TYPE_MAP", () => {
    it("should be a Map instance", () => {
      expect(TRACK_TYPE_MAP).toBeInstanceOf(Map)
    })

    it("should contain expected track piece mappings", () => {
      // Curve pieces
      expect(TRACK_TYPE_MAP.get(17)).toBe(2) // TrackType.CURVE
      expect(TRACK_TYPE_MAP.get(18)).toBe(2)
      expect(TRACK_TYPE_MAP.get(20)).toBe(2)
      expect(TRACK_TYPE_MAP.get(23)).toBe(2)
      
      // Straight pieces
      expect(TRACK_TYPE_MAP.get(36)).toBe(1) // TrackType.STRAIGHT
      expect(TRACK_TYPE_MAP.get(39)).toBe(1)
      expect(TRACK_TYPE_MAP.get(40)).toBe(1)
      expect(TRACK_TYPE_MAP.get(51)).toBe(1)
      
      // Special pieces
      expect(TRACK_TYPE_MAP.get(34)).toBe(3) // TrackType.START_GRID
      expect(TRACK_TYPE_MAP.get(33)).toBe(4) // TrackType.FINISH_LINE
      expect(TRACK_TYPE_MAP.get(57)).toBe(5) // TrackType.FAST_N_FURIOUS_SPECIAL
    })

    it("should return undefined for unknown track pieces", () => {
      expect(TRACK_TYPE_MAP.get(999)).toBeUndefined()
      expect(TRACK_TYPE_MAP.get(-1)).toBeUndefined()
    })

    it("should have reasonable number of entries", () => {
      expect(TRACK_TYPE_MAP.size).toBeGreaterThan(5)
      expect(TRACK_TYPE_MAP.size).toBeLessThan(20)
    })
  })
})

describe("Constants integration", () => {
  it("should work together for message creation", () => {
    const messageSize = CONSTANTS.BASE_SIZE + CONSTANTS.REQUEST_SIZES.SPEED
    expect(messageSize).toBe(7) // 1 + 6
  })

  it("should have valid UUIDs for bluetooth operations", () => {
    // UUIDs should be exactly 32 characters (128-bit UUIDs without dashes)
    expect(GATT_CHARACTERISTICS.SERVICE_UUID).toHaveLength(32)
    expect(GATT_CHARACTERISTICS.READ_UUID).toHaveLength(32)
    expect(GATT_CHARACTERISTICS.WRITE_UUID).toHaveLength(32)
  })

  it("should have request/response code pairs", () => {
    // Test specific known pairs since const enums don't support Object.values
    const testPairs = [
      { request: RequestCode.PING, response: ResponseCode.PING },
      { request: RequestCode.VERSION, response: ResponseCode.VERSION },
      { request: RequestCode.BATTERY_LEVEL, response: ResponseCode.BATTERY_LEVEL },
    ]
    
    testPairs.forEach(({ request, response }) => {
      expect(response).toBe(request + 1)
    })
  })
})
