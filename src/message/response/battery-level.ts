import { Message } from "../message"

export class BatteryLevelResponse extends Message {
  public readonly batteryLevel: number

  public constructor(id: string, payload: Buffer) {
    super(id, payload)

    this.batteryLevel = this.payload.readUInt16LE(2)
  }
}