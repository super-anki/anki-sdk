import { describe, it, expect } from "vitest"
import { 
  createMockDevice,
  createMockBluetoothService,
} from "../mocks/bluetooth.mock"

// Import what we need for testing
import { Builder } from "@/message/builder"
import { RequestCode, ResponseCode } from "@/utils"

describe("Integration Tests", () => {
  describe("Response Builder", () => {
    it("should create valid response messages", () => {
      const id = "test-car-123"
      const payload = Buffer.from([0x01, 0x02, 0x03])

      const builder = new Builder(id, ResponseCode.PING, payload)
      const message = builder.build()

      expect(message).toBeDefined()
      expect(message).not.toBeNull()
    })

    it("should handle different response types", () => {
      const id = "test-car-456"
      
      const responseTypes = [
        ResponseCode.PING,
        ResponseCode.VERSION,
        ResponseCode.BATTERY_LEVEL,
        ResponseCode.POSITION_UPDATE,
      ]

      responseTypes.forEach(responseCode => {
        // Create appropriate buffer size for each response type
        let buffer: Buffer
        if (responseCode === ResponseCode.POSITION_UPDATE) {
          // Position update needs at least 17 bytes
          buffer = Buffer.alloc(17)
          buffer.writeUInt8(1, 2) // locationId
          buffer.writeUInt8(2, 3) // roadPieceId
          buffer.writeFloatLE(1.5, 4) // offsetRoadCenter
          buffer.writeUInt16LE(300, 8) // speed
          buffer.writeUInt8(0, 10) // parsingFlags
          buffer.writeUInt8(0, 11) // lastReceiveLaneChangeCommandId
          buffer.writeUInt8(0, 12) // lastExecLangeChangeCommandId
          buffer.writeUInt16LE(250, 13) // lastDesiredLaneChangeSpeed
          buffer.writeUInt16LE(300, 15) // lastDesiredSpeed
        } else {
          // Other response types work with 4 bytes
          buffer = Buffer.alloc(4)
          if (responseCode === ResponseCode.VERSION || responseCode === ResponseCode.BATTERY_LEVEL) {
            buffer.writeUInt16LE(42, 2) // Mock value at offset 2
          }
        }
        
        const builder = new Builder(id, responseCode, buffer)
        const message = builder.build()
        expect(message).toBeDefined()
      })
    })

    it("should return null for unknown message types", () => {
      const id = "test-car-unknown"
      const payload = Buffer.alloc(0)
      
      const builder = new Builder(id, 0xFF, payload) // Unknown message type
      const message = builder.build()

      expect(message).toBeNull()
    })
  })

  describe("Bluetooth Mocks", () => {
    it("should create mock device with expected properties", () => {
      const device = createMockDevice({
        id: "test-car-123",
        name: "Anki Car",
      })

      expect(device.id).toBe("test-car-123")
      expect(device.name).toBe("Anki Car")
      expect(device.gatt).toBeDefined()
    })

    it("should handle device connection", async () => {
      const device = createMockDevice()
      const server = await device.gatt?.connect()

      expect(server).toBeDefined()
      expect(server?.connected).toBe(true)
    })

    it("should handle service operations", async () => {
      const service = createMockBluetoothService()
      const characteristic = await service.getCharacteristic("test-uuid")

      expect(characteristic).toBeDefined()
      expect(typeof characteristic.writeValue).toBe("function")
      expect(typeof characteristic.readValue).toBe("function")
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

  describe("Error Handling", () => {
    it("should handle connection failures", async () => {
      const device = createMockDevice({
        shouldFailConnection: true,
      })

      await expect(device.gatt?.connect()).rejects.toThrow()
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

  describe("Enum Consistency", () => {
    it("should have valid request and response codes", () => {
      expect(typeof RequestCode.PING).toBe("number")
      expect(typeof RequestCode.VERSION).toBe("number")
      expect(typeof ResponseCode.PING).toBe("number")
      expect(typeof ResponseCode.VERSION).toBe("number")
    })

    it("should follow request/response pattern", () => {
      expect(ResponseCode.PING).toBe(RequestCode.PING + 1)
      expect(ResponseCode.VERSION).toBe(RequestCode.VERSION + 1)
      expect(ResponseCode.BATTERY_LEVEL).toBe(RequestCode.BATTERY_LEVEL + 1)
    })
  })

  describe("Performance", () => {
    it("should handle rapid message creation", () => {
      const messages: Array<ReturnType<Builder["build"]>> = []
      const start = performance.now()

      for (let i = 0; i < 50; i++) {
        const builder = new Builder("test", ResponseCode.PING, Buffer.alloc(0))
        const message = builder.build()
        if (message) messages.push(message)
      }

      const duration = performance.now() - start

      expect(messages.length).toBe(50)
      expect(duration).toBeLessThan(100) // Should be fast
    })

    it("should handle concurrent operations", async () => {
      const promises: Array<Promise<{ connected: boolean } | undefined>> = []

      for (let i = 0; i < 5; i++) {
        const device = createMockDevice({ id: `device-${i}` })
        const connectPromise = device.gatt?.connect()
        if (connectPromise) {
          promises.push(connectPromise)
        }
      }

      const results = await Promise.all(promises)
      results.forEach(server => {
        expect(server?.connected).toBe(true)
      })
    })
  })
})
