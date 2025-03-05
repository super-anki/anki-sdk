import { Message } from "../message"

export class CollisionResponse extends Message {
  public constructor(id: string, payload: Buffer) {
    super(id, payload)
  }
}