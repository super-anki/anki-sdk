// Core constants for the Anki SDK
export const CONSTANTS = {
  // Buffer and message sizes
  BASE_SIZE: 1,
  DEFAULT_TIMEOUT: 1500,
  SCANNING_TIMEOUT: 500,
  STORE_SYNC_INTERVAL: 3000,
  MAX_RETRIES: 3,

  // Default values
  DEFAULT_SPEED: 300,
  DEFAULT_ACCELERATION: 500,
  DEFAULT_CYCLE: 0x00,
  DEFAULT_HOP_INTENT: 0x0,
  DEFAULT_TAG: 0x0,

  // Request sizes (optimized as frozen object for better performance)
  REQUEST_SIZES: Object.freeze({
    BASE: 1,
    TURN: 3,
    SPEED: 6,
    SDK_MODE: 3,
    LIGHTS: 2,
    LIGHTS_PATTERN: 17,
    OFFSET_ROAD_CENTER: 5,
    CHANGE_LANE: 11,
  }),
} as const

// GATT Characteristics
export const GATT_CHARACTERISTICS = {
  SERVICE_UUID: "be15beef6186407e83810bd89c4d8df4",
  READ_UUID: "be15bee06186407e83810bd89c4d8df4",
  WRITE_UUID: "be15bee16186407e83810bd89c4d8df4",
} as const

// Request codes enum with explicit values for better optimization
export const enum RequestCode {
  DISCONNECT = 0x0d,
  PING = 0x16,
  VERSION = 0x18,
  BATTERY_LEVEL = 0x1a,
  LIGHTS = 0x1d,
  SPEED = 0x24,
  CHANGE_LANE = 0x25,
  CANCEL_LANE_CHANGE = 0x26,
  SET_OFFSET_FROM_ROAD_CENTER = 0x2c,
  TURN = 0x32,
  LIGHTS_PATTERN = 0x33,
  CONFIG_PARAMS = 0x45,
  SDK_MODE = 0x90,
  SDK_OPTION_OVERRIDE = 0x1,
}

// Response codes enum with explicit values for better optimization
export const enum ResponseCode {
  PING = 0x17,
  VERSION = 0x19,
  BATTERY_LEVEL = 0x1b,
  POSITION_UPDATE = 0x27,
  TRANSITION_UPDATE = 0x29,
  INTERSECTION_UPDATE = 0x2a,
  DELOCALIZED = 0x2b,
  OFFSET_FROM_ROAD_CENTER = 0x2d,
  STATUS_UPDATE = 0x3f,
  COLLISION = 0x4d,
  CYCLE_OVERTIME = 0x86,
}

// Track ID to type mapping for better performance (using Map for O(1) lookup)
export const TRACK_TYPE_MAP = new Map([
  [17, 2], // TrackType.CURVE
  [18, 2], // TrackType.CURVE
  [20, 2], // TrackType.CURVE
  [23, 2], // TrackType.CURVE
  [36, 1], // TrackType.STRAIGHT
  [39, 1], // TrackType.STRAIGHT
  [40, 1], // TrackType.STRAIGHT
  [51, 1], // TrackType.STRAIGHT
  [57, 5], // TrackType.FAST_N_FURIOUS_SPECIAL
  [34, 3], // TrackType.START_GRID
  [33, 4], // TrackType.FINISH_LINE
  [10, 6], // TrackType.CROSSROAD
  [58, 7], // TrackType.JUMP_RAMP
  [63, 8], // TrackType.JUMP_LANDING
])
