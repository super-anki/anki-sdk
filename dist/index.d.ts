import { Peripheral } from '@abandonware/noble';

type ReadBuffer = (data: Buffer) => void;
interface DeviceContract {
    id: string;
    address: string;
    nameCode: number;
    connected: boolean;
    connect(read?: string, write?: string): Promise<DeviceContract>;
    disconnect(): Promise<DeviceContract>;
    read(listener: ReadBuffer): void;
    write(data: Buffer): Promise<void>;
}
declare class Device implements DeviceContract {
    readonly id: string;
    readonly address: string;
    readonly nameCode: number;
    private _peripheral;
    private _connected;
    private _read?;
    private _write?;
    private _listeners;
    constructor(id: string, address: string, peripheral: Peripheral);
    get connected(): boolean;
    connect(read?: string, write?: string): Promise<DeviceContract>;
    disconnect(): Promise<DeviceContract>;
    read(listener: ReadBuffer): void;
    write(data: Buffer): Promise<void>;
    private init;
    private enableListener;
    private removeWrite;
    private removeRead;
}

type State = ("poweredOn" | "disconnected" | "error" | "unknown");
type DiscoverCallback$1 = (device: DeviceContract) => void;
interface BluetoothContract {
    onDiscover: DiscoverCallback$1;
    state: State;
    timeout: number;
    startScanning(uuids?: Array<string>): Promise<void>;
    stopScanning(): Promise<void>;
}
declare class Bluetooth implements BluetoothContract {
    private _onDiscover;
    private _state;
    private _timeout;
    constructor(onDiscover?: DiscoverCallback$1, timeout?: number);
    startScanning(uuids?: Array<string>): Promise<void>;
    stopScanning(): Promise<void>;
    set onDiscover(callback: DiscoverCallback$1);
    set timeout(timeout: number);
    get timeout(): number;
    get state(): State;
}

interface MessageContract {
    id: string;
    timestamp: Date;
    payload: Buffer;
    toJsonString(): string;
}
declare abstract class Message implements MessageContract {
    readonly id: string;
    readonly timestamp: Date;
    readonly payload: Buffer;
    readonly name: string;
    private _type?;
    protected constructor(id: string, payload: Buffer, type?: number);
    get type(): number;
    toJsonString(): string;
    toString(): string;
}

declare enum Lights$1 {
    HEADLIGHTS_ON = 68,
    HEADLIGHTS_OFF = 4,
    TAILLIGHTS_ON = 34,
    TAILLIGHTS_OFF = 2,
    FLASH_TAILLIGHTS = 136
}
declare class LightsRequest extends Message {
    constructor(id: string, lights: Lights$1);
}

type ColorDigit$1 = 0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 | 0x7 | 0x8 | 0x9 | 0xA | 0xB | 0xC | 0xD | 0xE | 0xF;
declare enum LightsTarget$1 {
    HEAD = 0,
    BRAKE = 1,
    FRONT = 2,
    ENGINE = 3
}
declare enum LightsPattern$1 {
    STEADY = 0,
    FADE = 1,
    THROB = 2,
    FLASH = 3,
    RANDOM = 4
}
declare class LightsPatternRequest extends Message {
    constructor(id: string, redStart: ColorDigit$1, redEnd: ColorDigit$1, greenStart: ColorDigit$1, greenEnd: ColorDigit$1, blueStart: ColorDigit$1, blueEnd: ColorDigit$1, target: LightsTarget$1, pattern: LightsPattern$1, cycle?: number);
}

type CarMessageListener$1<T extends Message> = (message: T) => void;
interface CarContract {
    id: string;
    address: string;
    connected: boolean;
    nameCode: number;
    offset: number;
    cancelLangeChange(): void;
    changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void;
    connect(): Promise<CarContract>;
    disableSdkMode(): void;
    disconnect(): Promise<CarContract>;
    enableSdkMode(): void;
    getBatteryLevel(): Promise<number>;
    getPing(): Promise<number>;
    getVersion(): Promise<number>;
    setOffset(offset: number): void;
    setSpeed(speed: number, acceleration?: number, respectRoadLimit?: boolean): void;
    setLights(lights: Lights$1): void;
    setLightsPattern(redStart: ColorDigit$1, redEnd: ColorDigit$1, greenStart: ColorDigit$1, greenEnd: ColorDigit$1, blueStart: ColorDigit$1, blueEnd: ColorDigit$1, target?: LightsTarget$1, pattern?: LightsPattern$1, cycle?: number): void;
    turnRight(): void;
    turnLeft(): void;
    uTurn(): void;
    uTurnJump(): void;
    addListener<T extends Message>(listener: CarMessageListener$1<T>): void;
    removeListener<T extends Message>(listener: CarMessageListener$1<T>): void;
}
declare class Car implements CarContract {
    readonly id: string;
    readonly address: string;
    readonly nameCode: number;
    private _connected;
    private _offset;
    private _device;
    private _listeners;
    constructor(device: DeviceContract, offset?: number);
    cancelLangeChange(): void;
    changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void;
    connect(): Promise<CarContract>;
    disableSdkMode(): void;
    disconnect(): Promise<CarContract>;
    enableSdkMode(): void;
    getBatteryLevel(): Promise<number>;
    getPing(): Promise<number>;
    getVersion(): Promise<number>;
    setOffset(offset: number): void;
    setSpeed(speed: number, acceleration?: number, respectRoadLimit?: boolean): void;
    setLights(lights: Lights$1): void;
    setLightsPattern(redStart: ColorDigit$1, redEnd: ColorDigit$1, greenStart: ColorDigit$1, greenEnd: ColorDigit$1, blueStart: ColorDigit$1, blueEnd: ColorDigit$1, target?: LightsTarget$1, pattern?: LightsPattern$1, cycle?: number): void;
    turnLeft(): void;
    turnRight(): void;
    uTurn(): void;
    uTurnJump(): void;
    get offset(): number;
    get connected(): boolean;
    addListener<T extends Message>(listener: CarMessageListener$1<T>): void;
    removeListener<T extends Message>(listener: CarMessageListener$1<T>): void;
    private removeAllListeners;
    private readPublish;
    private writePublish;
    private send;
}

interface CarScannerContract {
    timeout: number;
    findAll(): Promise<Array<CarContract>>;
    findById(id: string): Promise<CarContract>;
    findByAddress(address: string): Promise<CarContract>;
    findAny(): Promise<CarContract>;
}
declare class CarScanner implements CarScannerContract {
    private readonly _bluetooth;
    private _cars;
    private _timeout;
    constructor(bluetooth: BluetoothContract, timeout?: number);
    findAll(): Promise<Array<CarContract>>;
    findById(id: string): Promise<CarContract>;
    findByAddress(address: string): Promise<CarContract>;
    findAny(): Promise<CarContract>;
    get timeout(): number;
    set timeout(value: number);
    private onDiscover;
    private contains;
    private awaitScanning;
}

declare class Builder {
    private _messageId?;
    private _payload?;
    private _id?;
    private _type?;
    private _speed?;
    private _acceleration?;
    private _lights?;
    constructor(id?: string, messageId?: number, payload?: Buffer);
    setType(type: number): Builder;
    setSpeed(speed: number, acceleration: number): Builder;
    setLights(lights: number): Builder;
    build(): Message | null;
}

declare class BatteryLevelRequest extends Message {
    constructor(id: string);
}

declare class CancelLangeChangeRequest extends Message {
    constructor(id: string);
}

declare class ChangeLaneRequest extends Message {
    readonly offsetRoadCenter: number;
    readonly speed: number;
    readonly acceleration: number;
    readonly hopIntent: number;
    readonly tag: number;
    constructor(id: string, offsetRoadCenter: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number);
}

declare class DisconnectRequest extends Message {
    constructor(id: string);
}

declare class OffsetRoadCenterRequest extends Message {
    readonly offset: number;
    constructor(id: string, offset: number);
}

declare class PingRequest extends Message {
    constructor(id: string);
}

declare class SdkModeRequest extends Message {
    readonly on: boolean;
    readonly flags: number;
    constructor(id: string, on?: boolean, flags?: number);
}

declare class SpeedRequest extends Message {
    readonly speed: number;
    readonly acceleration: number;
    readonly respectRoadLimit: boolean;
    constructor(id: string, speed: number, acceleration?: number, respectRoadLimit?: boolean);
}

declare enum TurnTrigger$1 {
    IMMEDIATE = 0,
    INTERSECTION = 1
}
declare enum TurnType$1 {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    UTURN = 3,
    UTURN_JUMP = 4
}
declare class TurnRequest extends Message {
    readonly turnType: TurnType$1;
    readonly trigger: TurnTrigger$1;
    constructor(id: string, turnType: TurnType$1, trigger?: TurnTrigger$1);
}

declare class VersionRequest extends Message {
    constructor(id: string);
}

declare class BatteryLevelResponse extends Message {
    readonly batteryLevel: number;
    constructor(id: string, payload: Buffer, type?: number);
}

declare class CollisionResponse extends Message {
    constructor(id: string, payload: Buffer, type?: number);
}

declare class CycleOvertimeResponse extends Message {
    constructor(id: string, payload: Buffer, type?: number);
}

declare class DelocalizedResponse extends Message {
    constructor(id: string, payload: Buffer, type?: number);
}

declare class IntersectionUpdateResponse extends Message {
    readonly roadPieceId: number;
    readonly offsetRoadCenter: number;
    readonly intersectionCode: number;
    readonly isExisting: number;
    readonly mmSinceLastTransitionBar: number;
    readonly mmSinceLastIntersectionCode: number;
    constructor(id: string, payload: Buffer, type?: number);
}

declare class OffsetRoadCenterResponse extends Message {
    readonly offset: number;
    readonly laneChangeId: number;
    constructor(id: string, payload: Buffer, type?: number);
}

declare class PingResponse extends Message {
    constructor(id: string, payload: Buffer, type?: number);
    calculatePingTime(request: PingRequest): number;
}

declare class PositionUpdateResponse extends Message {
    readonly locationId: number;
    readonly roadPieceId: number;
    readonly offsetRoadCenter: number;
    readonly speed: number;
    readonly parsingFlags: number;
    readonly lastReceiveLaneChangeCommandId: number;
    readonly lastExecLangeChangeCommandId: number;
    readonly lastDesiredLaneChangeSpeed: number;
    readonly lastDesiredSpeed: number;
    constructor(id: string, payload: Buffer, type?: number);
}

declare class StatusResponse extends Message {
    readonly onTrack: boolean;
    readonly onCharger: boolean;
    readonly batteryLow: boolean;
    readonly batteryFull: boolean;
    constructor(id: string, payload: Buffer, type?: number);
}

declare class TransitionUpdateResponse extends Message {
    readonly roadPieceId: number;
    readonly prevRoadPieceId: number;
    readonly offsetRoadCenter: number;
    readonly lastReceiveLaneChangeCommandId: number;
    readonly lastExecLaneChangeCommandId: number;
    readonly lastDesiredLaneChangeCommandId: number;
    readonly haveFollowLineDriftPixels: number;
    readonly hadLaneChangeActivity: number;
    readonly uphillCounter: number;
    readonly downhillCounter: number;
    readonly leftWheelDistCm: number;
    readonly rightWheelDistCm: number;
    constructor(id: string, payload: Buffer, type?: number);
}

declare class VersionResponse extends Message {
    readonly version: number;
    constructor(id: string, payload: Buffer, type?: number);
}

type CarStatusListener$1 = (car: CarContract) => void;
interface CarStoreContract {
    getCar(id: string): CarContract | undefined;
    getCars(): Array<CarContract>;
    onOnline(listener: CarStatusListener$1): CarStoreContract;
    onOffline(listener: CarStatusListener$1): CarStoreContract;
    startLooking(): void;
    stopLooking(): void;
}
declare class CarStore implements CarStoreContract {
    private static _instance;
    private _store;
    private _scanner;
    private _task;
    private _interval;
    private _onlineListeners;
    private _offlineListeners;
    private constructor();
    static getInstance(): CarStoreContract;
    startLooking(): void;
    stopLooking(): void;
    getCar(id: string): CarContract | undefined;
    getCars(): Array<CarContract>;
    onOnline(listener: CarStatusListener$1): CarStoreContract;
    onOffline(listener: CarStatusListener$1): CarStoreContract;
    private synchronize;
    private carInStoreWrongConnectionState;
}

declare enum TrackDirection$1 {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3
}
type TrackPosition$1 = {
    x: number;
    y: number;
    direction: TrackDirection$1;
};
declare enum TrackType$1 {
    UNKNOWN = 0,
    STRAIGHT = 1,
    CURVE = 2,
    START_GRID = 3,
    FINISH_LINE = 4,
    FAST_N_FURIOUS_SPECIAL = 5,
    CROSSROAD = 6,
    JUMP_RAMP = 7,
    JUMP_LANDING = 8
}
declare function trackTypeFromId(id: number): TrackType$1;
interface TrackPieceContract {
    type: TrackType$1;
    id: number;
    position: TrackPosition$1;
    flipped: boolean;
    up: number;
    down: number;
    elevation: number;
    validated: boolean;
    setUpDown(up: number, down: number): void;
    isAt(position: TrackPosition$1): boolean;
    equals(piece: TrackPieceContract): boolean;
}
declare class TrackPiece implements TrackPieceContract {
    readonly type: TrackType$1;
    readonly id: number;
    readonly position: TrackPosition$1;
    readonly flipped: boolean;
    up: number;
    down: number;
    elevation: number;
    validated: boolean;
    constructor(type: TrackType$1, id: number, flipped: boolean, position: TrackPosition$1);
    setUpDown(up: number, down: number): void;
    isAt(position: TrackPosition$1): boolean;
    equals(piece: TrackPieceContract): boolean;
    toString(): string;
}

type TrackScannerListener$1 = (track: Array<TrackPieceContract>) => void;
interface TrackScannerContract {
    addListener(listener: TrackScannerListener$1): void;
    removeListener(listener: TrackScannerListener$1): void;
    scanWith(id: string): Promise<Array<TrackPieceContract>>;
}
type TrackScannedCallback = (result: boolean) => void;
declare class TrackScanner implements TrackScannerContract {
    private _store;
    private _scanning;
    private _pieces;
    private _tracking;
    private _validating;
    private _index;
    private _position;
    private _listeners;
    private _retries;
    private _maxRetries;
    private _callback;
    addListener(listener: TrackScannerListener$1): void;
    removeListener(listener: TrackScannerListener$1): void;
    scanWith(id: string): Promise<Array<TrackPieceContract>>;
    private resetTrack;
    private onMessage;
    private rotateDirection;
    private move;
    private validate;
}

declare enum GattCharacteristic {
    SERVICE_UUID = "be15beef6186407e83810bd89c4d8df4",
    READ_UUID = "be15bee06186407e83810bd89c4d8df4",
    WRITE_UUID = "be15bee16186407e83810bd89c4d8df4"
}
declare const BASE_SIZE = 1;
/**
 * Buffer utilities for optimized memory management
 */
declare const BufferUtils: {
    /**
     * Allocate a buffer with optimized pooling
     * @param size - Buffer size
     * @returns Buffer instance
     */
    allocOptimized: (size: number) => Buffer;
    /**
     * Release a buffer back to the pool for reuse
     * @param buffer - Buffer to release
     */
    release: (buffer: Buffer) => void;
    /**
     * Clear all pooled buffers
     */
    clearPool: () => void;
};

declare const CONSTANTS: {
    readonly BASE_SIZE: 1;
    readonly DEFAULT_TIMEOUT: 1500;
    readonly SCANNING_TIMEOUT: 500;
    readonly STORE_SYNC_INTERVAL: 3000;
    readonly MAX_RETRIES: 3;
    readonly DEFAULT_SPEED: 300;
    readonly DEFAULT_ACCELERATION: 500;
    readonly DEFAULT_CYCLE: 0;
    readonly DEFAULT_HOP_INTENT: 0;
    readonly DEFAULT_TAG: 0;
    readonly REQUEST_SIZES: Readonly<{
        BASE: 1;
        TURN: 3;
        SPEED: 6;
        SDK_MODE: 3;
        LIGHTS: 2;
        LIGHTS_PATTERN: 17;
        OFFSET_ROAD_CENTER: 5;
        CHANGE_LANE: 11;
    }>;
};
declare const GATT_CHARACTERISTICS: {
    readonly SERVICE_UUID: "be15beef6186407e83810bd89c4d8df4";
    readonly READ_UUID: "be15bee06186407e83810bd89c4d8df4";
    readonly WRITE_UUID: "be15bee16186407e83810bd89c4d8df4";
};
declare const enum RequestCode {
    DISCONNECT = 13,
    PING = 22,
    VERSION = 24,
    BATTERY_LEVEL = 26,
    LIGHTS = 29,
    SPEED = 36,
    CHANGE_LANE = 37,
    CANCEL_LANE_CHANGE = 38,
    SET_OFFSET_FROM_ROAD_CENTER = 44,
    TURN = 50,
    LIGHTS_PATTERN = 51,
    CONFIG_PARAMS = 69,
    SDK_MODE = 144,
    SDK_OPTION_OVERRIDE = 1
}
declare const enum ResponseCode {
    PING = 23,
    VERSION = 25,
    BATTERY_LEVEL = 27,
    POSITION_UPDATE = 39,
    TRANSITION_UPDATE = 41,
    INTERSECTION_UPDATE = 42,
    DELOCALIZED = 43,
    OFFSET_FROM_ROAD_CENTER = 45,
    STATUS_UPDATE = 63,
    COLLISION = 77,
    CYCLE_OVERTIME = 134
}
declare const TRACK_TYPE_MAP: Map<number, number>;

type CarId = string;
type DeviceAddress = string;
type MessageId = string;
type BufferHex = string;
type ColorDigit = 0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 | 0x7 | 0x8 | 0x9 | 0xA | 0xB | 0xC | 0xD | 0xE | 0xF;
type Percentage = number;
type Milliseconds = number;
type Speed = number;
type Acceleration = number;
declare const enum TrackDirection {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3
}
declare const enum TrackType {
    UNKNOWN = 0,
    STRAIGHT = 1,
    CURVE = 2,
    START_GRID = 3,
    FINISH_LINE = 4,
    FAST_N_FURIOUS_SPECIAL = 5,
    CROSSROAD = 6,
    JUMP_RAMP = 7,
    JUMP_LANDING = 8
}
interface TrackPosition {
    readonly x: number;
    readonly y: number;
    readonly direction: TrackDirection;
}
declare const enum TurnTrigger {
    IMMEDIATE = 0,
    INTERSECTION = 1
}
declare const enum TurnType {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    UTURN = 3,
    UTURN_JUMP = 4
}
declare const enum Lights {
    HEADLIGHTS_ON = 68,
    HEADLIGHTS_OFF = 4,
    TAILLIGHTS_ON = 34,
    TAILLIGHTS_OFF = 2,
    FLASH_TAILLIGHTS = 136
}
declare const enum LightsTarget {
    HEAD = 0,
    BRAKE = 1,
    FRONT = 2,
    ENGINE = 3
}
declare const enum LightsPattern {
    STEADY = 0,
    FADE = 1,
    THROB = 2,
    FLASH = 3,
    RANDOM = 4
}
declare const enum LightsChannel {
    RED = 0,
    BLUE = 2,
    GREEN = 3
}
type BluetoothState = "poweredOn" | "disconnected" | "error" | "unknown";
type CarMessageListener<T> = (message: T) => void;
type CarStatusListener<T> = (car: T) => void;
type TrackScannerListener<T> = (track: T[]) => void;
type ReadBufferListener = (data: Buffer) => void;
type DiscoverCallback<T> = (device: T) => void;
interface ScanResult<T> {
    readonly devices: T[];
    readonly timestamp: Date;
    readonly duration: Milliseconds;
}
interface PingResult {
    readonly latency: Milliseconds;
    readonly timestamp: Date;
    readonly success: boolean;
}
interface BatteryStatus {
    readonly level: Percentage;
    readonly isLow: boolean;
    readonly isCharging: boolean;
    readonly isFull: boolean;
}
interface ScannerConfig {
    readonly timeout: Milliseconds;
    readonly maxRetries: number;
    readonly serviceUUIDs: readonly string[];
}
interface CarConfig {
    readonly defaultSpeed: Speed;
    readonly defaultAcceleration: Acceleration;
    readonly respectRoadLimit: boolean;
    readonly autoReconnect: boolean;
}
declare class AnkiSDKError extends Error {
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        details: unknown;
    };
}
declare class BluetoothError extends AnkiSDKError {
    constructor(message: string, details?: unknown);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        details: unknown;
    };
}
declare class CarConnectionError extends AnkiSDKError {
    readonly carId: CarId;
    constructor(message: string, carId: CarId, details?: unknown);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        carId: string;
        details: unknown;
    };
}
declare class MessageTimeoutError extends AnkiSDKError {
    readonly messageType: string;
    constructor(message: string, messageType: string, details?: unknown);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        messageType: string;
        details: unknown;
    };
}
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type ReadOnly<T> = {
    readonly [P in keyof T]: T[P];
};
type NonEmptyArray<T> = [T, ...T[]];

export { type Acceleration, AnkiSDKError, BASE_SIZE, BatteryLevelRequest, BatteryLevelResponse, type BatteryStatus, Bluetooth, type BluetoothContract, BluetoothError, type BluetoothState, type BufferHex, BufferUtils, Builder, CONSTANTS, CancelLangeChangeRequest, Car, type CarConfig, CarConnectionError, type CarContract, type CarId, type CarMessageListener, CarScanner, type CarScannerContract, type CarStatusListener, CarStore, type CarStoreContract, ChangeLaneRequest, CollisionResponse, type ColorDigit, CycleOvertimeResponse, DelocalizedResponse, Device, type DeviceAddress, type DeviceContract, DisconnectRequest, type DiscoverCallback, GATT_CHARACTERISTICS, GattCharacteristic, IntersectionUpdateResponse, Lights, LightsChannel, LightsPattern, LightsPatternRequest, LightsRequest, LightsTarget, Message, type MessageContract, type MessageId, MessageTimeoutError, type Milliseconds, type NonEmptyArray, OffsetRoadCenterRequest, OffsetRoadCenterResponse, type Optional, type Percentage, PingRequest, PingResponse, type PingResult, PositionUpdateResponse, type ReadBuffer, type ReadBufferListener, type ReadOnly, RequestCode, ResponseCode, type ScanResult, type ScannerConfig, SdkModeRequest, type Speed, SpeedRequest, type State, StatusResponse, TRACK_TYPE_MAP, TrackDirection, TrackPiece, type TrackPieceContract, type TrackPosition, type TrackScannedCallback, TrackScanner, type TrackScannerContract, type TrackScannerListener, TrackType, TransitionUpdateResponse, TurnRequest, TurnTrigger, TurnType, VersionRequest, VersionResponse, trackTypeFromId };
