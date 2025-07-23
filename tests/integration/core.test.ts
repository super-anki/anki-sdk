import { describe, it, expect, beforeEach } from "vitest"
import { createMockDevice, createMockBluetoothService } from "../mocks/bluetooth.mock"
import { waitFor } from "../utils/test-utils"

// Import what we need for testing
import { Builder } from "@/message/builder"
import { RequestCode, ResponseCode } from "@/utils"

describe("Integration Tests", () => {
  describe("Message Builder Integration", () => {
    let builder: Builder

    beforeEach(() => {
      builder = new Builder()
    })

    it("should create valid ping message", () => {
      const message = builder
        .setType(RequestCode.PING)
        .build()

      expect(message).toBeDefined()
      expect(message).not.toBeNull()
      if (message) {
        expect(message.payload).toBeInstanceOf(Buffer)
        expect(message.payload.length).toBeGreaterThan(0)
        expect(message.payload.readUInt8(0)).toBe(RequestCode.PING)
      }
    })

    it("should create valid version request message", () => {
      const message = builder
        .setType(RequestCode.VERSION)
        .build()

      expect(message).toBeDefined()
      if (message) {
        expect(message.payload).toBeInstanceOf(Buffer)
        expect(message.payload.readUInt8(0)).toBe(RequestCode.VERSION)
      }
    })

    it("should create valid speed message with payload", () => {
      const speed = 500
      const acceleration = 250

      const message = builder
        .setType(RequestCode.SPEED)
        .setSpeed(speed, acceleration)
        .build()

      expect(message).toBeDefined()
      if (message) {
        expect(message.payload).toBeInstanceOf(Buffer)
        expect(message.payload.readUInt8(0)).toBe(RequestCode.SPEED)
        expect(message.payload.length).toBeGreaterThan(1) // Has payload
      }
    })

    it("should create valid lights message", () => {
      const message = builder
        .setType(RequestCode.LIGHTS)
        .setLights(0x44) // Headlights on
        .build()

      expect(message).toBeDefined()
      if (message) {
        expect(message.payload).toBeInstanceOf(Buffer)
        expect(message.payload.readUInt8(0)).toBe(RequestCode.LIGHTS)
      }
    })

    it("should handle disconnect message", () => {
      const message = builder
        .setType(RequestCode.DISCONNECT)
        .build()

      expect(message).toBeDefined()
      if (message) {
        expect(message.payload).toBeInstanceOf(Buffer)
        expect(message.payload.readUInt8(0)).toBe(RequestCode.DISCONNECT)
      }
    })

    it("should be reusable for multiple messages", () => {
      const pingMessage = builder
        .setType(RequestCode.PING)
        .build()

      const versionMessage = builder
        .setType(RequestCode.VERSION)
        .build()

      expect(pingMessage).toBeDefined()
      expect(versionMessage).toBeDefined()
      if (pingMessage && versionMessage) {
        expect(pingMessage.payload.readUInt8(0)).toBe(RequestCode.PING)
        expect(versionMessage.payload.readUInt8(0)).toBe(RequestCode.VERSION)
        expect(pingMessage.payload).not.toBe(versionMessage.payload)
      }
    })
  })

  describe("Bluetooth Mock Integration", () => {
    it("should create mock device with expected properties", () => {
      const device = createMockDevice({
        id: "test-car-123",
        name: "Anki Car",
      })

      expect(device.id).toBe("test-car-123")
      expect(device.name).toBe("Anki Car")
      expect(device.gatt).toBeDefined()
      expect(typeof device.gatt?.connect).toBe("function")
    })

    it("should handle device connection", async () => {
      const device = createMockDevice()
      const server = await device.gatt?.connect()

      expect(server).toBeDefined()
      expect(server?.connected).toBe(true)
    })

    it("should handle service discovery", async () => {
      const device = createMockDevice()
      await device.gatt?.connect()
      const service = createMockBluetoothService()

      expect(service.uuid).toBeDefined()
      expect(typeof service.getCharacteristic).toBe("function")
    })

    it("should handle characteristic operations", async () => {
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

  describe("Message Flow Integration", () => {
    let mockDevice: ReturnType<typeof createMockDevice>
    let builder: Builder

    beforeEach(() => {
      mockDevice = createMockDevice()
      builder = new Builder()
    })

    it("should simulate complete ping workflow", async () => {
      // Build ping message
      const pingMessage = builder
        .setType(RequestCode.PING)
        .build()

      expect(pingMessage).toBeDefined()
      expect(pingMessage).not.toBeNull()

      if (pingMessage) {
        // Connect to device
        const server = await mockDevice.gatt?.connect()
        expect(server?.connected).toBe(true)

        // Get service and characteristic
        const service = createMockBluetoothService()
        const characteristic = await service.getCharacteristic("test-uuid")

        // Send ping
        await characteristic.writeValue(pingMessage.payload)

        // Simulate response
        await waitFor(10) // Small delay to simulate real-world timing

        const response = await characteristic.readValue()
        expect(response).toBeInstanceOf(DataView)

        // Verify response could be a ping response
        expect(response.byteLength).toBeGreaterThan(0)
      }
    })

    it("should simulate version request workflow", async () => {
      const versionMessage = builder
        .setType(RequestCode.VERSION)
        .build()

      expect(versionMessage).toBeDefined()

      if (versionMessage) {
        await mockDevice.gatt?.connect()
        const service = createMockBluetoothService()
        const characteristic = await service.getCharacteristic("test-uuid")

        await characteristic.writeValue(versionMessage.payload)

        const response = await characteristic.readValue()
        expect(response).toBeInstanceOf(DataView)
      }
    })

    it("should simulate speed command workflow", async () => {
      const speedMessage = builder
        .setType(RequestCode.SPEED)
        .setSpeed(400, 300)
        .build()

      expect(speedMessage).toBeDefined()

      if (speedMessage) {
        await mockDevice.gatt?.connect()
        const service = createMockBluetoothService()
        const characteristic = await service.getCharacteristic("test-uuid")

        await characteristic.writeValue(speedMessage.payload)

        // Speed commands typically don't have immediate responses
        // Just verify the write succeeded
        expect(true).toBe(true)
      }
    })

    it("should handle multiple sequential commands", async () => {
      await mockDevice.gatt?.connect()
      const service = createMockBluetoothService()
      const characteristic = await service.getCharacteristic("test-uuid")

      // Send multiple commands in sequence
      const commands = [
        builder.setType(RequestCode.SDK_MODE).build(),
        new Builder().setType(RequestCode.PING).build(),
        new Builder().setType(RequestCode.VERSION).build(),
        new Builder().setType(RequestCode.BATTERY_LEVEL).build(),
      ]

      for (const command of commands) {
        if (command) {
          await characteristic.writeValue(command.payload)
          await waitFor(5) // Small delay between commands
        }
      }

      // All commands should complete without error
      expect(commands.filter(cmd => cmd !== null)).toHaveLength(4)
    })
  })

  describe("Performance Integration", () => {
    it("should handle rapid message creation", () => {
      const builder = new Builder()
      const messages: Array<ReturnType<Builder["build"]>> = []

      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        const message = builder
          .setType(RequestCode.PING)
          .build()
        messages.push(message)
      }

      const duration = performance.now() - start

      expect(messages).toHaveLength(100)
      expect(duration).toBeLessThan(50) // Should be fast
    })

    it("should handle concurrent mock operations", async () => {
      const promises: Array<Promise<boolean | undefined>> = []

      for (let i = 0; i < 10; i++) {
        promises.push(
          (async () => {
            const device = createMockDevice({ id: `device-${i}` })
            const server = await device.gatt?.connect()
            return server?.connected
          })(),
        )
      }

      const results = await Promise.all(promises)
      results.forEach(connected => {
        expect(connected).toBe(true)
      })
    })
  })

  describe("Enum Integration", () => {
    it("should use RequestCode and ResponseCode consistently", () => {
      const builder = new Builder()

      // Test all known request codes
      const requestCodes = [
        RequestCode.PING,
        RequestCode.VERSION,
        RequestCode.BATTERY_LEVEL,
        RequestCode.LIGHTS,
        RequestCode.SPEED,
        RequestCode.DISCONNECT,
      ]

      requestCodes.forEach(code => {
        const message = builder.setType(code).build()
        expect(message).toBeDefined()
        if (message) {
          expect(message.payload.readUInt8(0)).toBe(code)
        }
      })
    })

    it("should handle response code mapping", () => {
      // Verify that response codes follow the pattern
      expect(ResponseCode.PING).toBe(RequestCode.PING + 1)
      expect(ResponseCode.VERSION).toBe(RequestCode.VERSION + 1)
      expect(ResponseCode.BATTERY_LEVEL).toBe(RequestCode.BATTERY_LEVEL + 1)
    })
  })
})
