import { Message } from "../message"

export class BatteryLevelResponse extends Message {
  public readonly batteryLevel: number

  public constructor(id: string, payload: Buffer, type?: number) {
    super(id, payload, type)

    this.batteryLevel = this.payload.readUInt16LE(2)
  }
}