import { Message } from "../message"

export class OffsetRoadCenterResponse extends Message {
  public readonly offset: number
  public readonly laneChangeId: number

  public constructor(id: string, payload: Buffer) {
    super(id, payload)

    this.offset = this.payload.readFloatLE(2)
    this.laneChangeId = this.payload.readUInt8(6)
  }
}