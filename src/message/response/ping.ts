import { Message } from "../message"
import type { PingRequest } from "../request/ping"

export class PingResponse extends Message {
  public constructor(id: string, payload: Buffer, type?: number) {
    super(id, payload, type)
  }

  public calculatePingTime(request: PingRequest): number {
    return this.timestamp.getMilliseconds() - request.timestamp.getMilliseconds()
  }
}