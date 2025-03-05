export enum GattCharacteristic {
    SERVICE_UUID = "be15beef6186407e83810bd89c4d8df4",
    READ_UUID = "be15bee06186407e83810bd89c4d8df4",
    WRITE_UUID = "be15bee16186407e83810bd89c4d8df4",
}

export const BASE_SIZE = 1

export enum RequestCode {
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

export enum ResponseCode {
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