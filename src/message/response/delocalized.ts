import { Message } from "../message"

export class DelocalizedResponse extends Message {
  public constructor(id: string, payload: Buffer) {
    super(id, payload)
  }
}