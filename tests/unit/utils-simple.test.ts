import { describe, it, expect } from "vitest"
import {
  GattCharacteristic,
  BASE_SIZE,
  RequestCode,
  ResponseCode,
} from "@/utils"

describe("Utils", () => {
  describe("GattCharacteristic enum", () => {
    it("should have valid UUID format", () => {
      const uuidRegex = /^[0-9a-f]{32}$/i
      
      expect(GattCharacteristic.SERVICE_UUID).toMatch(uuidRegex)
      expect(GattCharacteristic.READ_UUID).toMatch(uuidRegex)
      expect(GattCharacteristic.WRITE_UUID).toMatch(uuidRegex)
    })

    it("should have consistent UUID base", () => {
      const baseUuid = "be15bee"
      
      expect(GattCharacteristic.SERVICE_UUID).toContain("be15beef")
      expect(GattCharacteristic.READ_UUID).toContain(baseUuid)
      expect(GattCharacteristic.WRITE_UUID).toContain(baseUuid)
    })

    it("should have different UUIDs for different characteristics", () => {
      const uuids = [
        GattCharacteristic.SERVICE_UUID,
        GattCharacteristic.READ_UUID,
        GattCharacteristic.WRITE_UUID,
      ]
      
      expect(new Set(uuids).size).toBe(3)
    })
  })

  describe("BASE_SIZE constant", () => {
    it("should be a positive number", () => {
      expect(typeof BASE_SIZE).toBe("number")
      expect(BASE_SIZE).toBeGreaterThan(0)
      expect(BASE_SIZE).toBe(1)
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

    it("should have additional command codes", () => {
      expect(RequestCode.SET_OFFSET_FROM_ROAD_CENTER).toBe(0x2c)
      expect(RequestCode.TURN).toBe(0x32)
      expect(RequestCode.LIGHTS_PATTERN).toBe(0x33)
      expect(RequestCode.CONFIG_PARAMS).toBe(0x45)
      expect(RequestCode.SDK_MODE).toBe(0x90)
    })

    it("should have all codes as positive numbers", () => {
      const codes = [
        RequestCode.DISCONNECT,
        RequestCode.PING,
        RequestCode.VERSION,
        RequestCode.BATTERY_LEVEL,
        RequestCode.LIGHTS,
        RequestCode.SPEED,
        RequestCode.CHANGE_LANE,
        RequestCode.CANCEL_LANE_CHANGE,
        RequestCode.SET_OFFSET_FROM_ROAD_CENTER,
        RequestCode.TURN,
        RequestCode.LIGHTS_PATTERN,
        RequestCode.CONFIG_PARAMS,
        RequestCode.SDK_MODE,
      ]
      
      codes.forEach(code => {
        expect(typeof code).toBe("number")
        expect(code).toBeGreaterThan(0)
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

    it("should have additional response codes", () => {
      expect(ResponseCode.DELOCALIZED).toBe(0x2b)
      expect(ResponseCode.OFFSET_FROM_ROAD_CENTER).toBe(0x2d)
      expect(ResponseCode.STATUS_UPDATE).toBe(0x3f)
      expect(ResponseCode.COLLISION).toBe(0x4d)
      expect(ResponseCode.CYCLE_OVERTIME).toBe(0x86)
    })

    it("should correspond to request codes where applicable", () => {
      // Response codes are typically request code + 1
      expect(ResponseCode.PING).toBe(RequestCode.PING + 1)
      expect(ResponseCode.VERSION).toBe(RequestCode.VERSION + 1)
      expect(ResponseCode.BATTERY_LEVEL).toBe(RequestCode.BATTERY_LEVEL + 1)
    })

    it("should have all codes as positive numbers", () => {
      const codes = [
        ResponseCode.PING,
        ResponseCode.VERSION,
        ResponseCode.BATTERY_LEVEL,
        ResponseCode.POSITION_UPDATE,
        ResponseCode.TRANSITION_UPDATE,
        ResponseCode.INTERSECTION_UPDATE,
        ResponseCode.DELOCALIZED,
        ResponseCode.OFFSET_FROM_ROAD_CENTER,
        ResponseCode.STATUS_UPDATE,
        ResponseCode.COLLISION,
        ResponseCode.CYCLE_OVERTIME,
      ]
      
      codes.forEach(code => {
        expect(typeof code).toBe("number")
        expect(code).toBeGreaterThan(0)
      })
    })
  })

  describe("Enum consistency", () => {
    it("should have different enum values", () => {
      // RequestCode and ResponseCode should not overlap
      const requestValues = [
        RequestCode.DISCONNECT,
        RequestCode.PING,
        RequestCode.VERSION,
        RequestCode.BATTERY_LEVEL,
        RequestCode.LIGHTS,
        RequestCode.SPEED,
        RequestCode.CHANGE_LANE,
        RequestCode.CANCEL_LANE_CHANGE,
      ]
      
      const responseValues = [
        ResponseCode.PING,
        ResponseCode.VERSION,
        ResponseCode.BATTERY_LEVEL,
        ResponseCode.POSITION_UPDATE,
        ResponseCode.TRANSITION_UPDATE,
        ResponseCode.INTERSECTION_UPDATE,
      ]
      
      const allValues = new Set([...requestValues, ...responseValues])
      expect(allValues.size).toBe(requestValues.length + responseValues.length)
    })

    it("should be usable in message creation", () => {
      // Test that enums can be used in buffer operations
      const buffer = Buffer.alloc(BASE_SIZE + 4)
      buffer.writeUInt8(RequestCode.PING, 0)
      
      expect(buffer.readUInt8(0)).toBe(RequestCode.PING)
    })

    it("should support type checking", () => {
      // Test enum as types
      function processRequest(code: RequestCode): boolean {
        return code === RequestCode.PING || code === RequestCode.VERSION
      }
      
      expect(processRequest(RequestCode.PING)).toBe(true)
      expect(processRequest(RequestCode.VERSION)).toBe(true)
      expect(processRequest(RequestCode.LIGHTS)).toBe(false)
    })
  })

  describe("Integration with message handling", () => {
    it("should work with buffer operations", () => {
      const messageSize = BASE_SIZE + 4
      const buffer = Buffer.alloc(messageSize)
      
      // Write request code
      buffer.writeUInt8(RequestCode.SPEED, 0)
      
      // Verify
      expect(buffer.readUInt8(0)).toBe(RequestCode.SPEED)
      expect(buffer.length).toBe(messageSize)
    })

    it("should handle UUID formatting for Bluetooth", () => {
      const serviceUuid = GattCharacteristic.SERVICE_UUID
      
      // Should be valid for Bluetooth GATT operations
      expect(serviceUuid).toHaveLength(32) // 128-bit UUID without dashes
      expect(serviceUuid.toLowerCase()).toBe(serviceUuid) // Should be lowercase
    })

    it("should provide consistent request/response pairing", () => {
      const requestResponsePairs = [
        { request: RequestCode.PING, response: ResponseCode.PING },
        { request: RequestCode.VERSION, response: ResponseCode.VERSION },
        { request: RequestCode.BATTERY_LEVEL, response: ResponseCode.BATTERY_LEVEL },
      ]
      
      requestResponsePairs.forEach(({ request, response }) => {
        expect(response).toBe(request + 1)
      })
    })
  })
})
