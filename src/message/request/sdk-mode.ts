import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 3

export class SdkModeRequest extends Message {
  public readonly on: boolean
  public readonly flags: number

  public constructor(
    id: string,
    on: boolean = true,
    flags: number = RequestCode.SDK_OPTION_OVERRIDE,
  ) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.SDK_MODE, 1)
    this.payload.writeUInt8(on ? 1 : 0, 2)
    this.payload.writeUInt8(flags, 3)

    this.on = on
    this.flags = flags
  }
}