import { Message } from "../message"

export class VersionResponse extends Message {
  public readonly version: number

  public constructor(id: string, payload: Buffer) {
    super(id, payload)

    this.version = this.payload.readUInt16LE(2)
  }
}