import { Message } from "../message"

export class PositionUpdateResponse extends Message {
  public readonly locationId: number
  public readonly roadPieceId: number
  public readonly offsetRoadCenter: number
  public readonly speed: number
  public readonly parsingFlags: number
  public readonly lastReceiveLaneChangeCommandId: number
  public readonly lastExecLaneChangeCommandId: number
  public readonly lastDesiredLaneChangeSpeed: number
  public readonly lastDesiredSpeed: number
    
  public constructor(id: string, payload: Buffer, type?: number) {
    super(id, payload, type)

    this.locationId = this.payload.readUInt8(2)
    this.roadPieceId = this.payload.readUInt8(3)
    this.offsetRoadCenter = this.payload.readFloatLE(4)
    this.speed = this.payload.readUInt16LE(8)
    this.parsingFlags = this.payload.readUInt8(10)
    this.lastReceiveLaneChangeCommandId = this.payload.readUInt8(11)
    this.lastExecLaneChangeCommandId = this.payload.readUInt8(12)
    this.lastDesiredLaneChangeSpeed = this.payload.readUInt16LE(13)
    this.lastDesiredSpeed = this.payload.readUInt16LE(15)
  }
}