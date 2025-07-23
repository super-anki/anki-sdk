import { Message } from "../message"

export class StatusResponse extends Message {
  public readonly onTrack: boolean
  public readonly onCharger: boolean
  public readonly batteryLow: boolean
  public readonly batteryFull: boolean

  public constructor(id: string, payload: Buffer, type?: number) {
    super(id, payload, type)

    this.onTrack = this.payload.readUInt8(2) === 1
    this.onCharger = this.payload.readUInt8(3) === 1
    this.batteryLow = this.payload.readUInt8(4) === 1
    this.batteryFull = this.payload.readUInt8(5) === 1
  }
}