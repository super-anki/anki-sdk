import { Message } from "../message"

export class IntersectionUpdateResponse extends Message {
  public readonly roadPieceId: number
  public readonly offsetRoadCenter: number
  public readonly intersectionCode: number
  public readonly isExisting: number
  public readonly mmSinceLastTransitionBar: number
  public readonly mmSinceLastIntersectionCode: number

  public constructor(id: string, payload: Buffer, type?: number) {
    super(id, payload, type)

    this.roadPieceId = this.payload.readUInt8(2)
    this.offsetRoadCenter = this.payload.readFloatLE(3)
    this.intersectionCode = this.payload.readUInt8(7)
    this.isExisting = this.payload.readUInt8(8)
    this.mmSinceLastTransitionBar = this.payload.readUInt16LE(9)
    this.mmSinceLastIntersectionCode = this.payload.readUInt16LE(11)
  }
}