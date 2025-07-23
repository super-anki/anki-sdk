// Optimized type definitions for the Anki SDK

// Base types for better type safety
export type CarId = string
export type DeviceAddress = string
export type MessageId = string
export type BufferHex = string

// Numeric constraints for better type safety
export type ColorDigit = 0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 | 0x7 | 0x8 | 0x9 | 0xA | 0xB | 0xC | 0xD | 0xE | 0xF
export type Percentage = number // 0-100
export type Milliseconds = number
export type Speed = number // 0-1000
export type Acceleration = number // 0-1000

// Track related types
export const enum TrackDirection {
  NORTH = 0,
  EAST = 1,
  SOUTH = 2,
  WEST = 3,
}

export const enum TrackType {
  UNKNOWN = 0,
  STRAIGHT = 1,
  CURVE = 2,
  START_GRID = 3,
  FINISH_LINE = 4,
  FAST_N_FURIOUS_SPECIAL = 5,
  CROSSROAD = 6,
  JUMP_RAMP = 7,
  JUMP_LANDING = 8,
}

export interface TrackPosition {
  readonly x: number
  readonly y: number
  readonly direction: TrackDirection
}

// Car related types
export const enum TurnTrigger {
  IMMEDIATE = 0,
  INTERSECTION = 1,
}

export const enum TurnType {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2,
  UTURN = 3,
  UTURN_JUMP = 4,
}

export const enum Lights {
  HEADLIGHTS_ON = 0x44,
  HEADLIGHTS_OFF = 0x04,
  TAILLIGHTS_ON = 0x22,
  TAILLIGHTS_OFF = 0x02,
  FLASH_TAILLIGHTS = 0x88,
}

export const enum LightsTarget {
  HEAD = 0x00,
  BRAKE = 0x01,
  FRONT = 0x02,
  ENGINE = 0x03,
}

export const enum LightsPattern {
  STEADY = 0x00,
  FADE = 0x01,
  THROB = 0x02,
  FLASH = 0x03,
  RANDOM = 0x04,
}

export const enum LightsChannel {
  RED = 0x00,
  BLUE = 0x02,
  GREEN = 0x03,
}

// Bluetooth related types
export type BluetoothState = "poweredOn" | "disconnected" | "error" | "unknown"

// Listener types for better type safety
export type CarMessageListener<T> = (message: T) => void
export type CarStatusListener<T> = (car: T) => void
export type TrackScannerListener<T> = (track: T[]) => void
export type ReadBufferListener = (data: Buffer) => void
export type DiscoverCallback<T> = (device: T) => void

// Result types for async operations
export interface ScanResult<T> {
  readonly devices: T[]
  readonly timestamp: Date
  readonly duration: Milliseconds
}

export interface PingResult {
  readonly latency: Milliseconds
  readonly timestamp: Date
  readonly success: boolean
}

export interface BatteryStatus {
  readonly level: Percentage
  readonly isLow: boolean
  readonly isCharging: boolean
  readonly isFull: boolean
}

// Configuration types
export interface ScannerConfig {
  readonly timeout: Milliseconds
  readonly maxRetries: number
  readonly serviceUUIDs: readonly string[]
}

export interface CarConfig {
  readonly defaultSpeed: Speed
  readonly defaultAcceleration: Acceleration
  readonly respectRoadLimit: boolean
  readonly autoReconnect: boolean
}

// Error types for better error handling
export class AnkiSDKError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = "AnkiSDKError"
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    }
  }
}

export class BluetoothError extends AnkiSDKError {
  constructor(message: string, details?: unknown) {
    super(message, "BLUETOOTH_ERROR", details)
    this.name = "BluetoothError"
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    }
  }
}

export class CarConnectionError extends AnkiSDKError {
  constructor(message: string, public readonly carId: CarId, details?: unknown) {
    super(message, "CAR_CONNECTION_ERROR", details)
    this.name = "CarConnectionError"
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      carId: this.carId,
      details: this.details,
    }
  }
}

export class MessageTimeoutError extends AnkiSDKError {
  constructor(message: string, public readonly messageType: string, details?: unknown) {
    super(message, "MESSAGE_TIMEOUT_ERROR", details)
    this.name = "MessageTimeoutError"
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      messageType: this.messageType,
      details: this.details,
    }
  }
}

// Utility types for better API design
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type ReadOnly<T> = { readonly [P in keyof T]: T[P] }
export type NonEmptyArray<T> = [T, ...T[]]
