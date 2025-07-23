import { describe, it, expect } from "vitest"
import { 
  createMockPeripheral, 
  createMockCharacteristic,
  createMockDevice,
  createMockBluetoothService,
} from "../mocks/bluetooth.mock"
import { waitFor } from "../utils/test-utils"

// Import what we need for testing
import { Builder } from "@/message/builder"
import { RequestCode, ResponseCode } from "@/utils"

describe("Integration Tests", () => {
  describe("Response Builder Integration", () => {
    it("should create valid response messages", () => {
      const id = "test-car-123"
      const payload = Buffer.from([0x01, 0x02, 0x03])

      const builder = new Builder(id, ResponseCode.PING, payload)
      const message = builder.build()

      expect(message).toBeDefined()
      expect(message).not.toBeNull()
    })

    it("should handle battery level responses", () => {
      const id = "test-car-456"
      const batteryData = Buffer.alloc(4) // Allocate 4 bytes for UInt16LE at offset 2
      batteryData.writeUInt16LE(75, 2) // 75% battery at correct offset
      
      const builder = new Builder(id, ResponseCode.BATTERY_LEVEL, batteryData)
      const message = builder.build()

      expect(message).toBeDefined()
      expect(message).not.toBeNull()
      if (message) {
        expect(message.id).toBe(id)
        expect(message.payload).toEqual(batteryData)
      }
    })

    it("should handle ping responses", () => {
      const id = "test-car-789"
      const pingData = Buffer.alloc(0) // Empty payload for ping
      
      const builder = new Builder(id, ResponseCode.PING, pingData)
      const message = builder.build()

      expect(message).toBeDefined()
      expect(message).not.toBeNull()
      if (message) {
        expect(message.id).toBe(id)
        expect(message.payload).toEqual(pingData)
      }
    })

    it("should handle version responses", () => {
      const id = "test-car-abc"
      const versionData = Buffer.from([1, 2, 3, 4]) // Version bytes
      
      const builder = new Builder(id, ResponseCode.VERSION, versionData)
      const message = builder.build()

      expect(message).toBeDefined()
      expect(message).not.toBeNull()
      if (message) {
        expect(message.id).toBe(id)
        expect(message.payload).toEqual(versionData)
      }
    })

    it("should return null for unknown message types", () => {
      const id = "test-car-unknown"
      const payload = Buffer.alloc(0)
      
      const builder = new Builder(id, 0xFF, payload) // Unknown message type
      const message = builder.build()

      expect(message).toBeNull()
    })

    it("should handle multiple response types", () => {
      const carId = "test-car-multi"

      // Test different response types
      const responseTypes = [
        { code: ResponseCode.PING, payload: Buffer.alloc(0) },
        { 
          code: ResponseCode.BATTERY_LEVEL, 
          payload: (() => {
            const buf = Buffer.alloc(4)
            buf.writeUInt16LE(85, 2) // 85% battery at offset 2
            return buf
          })(),
        },
        { 
          code: ResponseCode.VERSION, 
          payload: (() => {
            const buf = Buffer.alloc(4)
            buf.writeUInt16LE(256, 2) // Version 256 at offset 2
            return buf
          })(),
        },
        { 
          code: ResponseCode.POSITION_UPDATE, 
          payload: (() => {
            const buf = Buffer.alloc(17) // Need at least 17 bytes
            buf.writeUInt8(1, 2)    // locationId
            buf.writeUInt8(2, 3)    // roadPieceId 
            buf.writeFloatLE(0.5, 4) // offsetRoadCenter
            buf.writeUInt16LE(500, 8) // speed
            buf.writeUInt8(0, 10)   // parsingFlags
            buf.writeUInt8(0, 11)   // lastReceiveLaneChangeCommandId
            buf.writeUInt8(0, 12)   // lastExecLangeChangeCommandId
            buf.writeUInt16LE(0, 13) // lastDesiredLaneChangeSpeed
            buf.writeUInt16LE(500, 15) // lastDesiredSpeed
            return buf
          })(),
        },
      ]

      for (const { code, payload } of responseTypes) {
        const builder = new Builder(carId, code, payload)
        const message = builder.build()

        expect(message).toBeDefined()
        expect(message).not.toBeNull()
        if (message) {
          expect(message.id).toBe(carId)
          expect(message.payload).toEqual(payload)
        }
      }
    })
  })

  describe("Bluetooth Mock Integration", () => {
    it("should create mock peripheral with expected properties", () => {
      const peripheral = createMockPeripheral({
        id: "test-car-123",
        advertisement: {
          localName: "Anki Car",
        },
      })

      expect(peripheral.id).toBe("test-car-123")
      expect(peripheral.advertisement).toBeDefined()
      expect(typeof peripheral.connect).toBe("function")
      expect(typeof peripheral.disconnect).toBe("function")
    })

    it("should create mock characteristic", () => {
      const characteristic = createMockCharacteristic({
        uuid: "test-uuid",
      })

      expect(characteristic.uuid).toBe("test-uuid")
      expect(typeof characteristic.write).toBe("function")
      expect(typeof characteristic.read).toBe("function")
    })

    it("should handle characteristic operations", () => {
      const characteristic = createMockCharacteristic()

      expect(characteristic).toBeDefined()
      expect(typeof characteristic.write).toBe("function")
      expect(typeof characteristic.read).toBe("function")
      expect(typeof characteristic.subscribe).toBe("function")
    })

    it("should handle peripheral connection mock", () => {
      const peripheral = createMockPeripheral()
      
      expect(peripheral.state).toBe("disconnected")
      expect(typeof peripheral.connect).toBe("function")
      expect(typeof peripheral.disconnect).toBe("function")
    })
  })

  describe("Performance Integration", () => {
    it("should handle rapid message processing", () => {
      const carId = "performance-test-car"
      const messages: Array<NonNullable<ReturnType<Builder["build"]>>> = []

      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        const builder = new Builder(carId, ResponseCode.PING, Buffer.alloc(0))
        const message = builder.build()
        if (message) {
          messages.push(message)
        }
      }

      const duration = performance.now() - start

      expect(messages).toHaveLength(100)
      expect(duration).toBeLessThan(50) // Should be fast
      messages.forEach(msg => {
        expect(msg).toBeDefined()
        expect(msg.id).toBe(carId)
      })
    })

    it("should handle multiple builder instances", () => {
      const builders: Builder[] = []
      
      for (let i = 0; i < 10; i++) {
        const builder = new Builder(`car-${i}`, ResponseCode.PING, Buffer.alloc(0))
        builders.push(builder)
      }

      expect(builders).toHaveLength(10)
      
      builders.forEach((builder, index) => {
        const message = builder.build()
        expect(message).toBeDefined()
        if (message) {
          expect(message.id).toBe(`car-${index}`)
        }
      })
    })
  })

  describe("Enum Integration", () => {
    it("should use RequestCode and ResponseCode consistently", () => {
      // Test that request and response codes are properly defined
      expect(typeof RequestCode.PING).toBe("number")
      expect(typeof RequestCode.VERSION).toBe("number")
      expect(typeof RequestCode.BATTERY_LEVEL).toBe("number")

      expect(typeof ResponseCode.PING).toBe("number")
      expect(typeof ResponseCode.VERSION).toBe("number")
      expect(typeof ResponseCode.BATTERY_LEVEL).toBe("number")
    })

    it("should handle response code mapping", () => {
      // Verify that response codes follow the expected pattern
      expect(ResponseCode.PING).toBe(RequestCode.PING + 1)
      expect(ResponseCode.VERSION).toBe(RequestCode.VERSION + 1)
      expect(ResponseCode.BATTERY_LEVEL).toBe(RequestCode.BATTERY_LEVEL + 1)
    })

    it("should build valid responses for all supported types", () => {
      const carId = "test-enum-car"
      
      // Create appropriate payloads for each response type
      const createPayloadForResponse = (responseCode: number): Buffer => {
        switch (responseCode) {
        case ResponseCode.BATTERY_LEVEL: {
          // Battery level response needs at least 4 bytes (readUInt16LE at offset 2)
          const batteryPayload = Buffer.alloc(4)
          batteryPayload.writeUInt16LE(1234, 2) // Mock battery level
          return batteryPayload
        }
        case ResponseCode.VERSION: {
          // Version response needs at least 4 bytes (readUInt16LE at offset 2)
          const versionPayload = Buffer.alloc(4)
          versionPayload.writeUInt16LE(42, 2) // Mock version
          return versionPayload
        }
        case ResponseCode.POSITION_UPDATE: {
          // Position update response needs at least 17 bytes (readUInt16LE at offset 15)
          const positionPayload = Buffer.alloc(17)
          positionPayload.writeUInt8(1, 2) // locationId
          positionPayload.writeUInt8(2, 3) // roadPieceId
          positionPayload.writeFloatLE(1.5, 4) // offsetRoadCenter
          positionPayload.writeUInt16LE(300, 8) // speed
          positionPayload.writeUInt8(0, 10) // parsingFlags
          positionPayload.writeUInt8(0, 11) // lastReceiveLaneChangeCommandId
          positionPayload.writeUInt8(0, 12) // lastExecLangeChangeCommandId
          positionPayload.writeUInt16LE(250, 13) // lastDesiredLaneChangeSpeed
          positionPayload.writeUInt16LE(300, 15) // lastDesiredSpeed
          return positionPayload
        }
        case ResponseCode.TRANSITION_UPDATE: {
          // Transition update response needs at least 18 bytes (readUInt8 at offset 17)
          const transitionPayload = Buffer.alloc(18)
          transitionPayload.writeUInt8(1, 2) // roadPieceId
          transitionPayload.writeUInt8(2, 3) // prevRoadPieceId
          transitionPayload.writeFloatLE(1.5, 4) // offsetRoadCenter
          transitionPayload.writeUInt8(0, 8) // lastReceiveLaneChangeCommandId
          transitionPayload.writeUInt8(0, 9) // lastExecLaneChangeCommandId
          transitionPayload.writeUInt16LE(100, 10) // lastDesiredLaneChangeCommandId
          transitionPayload.writeUInt8(0, 12) // haveFollowLineDriftPixels
          transitionPayload.writeUInt8(0, 13) // hadLaneChangeActivity
          transitionPayload.writeUInt8(0, 14) // uphillCounter
          transitionPayload.writeUInt8(0, 15) // downhillCounter
          transitionPayload.writeUInt8(5, 16) // leftWheelDistCm
          transitionPayload.writeUInt8(5, 17) // rightWheelDistCm
          return transitionPayload
        }
        case ResponseCode.INTERSECTION_UPDATE: {
          // Intersection update response needs at least 13 bytes (readUInt16LE at offset 11)
          const intersectionPayload = Buffer.alloc(13)
          intersectionPayload.writeUInt8(1, 2) // roadPieceId
          intersectionPayload.writeFloatLE(1.5, 3) // offsetRoadCenter
          intersectionPayload.writeUInt8(4, 7) // intersectionCode
          intersectionPayload.writeUInt8(1, 8) // isExisting
          intersectionPayload.writeUInt16LE(100, 9) // mmSinceLastTransitionBar
          intersectionPayload.writeUInt16LE(200, 11) // mmSinceLastIntersectionCode
          return intersectionPayload
        }
        case ResponseCode.OFFSET_FROM_ROAD_CENTER: {
          // Offset road center response needs at least 7 bytes (readUInt8 at offset 6)
          const offsetPayload = Buffer.alloc(7)
          offsetPayload.writeFloatLE(1.5, 2) // offset
          offsetPayload.writeUInt8(3, 6) // laneChangeId
          return offsetPayload
        }
        case ResponseCode.STATUS_UPDATE: {
          // Status response needs at least 6 bytes (readUInt8 at offset 5)
          const statusPayload = Buffer.alloc(6)
          statusPayload.writeUInt8(1, 2) // onTrack
          statusPayload.writeUInt8(0, 3) // onCharger
          statusPayload.writeUInt8(0, 4) // batteryLow
          statusPayload.writeUInt8(0, 5) // batteryFull
          return statusPayload
        }
        case ResponseCode.PING:
        case ResponseCode.COLLISION:
        case ResponseCode.CYCLE_OVERTIME:
        case ResponseCode.DELOCALIZED:
        default:
          // For simpler response types, use a minimal 2-byte payload
          return Buffer.from([0xAB, 0xCD])
        }
      }

      const supportedResponses = [
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

      supportedResponses.forEach(responseCode => {
        const testPayload = createPayloadForResponse(responseCode)
        const builder = new Builder(carId, responseCode, testPayload)
        const message = builder.build()

        expect(message).toBeDefined()
        expect(message).not.toBeNull()
        if (message) {
          expect(message.id).toBe(carId)
          expect(message.type).toBe(responseCode)
        }
      })
    })
  })

  describe("Buffer Integration", () => {
    it("should handle various payload sizes", () => {
      const carId = "buffer-test-car"

      const payloadSizes = [0, 1, 4, 16, 32, 64, 128]

      payloadSizes.forEach(size => {
        const payload = Buffer.alloc(size, 0xAA) // Fill with test pattern
        const builder = new Builder(carId, ResponseCode.PING, payload)
        const message = builder.build()

        expect(message).toBeDefined()
        if (message) {
          expect(message.payload.length).toBe(size)
        }
      })
    })

    it("should preserve payload data integrity", () => {
      const carId = "integrity-test-car"
      const originalData = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC, 0xDE, 0xF0])

      const builder = new Builder(carId, ResponseCode.VERSION, originalData)
      const message = builder.build()

      expect(message).toBeDefined()
      if (message) {
        expect(message.payload).toEqual(originalData)
      }
    })

    it("should simulate data exchange", async () => {
      const service = createMockBluetoothService()
      const characteristic = await service.getCharacteristic("test-uuid")

      // Write data
      const testData = new Uint8Array([RequestCode.PING])
      await characteristic.writeValue(testData)

      // Read response
      const response = await characteristic.readValue()
      expect(response).toBeInstanceOf(DataView)
    })
  })

  describe("Error Handling Integration", () => {
    it("should handle connection failures gracefully", async () => {
      const device = createMockDevice({
        shouldFailConnection: true,
      })

      await expect(device.gatt?.connect()).rejects.toThrow()
    })

    it("should handle slow connections with timeout", async () => {
      const device = createMockDevice({
        connectionDelay: 100,
      })

      const startTime = Date.now()
      await device.gatt?.connect()
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    })

    it("should handle write failures", async () => {
      const service = createMockBluetoothService({
        shouldFailWrite: true,
      })
      const characteristic = await service.getCharacteristic("test-uuid")

      const testData = new Uint8Array([RequestCode.PING])
      await expect(characteristic.writeValue(testData)).rejects.toThrow()
    })

    it("should handle read failures", async () => {
      const service = createMockBluetoothService({
        shouldFailRead: true,
      })
      const characteristic = await service.getCharacteristic("test-uuid")

      await expect(characteristic.readValue()).rejects.toThrow()
    })
  })

  describe("Response Message Flow Integration", () => {
    it("should simulate complete response processing workflow", async () => {
      // Simulate receiving a response from a car
      const carId = "anki-car-001"
      const responsePayload = Buffer.from([42]) // Mock response data

      // Connect to device
      const device = createMockDevice({ id: carId })
      const server = await device.gatt?.connect()
      expect(server?.connected).toBe(true)

      // Process response message
      const builder = new Builder(carId, ResponseCode.PING, responsePayload)
      const message = builder.build()

      expect(message).toBeDefined()
      expect(message?.id).toBe(carId)
    })

    it("should handle multiple response types", async () => {
      const carId = "anki-car-002"

      // Test different response types
      const responseTypes = [
        { code: ResponseCode.PING, payload: Buffer.alloc(0) },
        { code: ResponseCode.BATTERY_LEVEL, payload: Buffer.alloc(4) }, // Needs 4 bytes for readUInt16LE(2)
        { code: ResponseCode.VERSION, payload: Buffer.alloc(4) }, // Needs 4 bytes for readUInt16LE(2)
        { code: ResponseCode.POSITION_UPDATE, payload: Buffer.alloc(17) }, // Needs 17 bytes for readUInt16LE(15)
      ]

      for (const { code, payload } of responseTypes) {
        const builder = new Builder(carId, code, payload)
        const message = builder.build()

        expect(message).toBeDefined()
        expect(message?.type).toBe(code)
      }
    })

    it("should handle sequential message processing", async () => {
      const carId = "anki-car-003"
      const device = createMockDevice({ id: carId })

      // Connect
      await device.gatt?.connect()

      // Process multiple messages in sequence
      const messages: Array<ReturnType<Builder["build"]>> = []

      for (let i = 0; i < 5; i++) {
        const builder = new Builder(carId, ResponseCode.PING, Buffer.alloc(0))
        const message = builder.build()
        messages.push(message)

        await waitFor(1) // Small delay
      }

      expect(messages).toHaveLength(5)
      messages.forEach(msg => {
        expect(msg).toBeDefined()
        if (msg) {
          expect(msg.id).toBe(carId)
        }
      })
    })
  })
})
