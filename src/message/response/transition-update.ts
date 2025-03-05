import { Message } from "../message"

export class TransitionUpdateResponse extends Message {
  public readonly roadPieceId: number
  public readonly prevRoadPieceId: number
  public readonly offsetRoadCenter: number
  public readonly lastReceiveLaneChangeCommandId: number
  public readonly lastExecLaneChangeCommandId: number
  public readonly lastDesiredLaneChangeCommandId: number
  public readonly haveFollowLineDriftPixels: number
  public readonly hadLaneChangeActivity: number
  public readonly uphillCounter: number
  public readonly downhillCounter: number
  public readonly leftWheelDistCm: number
  public readonly rightWheelDistCm: number

  public constructor(id: string, payload: Buffer) {
    super(id, payload)

    this.roadPieceId = this.payload.readUInt8(2)
    this.prevRoadPieceId = this.payload.readUInt8(3)
    this.offsetRoadCenter = this.payload.readFloatLE(4)
    this.lastReceiveLaneChangeCommandId = this.payload.readUInt8(8)
    this.lastExecLaneChangeCommandId = this.payload.readUInt8(9)
    this.lastDesiredLaneChangeCommandId = this.payload.readUInt16LE(10)
    this.haveFollowLineDriftPixels = this.payload.readUInt8(12)
    this.hadLaneChangeActivity = this.payload.readUInt8(13)
    this.uphillCounter = this.payload.readUInt8(14)
    this.downhillCounter = this.payload.readUInt8(15)
    this.leftWheelDistCm = this.payload.readUInt8(16)
    this.rightWheelDistCm = this.payload.readUInt8(17)
  }
}