import { Message } from "../message"

export class VersionResponse extends Message {
  public readonly version: number

  public constructor(id: string, payload: Buffer, type?: number) {
    super(id, payload, type)

    this.version = this.payload.readUInt16LE(2)
  }
}