import { Message } from "../message"

export class SpeedUpdateResponse extends Message {
  public readonly maxSpeed: number
  public readonly acceleration: number
  public readonly speed: number
    
  public constructor(id: string, payload: Buffer) {
    super(id, payload)
    
    this.maxSpeed = payload.readUInt16LE(2)
    this.acceleration = payload.readUInt16LE(4)
    this.speed = payload.readUInt16LE(6)
  }
}