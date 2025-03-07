import { Message } from "../message"

export class OffsetUpdateResponse extends Message {
  public readonly offset: number
  public readonly desiredOffset: number
  public readonly speed: number

  public constructor(id: string, payload: Buffer) {
    super(id, payload)

    this.offset = payload.readFloatLE(2)
    this.desiredOffset = payload.readFloatLE(6)
    this.speed = payload.readUInt16LE(12)
    // this.payload.readUInt8(14) // Unknown value
  }
}