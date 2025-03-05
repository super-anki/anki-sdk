import { ResponseCode } from "@/utils"
import type { Message } from "./message"
import { BatteryLevelResponse } from "./response/battery-level"
import { CollisionResponse } from "./response/colllision"
import { CycleOvertimeResponse } from "./response/cycle-overtime"
import { DelocalizedResponse } from "./response/delocalized"
import { IntersectionUpdateResponse } from "./response/intersection-update"
import { OffsetRoadCenterResponse } from "./response/offset-road-center"
import { PingResponse } from "./response/ping"
import { PositionUpdateResponse } from "./response/position-update"
import { StatusResponse } from "./response/status"
import { TransitionUpdateResponse } from "./response/transition-update"
import { VersionResponse } from "./response/version"

export class Builder {
  private _messageId: number
  private _payload: Buffer
  private _id: string

  public constructor(
    id: string,
    messageId: number,
    payload: Buffer,
  ) {
    this._id = id
    this._messageId = messageId
    this._payload = payload
  }

  public build(): Message | null {
    switch (this._messageId) {
    case ResponseCode.BATTERY_LEVEL:
      return new BatteryLevelResponse(this._id, this._payload)
    case ResponseCode.COLLISION:
      return new CollisionResponse(this._id, this._payload)
    case ResponseCode.CYCLE_OVERTIME:
      return new CycleOvertimeResponse(this._id, this._payload)
    case ResponseCode.DELOCALIZED:
      return new DelocalizedResponse(this._id, this._payload)
    case ResponseCode.INTERSECTION_UPDATE:
      return new IntersectionUpdateResponse(this._id, this._payload)
    case ResponseCode.OFFSET_FROM_ROAD_CENTER:
      return new OffsetRoadCenterResponse(this._id, this._payload)
    case ResponseCode.PING:
      return new PingResponse(this._id, this._payload)
    case ResponseCode.POSITION_UPDATE:
      return new PositionUpdateResponse(this._id, this._payload)
    case ResponseCode.STATUS_UPDATE:
      return new StatusResponse(this._id, this._payload)
    case ResponseCode.TRANSITION_UPDATE:
      return new TransitionUpdateResponse(this._id, this._payload)
    case ResponseCode.VERSION:
      return new VersionResponse(this._id, this._payload)
    default:
      return null
    }
  }
}