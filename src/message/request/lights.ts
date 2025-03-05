import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 2

export enum Lights {
    HEADLIGHTS_ON = 0x44,
    HEADLIGHTS_OFF = 0x04,
    TAILLIGHTS_ON = 0x22,
    TAILLIGHTS_OFF = 0x02,
    FLASH_TAILLIGHTS = 0x88,
}

export class LightsRequest extends Message {
  public constructor(id: string, lights: Lights) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.LIGHTS, 1)
    this.payload.writeUInt8(lights, 2)
  }
}