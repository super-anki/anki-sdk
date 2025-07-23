export * from "./ble"
export * from "./car"
export * from "./message"
export * from "./store/cars"
export * from "./track"
export * from "./utils"

// Export new optimized constants and types
export {
  CONSTANTS,
  GATT_CHARACTERISTICS,
  RequestCode,
  ResponseCode,
  TRACK_TYPE_MAP,
} from "./constants"

export {
  TrackDirection,
  TrackType,
  TurnTrigger,
  TurnType,
  Lights,
  LightsTarget,
  LightsPattern,
  LightsChannel,
  AnkiSDKError,
  BluetoothError,
  CarConnectionError,
  MessageTimeoutError,
} from "./types"

export type {
  CarId,
  DeviceAddress,
  MessageId,
  BufferHex,
  ColorDigit,
  Percentage,
  Milliseconds,
  Speed,
  Acceleration,
  TrackPosition,
  BluetoothState,
  CarMessageListener,
  CarStatusListener,
  TrackScannerListener,
  ReadBufferListener,
  DiscoverCallback,
  ScanResult,
  PingResult,
  BatteryStatus,
  ScannerConfig,
  CarConfig,
  Optional,
  ReadOnly,
  NonEmptyArray,
} from "./types"