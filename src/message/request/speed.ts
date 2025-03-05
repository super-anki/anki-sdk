import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 6

export class SpeedRequest extends Message {
  public readonly speed: number
  public readonly acceleration: number
  public readonly respectRoadLimit: boolean

  public constructor(
    id: string,
    speed: number,
    acceleration: number = 500,
    respectRoadLimit: boolean = true,
  ) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.SPEED, 1)
    this.payload.writeUInt16LE(speed, 2)
    this.payload.writeUInt16LE(acceleration, 4)
    this.payload.writeUInt8(respectRoadLimit ? 1 : 0, 6)

    this.speed = speed
    this.acceleration = acceleration
    this.respectRoadLimit = respectRoadLimit
  }
}