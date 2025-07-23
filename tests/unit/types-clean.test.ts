import { describe, it, expect } from "vitest"
import {
  AnkiSDKError,
  BluetoothError,
  CarConnectionError,
  MessageTimeoutError,
  type CarId,
  type MessageId,
  type CarMessageListener,
  type BluetoothState,
  type ScanResult,
  type PingResult,
  type BatteryStatus,
  TrackDirection,
  TrackType,
  TurnType,
  Lights,
} from "@/types"

describe("Types", () => {
  describe("AnkiSDKError", () => {
    it("should create error with message and code", () => {
      const error = new AnkiSDKError("Test error", "TEST_CODE")
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AnkiSDKError)
      expect(error.message).toBe("Test error")
      expect(error.code).toBe("TEST_CODE")
      expect(error.name).toBe("AnkiSDKError")
    })

    it("should create error with message, code and details", () => {
      const details = { extra: "info" }
      const error = new AnkiSDKError("Test error", "TEST_CODE", details)
      
      expect(error.message).toBe("Test error")
      expect(error.code).toBe("TEST_CODE")
      expect(error.details).toBe(details)
    })

    it("should have proper stack trace", () => {
      const error = new AnkiSDKError("Test error", "TEST_CODE")
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain("AnkiSDKError")
    })
  })

  describe("BluetoothError", () => {
    it("should extend AnkiSDKError", () => {
      const error = new BluetoothError("Bluetooth error")
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AnkiSDKError)
      expect(error).toBeInstanceOf(BluetoothError)
      expect(error.name).toBe("BluetoothError")
      expect(error.code).toBe("BLUETOOTH_ERROR")
    })

    it("should handle device-specific errors", () => {
      const error = new BluetoothError("Device not found")
      expect(error.message).toBe("Device not found")
    })

    it("should preserve details", () => {
      const details = { deviceId: "abc123" }
      const bluetoothError = new BluetoothError("Bluetooth error", details)
      
      expect(bluetoothError.details).toBe(details)
    })
  })

  describe("CarConnectionError", () => {
    it("should extend AnkiSDKError", () => {
      const error = new CarConnectionError("Connection error", "car123")
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AnkiSDKError)
      expect(error).toBeInstanceOf(CarConnectionError)
      expect(error.name).toBe("CarConnectionError")
      expect(error.code).toBe("CAR_CONNECTION_ERROR")
    })

    it("should store car ID", () => {
      const error = new CarConnectionError("Connection failed", "car456")
      expect(error.carId).toBe("car456")
    })
  })

  describe("MessageTimeoutError", () => {
    it("should extend AnkiSDKError", () => {
      const error = new MessageTimeoutError("Timeout error", "ping")
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AnkiSDKError)
      expect(error).toBeInstanceOf(MessageTimeoutError)
      expect(error.name).toBe("MessageTimeoutError")
      expect(error.code).toBe("MESSAGE_TIMEOUT_ERROR")
    })

    it("should store message type", () => {
      const error = new MessageTimeoutError("Operation timed out", "speedCommand")
      expect(error.messageType).toBe("speedCommand")
    })
  })

  describe("Type definitions", () => {
    it("should accept valid CarId formats", () => {
      const carId1: CarId = "car_123"
      const carId2: CarId = "ANKI_CAR_ABC"
      const carId3: CarId = "device-uuid-123-456"
      
      expect(typeof carId1).toBe("string")
      expect(typeof carId2).toBe("string")
      expect(typeof carId3).toBe("string")
    })

    it("should accept valid MessageId formats", () => {
      const msgId1: MessageId = "msg_123"
      const msgId2: MessageId = "MESSAGE_ABC"
      const msgId3: MessageId = "request-456"
      
      expect(typeof msgId1).toBe("string")
      expect(typeof msgId2).toBe("string")
      expect(typeof msgId3).toBe("string")
    })

    it("should define proper CarMessageListener signature", () => {
      const listener: CarMessageListener<{ data: string }> = (message) => {
        expect(message).toHaveProperty("data")
        expect(typeof message.data).toBe("string")
      }
      
      listener({ data: "test" })
    })

    it("should define BluetoothState values", () => {
      const states: BluetoothState[] = ["poweredOn", "disconnected", "error", "unknown"]
      
      states.forEach(state => {
        expect(typeof state).toBe("string")
      })
    })
  })

  describe("Enum types", () => {
    it("should have correct TrackDirection values", () => {
      expect(TrackDirection.NORTH).toBe(0)
      expect(TrackDirection.EAST).toBe(1)
      expect(TrackDirection.SOUTH).toBe(2)
      expect(TrackDirection.WEST).toBe(3)
    })

    it("should have correct TrackType values", () => {
      expect(TrackType.UNKNOWN).toBe(0)
      expect(TrackType.STRAIGHT).toBe(1)
      expect(TrackType.CURVE).toBe(2)
      expect(TrackType.START_GRID).toBe(3)
      expect(TrackType.FINISH_LINE).toBe(4)
    })

    it("should have correct TurnType values", () => {
      expect(TurnType.NONE).toBe(0)
      expect(TurnType.LEFT).toBe(1)
      expect(TurnType.RIGHT).toBe(2)
      expect(TurnType.UTURN).toBe(3)
    })

    it("should have correct Lights hex values", () => {
      expect(Lights.HEADLIGHTS_ON).toBe(0x44)
      expect(Lights.HEADLIGHTS_OFF).toBe(0x04)
      expect(Lights.TAILLIGHTS_ON).toBe(0x22)
      expect(Lights.TAILLIGHTS_OFF).toBe(0x02)
    })
  })

  describe("Interface types", () => {
    it("should create valid ScanResult", () => {
      const result: ScanResult<{ id: string }> = {
        devices: [{ id: "device1" }, { id: "device2" }],
        timestamp: new Date(),
        duration: 1000,
      }
      
      expect(result.devices).toHaveLength(2)
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(typeof result.duration).toBe("number")
    })

    it("should create valid PingResult", () => {
      const result: PingResult = {
        latency: 42,
        timestamp: new Date(),
        success: true,
      }
      
      expect(typeof result.latency).toBe("number")
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(typeof result.success).toBe("boolean")
    })

    it("should create valid BatteryStatus", () => {
      const status: BatteryStatus = {
        level: 75,
        isLow: false,
        isCharging: false,
        isFull: false,
      }
      
      expect(typeof status.level).toBe("number")
      expect(typeof status.isLow).toBe("boolean")
      expect(typeof status.isCharging).toBe("boolean")
      expect(typeof status.isFull).toBe("boolean")
    })
  })

  describe("Error inheritance chain", () => {
    it("should maintain proper prototype chain", () => {
      const bluetoothError = new BluetoothError("test")
      const connectionError = new CarConnectionError("test", "car1")
      const timeoutError = new MessageTimeoutError("test", "ping")
      
      // All should be instances of Error
      expect(bluetoothError).toBeInstanceOf(Error)
      expect(connectionError).toBeInstanceOf(Error)
      expect(timeoutError).toBeInstanceOf(Error)
      
      // All should be instances of AnkiSDKError
      expect(bluetoothError).toBeInstanceOf(AnkiSDKError)
      expect(connectionError).toBeInstanceOf(AnkiSDKError)
      expect(timeoutError).toBeInstanceOf(AnkiSDKError)
      
      // Should not be instances of each other
      expect(bluetoothError).not.toBeInstanceOf(CarConnectionError)
      expect(connectionError).not.toBeInstanceOf(BluetoothError)
      expect(timeoutError).not.toBeInstanceOf(BluetoothError)
    })

    it("should be catchable as AnkiSDKError", () => {
      const errors = [
        new BluetoothError("bluetooth"),
        new CarConnectionError("connection", "car1"),
        new MessageTimeoutError("timeout", "ping"),
      ]
      
      errors.forEach(error => {
        try {
          throw error
        } catch (caught) {
          expect(caught).toBeInstanceOf(AnkiSDKError)
          expect(caught).toBeInstanceOf(Error)
        }
      })
    })
  })

  describe("Error serialization", () => {
    it("should serialize errors properly", () => {
      const error = new BluetoothError("Serialization test")
      const serialized = JSON.stringify(error)
      const parsed = JSON.parse(serialized)
      
      expect(parsed.message).toBe("Serialization test")
      expect(parsed.name).toBe("BluetoothError")
      expect(parsed.code).toBe("BLUETOOTH_ERROR")
    })

    it("should handle errors with details", () => {
      const details = { deviceId: "abc123" }
      const error = new AnkiSDKError("Test error", "TEST_CODE", details)
      
      expect(error.details).toBe(details)
      expect(error.message).toBe("Test error")
      expect(error.code).toBe("TEST_CODE")
    })
  })
})
