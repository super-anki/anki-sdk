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

  protected constructor(id: string, payload: Buffer) {
    this.id = id
    this.timestamp = new Date()
    this.payload = payload
    this.name = this.constructor.name
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