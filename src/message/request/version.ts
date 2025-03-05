import { BASE_SIZE, RequestCode } from "@/utils"
import { Message } from "../message"

export class VersionRequest extends Message {
  public constructor(id: string) {
    super(id, Buffer.alloc(BASE_SIZE + 1))

    this.payload.writeUInt8(BASE_SIZE, 0)
    this.payload.writeUInt8(RequestCode.VERSION, 1)
  }
}