import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 5

export class OffsetRoadCenterRequest extends Message {
  public readonly offset: number

  public constructor(id: string, offset: number) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.SET_OFFSET_FROM_ROAD_CENTER, 1)
    this.payload.writeFloatLE(offset, 2)

    this.offset = offset
  }
}