import type { DeviceContract } from "@/ble/device"
import { Builder } from "@/message/builder"
import type { Message } from "@/message/message"
import { BatteryLevelRequest } from "@/message/request/battery-level"
import { CancelLangeChangeRequest } from "@/message/request/cancel-lane-change"
import { ChangeLaneRequest } from "@/message/request/change-lane"
import { DisconnectRequest } from "@/message/request/disconnect"
import type { Lights } from "@/message/request/lights"
import { LightsRequest } from "@/message/request/lights"
import type { ColorDigit } from "@/message/request/lights-pattern"
import { LightsPattern, LightsPatternRequest, LightsTarget } from "@/message/request/lights-pattern"
import { OffsetRoadCenterRequest } from "@/message/request/offset-road-center"
import { PingRequest } from "@/message/request/ping"
import { SdkModeRequest } from "@/message/request/sdk-mode"
import { SpeedRequest } from "@/message/request/speed"
import { TurnRequest, TurnType } from "@/message/request/turn"
import { VersionRequest } from "@/message/request/version"
import type { BatteryLevelResponse } from "@/message/response/battery-level"
import type { PingResponse } from "@/message/response/ping"
import type { VersionResponse } from "@/message/response/version"
import { GattCharacteristic, ResponseCode } from "@/utils"

export type CarMessageListener<T extends Message> = (message: T) => void

export interface CarContract {
    id: string
    address: string
    connected: boolean
    nameCode: number
    offset: number

    cancelLangeChange(): void
    changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void
    connect(): Promise<CarContract>
    disableSdkMode(): void
    disconnect(): Promise<CarContract>
    enableSdkMode(): void
    getBatteryLevel(): Promise<number>
    getPing(): Promise<number>
    getVersion(): Promise<number>
    setOffset(offset: number): void
    setSpeed(speed: number, acceleration?: number, respectRoadLimit?: boolean): void
    setLights(lights: Lights): void
    setLightsPattern(
        redStart: ColorDigit,
        redEnd: ColorDigit,
        greenStart: ColorDigit,
        greenEnd: ColorDigit,
        blueStart: ColorDigit,
        blueEnd: ColorDigit,
        target?: LightsTarget,
        pattern?: LightsPattern,
        cycle?: number,
    ): void
    turnRight(): void
    turnLeft(): void
    uTurn(): void
    uTurnJump(): void
    addListener<T extends Message>(listener: CarMessageListener<T>): void
    removeListener<T extends Message>(listener: CarMessageListener<T>): void
}

export class Car implements CarContract {
  public readonly id: string
  public readonly address: string
  public readonly nameCode: number

  private _connected: boolean
  private _offset: number
  private _device: DeviceContract
  private _listeners: Array<CarMessageListener<Message>>

  public constructor(
    device: DeviceContract,
    offset: number = 0.0,
  ) {
    this._device = device
    this._offset = offset

    this.nameCode = device.nameCode
    this.id = device.id
    this.address = device.address

    this._connected = false
    this._listeners = []
  }

  public cancelLangeChange(): void {
    this.writePublish(new CancelLangeChangeRequest(this.id))
  }

  public changeLane(offset: number, speed?: number, acceleration?: number, hopIntent?: number, tag?: number): void {
    this.writePublish(new ChangeLaneRequest(this.id, offset, speed, acceleration, hopIntent, tag))
  }

  public connect(): Promise<CarContract> {
    const self = this
    return new Promise<CarContract>((resolve, reject) => {
      self._device.connect(GattCharacteristic.READ_UUID, GattCharacteristic.WRITE_UUID).then(() => {
        self.enableSdkMode()
        self._device.read((data) => self.readPublish(data))
        self._connected = true
        resolve(self)
      }).catch(reject)
    })
  }

  public disableSdkMode(): void {
    this.writePublish(new SdkModeRequest(this.id, false))
  }

  public disconnect(): Promise<CarContract> {
    const self = this
    return new Promise<CarContract>((resolve, reject) => {
      self.writePublish(new DisconnectRequest(self.id))
      self.removeAllListeners()
      self.disableSdkMode()
      self._device.disconnect()
        .then(() => {
          self._connected = false
          resolve(self)
        }).catch(reject)
    })
  }

  public enableSdkMode(): void {
    this.writePublish(new SdkModeRequest(this.id, true))
  }

  public getBatteryLevel(): Promise<number> {
    const self = this
    return new Promise<number>((resolve, reject) => {
      self.send<BatteryLevelRequest, BatteryLevelResponse>(
        new BatteryLevelRequest(self.id),
        ResponseCode.BATTERY_LEVEL,
      ).then((message: BatteryLevelResponse) => resolve(message.batteryLevel))
        .catch(reject)
    })
  }

  public getPing(): Promise<number> {
    const self = this
    return new Promise<number>((resolve, reject) => {
      const request = new PingRequest(self.id)

      self.send<PingRequest, PingResponse>(request, ResponseCode.PING)
        .then((message: PingResponse) => resolve(message.calculatePingTime(request)))
        .catch(reject)
    })
  }

  public getVersion(): Promise<number> {
    const self = this
    return new Promise<number>((resolve, reject) => {
      self.send<VersionRequest, VersionResponse>(
        new VersionRequest(self.id),
        ResponseCode.VERSION,
      ).then((message: VersionResponse) => resolve(message.version))
        .catch(reject)
    })
  }

  public setOffset(offset: number): void {
    this.writePublish(new OffsetRoadCenterRequest(this.id, offset))
    this._offset = offset
  }

  public setSpeed(speed: number, acceleration?: number, respectRoadLimit?: boolean): void {
    this.writePublish(new SpeedRequest(this.id, speed, acceleration, respectRoadLimit))
  }

  public setLights(lights: Lights): void {
    this.writePublish(new LightsRequest(this.id, lights))
  }

  public setLightsPattern(
    redStart: ColorDigit,
    redEnd: ColorDigit,
    greenStart: ColorDigit, 
    greenEnd: ColorDigit,
    blueStart: ColorDigit,
    blueEnd: ColorDigit,
    target: LightsTarget = LightsTarget.ENGINE,
    pattern: LightsPattern = LightsPattern.STEADY,
    cycle: number = 0,
  ): void {
    this.writePublish(new LightsPatternRequest(
      this.id,
      redStart,
      redEnd,
      greenStart,
      greenEnd,
      blueStart,
      blueEnd,
      target,
      pattern,
      cycle,
    ))
  }

  public turnLeft(): void {
    this.writePublish(new TurnRequest(this.id, TurnType.LEFT))
  }

  public turnRight(): void {
    this.writePublish(new TurnRequest(this.id, TurnType.RIGHT))
  }

  public uTurn(): void {
    this.writePublish(new TurnRequest(this.id, TurnType.UTURN))
  }

  public uTurnJump(): void {
    this.writePublish(new TurnRequest(this.id, TurnType.UTURN_JUMP))
  }

  public get offset(): number {
    return this._offset
  }

  public get connected(): boolean {
    return this._connected
  }

  public addListener<T extends Message>(listener: CarMessageListener<T>): void {
    this._listeners.push(listener as CarMessageListener<Message>)
  }

  public removeListener<T extends Message>(listener: CarMessageListener<T>): void {
    this._listeners = this._listeners.filter((l) => l !== listener)
  }

  private removeAllListeners(): void {
    this._listeners = []
  }

  private readPublish(payload: Buffer): void {
    this._listeners.forEach((listener) => {
      const message = new Builder(this.id, payload.readUInt8(1), payload).build()

      if (message) {
        listener(message)
      }
    })
  }

  private writePublish(message: Message): void {
    this._device.write(message.payload).then(() => {
      this._listeners.forEach((listener) => listener(message))
    })
  }

  private send<Req extends Message, Res extends Message>(
    request: Req,
    responseId: number,
  ): Promise<Res> {
    const self = this
    return new Promise<Res>((resolve, reject) => {
      const listener = (message: Res) => {
        if (message && message.payload.readUInt8(1) === responseId) {
          clearTimeout(timeout)
          self.removeListener(listener)
          resolve(message)
        }
      }

      const timeout = setTimeout(() => {
        self.removeListener(listener)
        reject(`Timeout waiting for response ${responseId}`)
      }, 1500)

      self.addListener(listener)
      self.writePublish(request)
    })
  }
}