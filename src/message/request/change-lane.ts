import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 11

export class ChangeLaneRequest extends Message {
  public readonly offsetRoadCenter: number
  public readonly speed: number
  public readonly acceleration: number
  public readonly hopIntent: number
  public readonly tag: number

  public constructor(
    id: string,
    offsetRoadCenter: number,
    speed: number = 300,
    acceleration: number = 300,
    hopIntent: number = 0x0,
    tag: number = 0x0,
  ) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.CHANGE_LANE, 1)
    this.payload.writeUInt16LE(speed, 2)
    this.payload.writeUInt16LE(acceleration, 4)
    this.payload.writeFloatLE(offsetRoadCenter, 6)
    this.payload.writeUInt8(hopIntent, 10)
    this.payload.writeUInt8(tag, 11)

    this.offsetRoadCenter = offsetRoadCenter
    this.speed = speed
    this.acceleration = acceleration
    this.hopIntent = hopIntent
    this.tag = tag
  }
}