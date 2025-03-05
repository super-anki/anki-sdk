import { Message } from "../message"

export class CycleOvertimeResponse extends Message {
  public constructor(id: string, payload: Buffer) {
    super(id, payload)
  }
}