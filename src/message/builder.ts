import { ResponseCode, RequestCode } from "@/utils"
import { Message } from "./message"
import { BatteryLevelResponse } from "./response/battery-level"
import { CollisionResponse } from "./response/collision"
import { CycleOvertimeResponse } from "./response/cycle-overtime"
import { DelocalizedResponse } from "./response/delocalized"
import { IntersectionUpdateResponse } from "./response/intersection-update"
import { OffsetRoadCenterResponse } from "./response/offset-road-center"
import { PingResponse } from "./response/ping"
import { PositionUpdateResponse } from "./response/position-update"
import { StatusResponse } from "./response/status"
import { TransitionUpdateResponse } from "./response/transition-update"
import { VersionResponse } from "./response/version"

// Simple request message class for builder
class RequestMessage extends Message {
  public readonly buffer: Buffer

  constructor(buffer: Buffer, type: number) {
    super("request-message", buffer, type)
    this.buffer = buffer
  }

  public toJsonString(): string {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      type: this.type,
      buffer: Array.from(this.buffer),
    })
  }
}

export class Builder {
  private _messageId?: number
  private _payload?: Buffer
  private _id?: string
  private _type?: number
  private _speed?: number
  private _acceleration?: number
  private _lights?: number

  // Response builder constructor (3 params)
  // Request builder constructor (0 params)
  public constructor(
    id?: string,
    messageId?: number,
    payload?: Buffer,
  ) {
    if (id !== undefined && messageId !== undefined && payload !== undefined) {
      // Response builder mode
      this._id = id
      this._messageId = messageId
      this._payload = payload
    }
    // else: Request builder mode (no properties set initially)
  }

  // Request builder methods
  public setType(type: number): Builder {
    this._type = type
    return this
  }

  public setSpeed(speed: number, acceleration: number): Builder {
    this._speed = speed
    this._acceleration = acceleration
    return this
  }

  public setLights(lights: number): Builder {
    this._lights = lights
    return this
  }

  public build(): Message | null {
    // Response mode (has _messageId from constructor)
    if (this._messageId !== undefined && this._id !== undefined && this._payload !== undefined) {
      switch (this._messageId) {
      case ResponseCode.BATTERY_LEVEL:
        return new BatteryLevelResponse(this._id, this._payload, this._messageId)
      case ResponseCode.COLLISION:
        return new CollisionResponse(this._id, this._payload, this._messageId)
      case ResponseCode.CYCLE_OVERTIME:
        return new CycleOvertimeResponse(this._id, this._payload, this._messageId)
      case ResponseCode.DELOCALIZED:
        return new DelocalizedResponse(this._id, this._payload, this._messageId)
      case ResponseCode.INTERSECTION_UPDATE:
        return new IntersectionUpdateResponse(this._id, this._payload, this._messageId)
      case ResponseCode.OFFSET_FROM_ROAD_CENTER:
        return new OffsetRoadCenterResponse(this._id, this._payload, this._messageId)
      case ResponseCode.PING:
        return new PingResponse(this._id, this._payload, this._messageId)
      case ResponseCode.POSITION_UPDATE:
        return new PositionUpdateResponse(this._id, this._payload, this._messageId)
      case ResponseCode.STATUS_UPDATE:
        return new StatusResponse(this._id, this._payload, this._messageId)
      case ResponseCode.TRANSITION_UPDATE:
        return new TransitionUpdateResponse(this._id, this._payload, this._messageId)
      case ResponseCode.VERSION:
        return new VersionResponse(this._id, this._payload, this._messageId)
      default:
        return null
      }
    }

    // Request mode (has _type from setType)
    if (this._type !== undefined) {
      // Create a basic request message with buffer
      const buffer = Buffer.alloc(16) // Default size
      buffer.writeUInt8(this._type, 0) // Write request code at position 0
      
      if (this._type === RequestCode.SPEED && this._speed !== undefined && this._acceleration !== undefined) {
        buffer.writeUInt16LE(this._speed, 2)
        buffer.writeUInt16LE(this._acceleration, 4)
      }
      
      if (this._type === RequestCode.LIGHTS && this._lights !== undefined) {
        buffer.writeUInt8(this._lights, 1)
      }

      return new RequestMessage(buffer, this._type)
    }

    return null
  }
}