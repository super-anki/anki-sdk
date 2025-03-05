import { RequestCode } from "@/utils"
import { Message } from "../message"

const REQUEST_SIZE = 3

export enum TurnTrigger {
    IMMEDIATE = 0,
    INTERSECTION = 1,
}

export enum TurnType {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    UTURN = 3,
    UTURN_JUMP = 4,
}

export class TurnRequest extends Message {
  public readonly type: TurnType
  public readonly trigger: TurnTrigger

  public constructor(
    id: string,
    type: TurnType,
    trigger: TurnTrigger = TurnTrigger.IMMEDIATE,
  ) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1))

    this.payload.writeUInt8(REQUEST_SIZE, 0)
    this.payload.writeUInt8(RequestCode.TURN, 1)
    this.payload.writeUInt8(type, 2)
    this.payload.writeUInt8(trigger, 3)

    this.type = type
    this.trigger = trigger
  }
}