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
type DiscoverCallback = (device: DeviceContract) => void;
interface BluetoothContract {
    onDiscover: DiscoverCallback;
    state: State;
    timeout: number;
    startScanning(uuids?: Array<string>): Promise<void>;
    stopScanning(): Promise<void>;
}
declare class Bluetooth implements BluetoothContract {
    private _onDiscover;
    private _state;
    private _timeout;
    constructor(onDiscover?: DiscoverCallback, timeout?: number);
    startScanning(uuids?: Array<string>): Promise<void>;
    stopScanning(): Promise<void>;
    set onDiscover(callback: DiscoverCallback);
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
    protected constructor(id: string, payload: Buffer);
    toJsonString(): string;
    toString(): string;
}

declare enum Lights {
    HEADLIGHTS_ON = 68,
    HEADLIGHTS_OFF = 4,
    TAILLIGHTS_ON = 34,
    TAILLIGHTS_OFF = 2,
    FLASH_TAILLIGHTS = 136
}
declare class LightsRequest extends Message {
    constructor(id: string, lights: Lights);
}

type ColorDigit = 0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 | 0x7 | 0x8 | 0x9 | 0xA | 0xB | 0xC | 0xD | 0xE | 0xF;
declare enum LightsTarget {
    HEAD = 0,
    BRAKE = 1,
    FRONT = 2,
    ENGINE = 3
}
declare enum LightsPattern {
    STEADY = 0,
    FADE = 1,
    THROB = 2,
    FLASH = 3,
    RANDOM = 4
}
declare enum LightsChannel {
    RED = 0,
    BLUE = 2,
    GREEN = 3
}
declare class LightsPatternRequest extends Message {
    constructor(id: string, redStart: ColorDigit, redEnd: ColorDigit, greenStart: ColorDigit, greenEnd: ColorDigit, blueStart: ColorDigit, blueEnd: ColorDigit, target: LightsTarget, pattern: LightsPattern, cycle?: number);
}

type CarMessageListener<T extends Message> = (message: T) => void;
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
    setLights(lights: Lights): void;
    setLightsPattern(redStart: ColorDigit, redEnd: ColorDigit, greenStart: ColorDigit, greenEnd: ColorDigit, blueStart: ColorDigit, blueEnd: ColorDigit, target?: LightsTarget, pattern?: LightsPattern, cycle?: number): void;
    turnRight(): void;
    turnLeft(): void;
    uTurn(): void;
    uTurnJump(): void;
    addListener<T extends Message>(listener: CarMessageListener<T>): void;
    removeListener<T extends Message>(listener: CarMessageListener<T>): void;
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
    setLights(lights: Lights): void;
    setLightsPattern(redStart: ColorDigit, redEnd: ColorDigit, greenStart: ColorDigit, greenEnd: ColorDigit, blueStart: ColorDigit, blueEnd: ColorDigit, target?: LightsTarget, pattern?: LightsPattern, cycle?: number): void;
    turnLeft(): void;
    turnRight(): void;
    uTurn(): void;
    uTurnJump(): void;
    get offset(): number;
    get connected(): boolean;
    addListener<T extends Message>(listener: CarMessageListener<T>): void;
    removeListener<T extends Message>(listener: CarMessageListener<T>): void;
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
    private _messageId;
    private _payload;
    private _id;
    constructor(id: string, messageId: number, payload: Buffer);
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

declare enum TurnTrigger {
    IMMEDIATE = 0,
    INTERSECTION = 1
}
declare enum TurnType {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    UTURN = 3,
    UTURN_JUMP = 4
}
declare class TurnRequest extends Message {
    readonly type: TurnType;
    readonly trigger: TurnTrigger;
    constructor(id: string, type: TurnType, trigger?: TurnTrigger);
}

declare class VersionRequest extends Message {
    constructor(id: string);
}

declare class BatteryLevelResponse extends Message {
    readonly batteryLevel: number;
    constructor(id: string, payload: Buffer);
}

declare class CollisionResponse extends Message {
    constructor(id: string, payload: Buffer);
}

declare class CycleOvertimeResponse extends Message {
    constructor(id: string, payload: Buffer);
}

declare class DelocalizedResponse extends Message {
    constructor(id: string, payload: Buffer);
}

declare class IntersectionUpdateResponse extends Message {
    readonly roadPieceId: number;
    readonly offsetRoadCenter: number;
    readonly intersectionCode: number;
    readonly isExisting: number;
    readonly mmSinceLastTransitionBar: number;
    readonly mmSinceLastIntersectionCode: number;
    constructor(id: string, payload: Buffer);
}

declare class OffsetRoadCenterResponse extends Message {
    readonly offset: number;
    readonly laneChangeId: number;
    constructor(id: string, payload: Buffer);
}

declare class PingResponse extends Message {
    constructor(id: string, payload: Buffer);
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
    constructor(id: string, payload: Buffer);
}

declare class StatusResponse extends Message {
    readonly onTrack: boolean;
    readonly onCharger: boolean;
    readonly batteryLow: boolean;
    readonly batteryFull: boolean;
    constructor(id: string, payload: Buffer);
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
    constructor(id: string, payload: Buffer);
}

declare class VersionResponse extends Message {
    readonly version: number;
    constructor(id: string, payload: Buffer);
}

type CarStatusListener = (car: CarContract) => void;
interface CarStoreContract {
    getCar(id: string): CarContract | undefined;
    getCars(): Array<CarContract>;
    onOnline(listener: CarStatusListener): CarStoreContract;
    onOffline(listener: CarStatusListener): CarStoreContract;
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
    onOnline(listener: CarStatusListener): CarStoreContract;
    onOffline(listener: CarStatusListener): CarStoreContract;
    private synchronize;
    private carInStoreWrongConnectionState;
}

declare enum TrackDirection {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3
}
type TrackPosition = {
    x: number;
    y: number;
    direction: TrackDirection;
};
declare enum TrackType {
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
declare function trackTypeFromId(id: number): TrackType;
interface TrackPieceContract {
    type: TrackType;
    id: number;
    position: TrackPosition;
    flipped: boolean;
    up: number;
    down: number;
    elevation: number;
    validated: boolean;
    setUpDown(up: number, down: number): void;
    isAt(position: TrackPosition): boolean;
    equals(piece: TrackPieceContract): boolean;
}
declare class TrackPiece implements TrackPieceContract {
    readonly type: TrackType;
    readonly id: number;
    readonly position: TrackPosition;
    readonly flipped: boolean;
    up: number;
    down: number;
    elevation: number;
    validated: boolean;
    constructor(type: TrackType, id: number, flipped: boolean, position: TrackPosition);
    setUpDown(up: number, down: number): void;
    isAt(position: TrackPosition): boolean;
    equals(piece: TrackPieceContract): boolean;
    toString(): string;
}

type TrackScannerListener = (track: Array<TrackPieceContract>) => void;
interface TrackScannerContract {
    addListener(listener: TrackScannerListener): void;
    removeListener(listener: TrackScannerListener): void;
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
    addListener(listener: TrackScannerListener): void;
    removeListener(listener: TrackScannerListener): void;
    scanWith(id: string): Promise<Array<TrackPieceContract>>;
    private resetTrack;
    private onMessage;
    private rotateDirection;
    private move;
    private validate;
}

export { BatteryLevelRequest, BatteryLevelResponse, Bluetooth, type BluetoothContract, Builder, CancelLangeChangeRequest, Car, type CarContract, type CarMessageListener, CarScanner, type CarScannerContract, type CarStatusListener, CarStore, type CarStoreContract, ChangeLaneRequest, CollisionResponse, type ColorDigit, CycleOvertimeResponse, DelocalizedResponse, Device, type DeviceContract, DisconnectRequest, type DiscoverCallback, IntersectionUpdateResponse, Lights, LightsChannel, LightsPattern, LightsPatternRequest, LightsRequest, LightsTarget, Message, type MessageContract, OffsetRoadCenterRequest, OffsetRoadCenterResponse, PingRequest, PingResponse, PositionUpdateResponse, type ReadBuffer, SdkModeRequest, SpeedRequest, type State, StatusResponse, TrackDirection, TrackPiece, type TrackPieceContract, type TrackPosition, type TrackScannedCallback, TrackScanner, type TrackScannerContract, type TrackScannerListener, TrackType, TransitionUpdateResponse, TurnRequest, TurnTrigger, TurnType, VersionRequest, VersionResponse, trackTypeFromId };
