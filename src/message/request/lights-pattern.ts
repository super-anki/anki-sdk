import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 17

export type ColorDigit = 0x0 | 0x1 | 0x2 | 0x3 | 0x4 | 0x5 | 0x6 | 0x7 | 0x8 | 0x9 | 0xA | 0xB | 0xC | 0xD | 0xE | 0xF

export enum LightsTarget {
    HEAD = 0x00,
    BRAKE = 0x01,
    FRONT = 0x02,
    ENGINE = 0x03,
}

export enum LightsPattern {
    STEADY = 0x00,
    FADE = 0x01,
    THROB = 0x02,
    FLASH = 0x03,
    RANDOM = 0x04,
}

export enum LightsChannel {
    RED = 0x00,
    BLUE = 0x02,
    GREEN = 0x03,
}

export class LightsPatternRequest extends Message {
  public constructor(
    id: string,
    redStart: ColorDigit,
    redEnd: ColorDigit,
    greenStart: ColorDigit,
    greenEnd: ColorDigit,
    blueStart: ColorDigit,
    blueEnd: ColorDigit,
    target: LightsTarget,
    pattern: LightsPattern,
    cycle: number = 0x00,
  ) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.LIGHTS_PATTERN, 1)
    this.payload.writeUInt8(target, 2)
    this.payload.writeUInt8(LightsChannel.RED, 3)
    this.payload.writeUInt8(pattern, 4)
    this.payload.writeUInt8(redStart, 5)
    this.payload.writeUInt8(redEnd, 6)
    this.payload.writeUInt8(cycle, 7)
    this.payload.writeUInt8(LightsChannel.GREEN, 8)
    this.payload.writeUInt8(pattern, 9)
    this.payload.writeUInt8(greenStart, 10)
    this.payload.writeUInt8(greenEnd, 11)
    this.payload.writeUInt8(cycle, 12)
    this.payload.writeUInt8(LightsChannel.BLUE, 13)
    this.payload.writeUInt8(pattern, 14)
    this.payload.writeUInt8(blueStart, 15)
    this.payload.writeUInt8(blueEnd, 16)
    this.payload.writeUInt8(cycle, 17)
  }
}