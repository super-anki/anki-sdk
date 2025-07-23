export interface MessageContract {
    id: string
    timestamp: Date
    payload: Buffer
    toJsonString(): string
}

export abstract class Message implements MessageContract {
  public readonly id: string
  public readonly timestamp: Date
  public readonly payload: Buffer
  public readonly name: string
  private _type?: number

  protected constructor(id: string, payload: Buffer, type?: number) {
    this.id = id
    this.timestamp = new Date()
    this.payload = payload
    this.name = this.constructor.name
    this._type = type
  }

  public get type(): number {
    if (this._type !== undefined) {
      return this._type
    }
    
    // For request messages and full message buffers, type is at position 1
    if (this.payload.length >= 2) {
      return this.payload.readUInt8(1)
    }
    
    // Fallback - this shouldn't happen in normal usage
    return 0
  }

  public toJsonString(): string {
    return JSON.stringify(
      this,
      (key, value) => {
        if (key === "payload") {
          return value.toString("hex")
        }
        return value
      },
    )
  }

  public toString(): string {
    return this.toJsonString()
  }
}