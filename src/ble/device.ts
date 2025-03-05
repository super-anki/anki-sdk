import type { Characteristic, Peripheral } from "@abandonware/noble"

export type ReadBuffer = (data: Buffer) => void

export interface DeviceContract {
    id: string
    address: string
    nameCode: number
    connected: boolean

    connect(read?: string, write?: string): Promise<DeviceContract>
    disconnect(): Promise<DeviceContract>
    read(listener: ReadBuffer): void
    write(data: Buffer): Promise<void>
}

export class Device implements DeviceContract {
  public readonly id: string
  public readonly address: string
  public readonly nameCode: number

  private _peripheral: Peripheral
  private _connected: boolean = false
  private _read?: Characteristic
  private _write?: Characteristic
  private _listeners: Array<ReadBuffer>

  public constructor(id: string, address: string, peripheral: Peripheral) {
    this.id = id
    this.address = address
    this.nameCode = peripheral.advertisement.manufacturerData.readUInt8(3) || -1
    this._peripheral = peripheral
    this._listeners = []
  }

  public get connected(): boolean {
    return this._connected
  }

  public connect(read?: string, write?: string): Promise<DeviceContract> {
    const self = this
    return new Promise<DeviceContract>((resolve, reject) => {
      self._peripheral.connect((error) => {
        if (error) {
          reject(error)
        } else {
          self.init(read, write)
            .then(() => {
              self.enableListener()
              self._connected = true
              resolve(self)
            })
        }
      })
    })
  }

  public disconnect(): Promise<DeviceContract> {
    const self = this
    return new Promise<DeviceContract>((resolve) => {
      self.removeWrite()
      self.removeRead()

      self._peripheral.disconnect(() => {
        self._listeners = []
        self._connected = false
        resolve(self)
      })
    })
  }

  public read(listener: ReadBuffer): void {
    this._listeners.push(listener)
  }

  public write(data: Buffer): Promise<void> {
    const self = this
    return new Promise<void>((resolve, reject) => {
      self._write?.write(data, false, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  private init(read?: string, write?: string): Promise<void> {
    const self = this
    return new Promise<void>((resolve, reject) => {
      self._peripheral.discoverAllServicesAndCharacteristics((error, _services, characteristics) => {
        if (error) {
          reject(error)
        } else {
          characteristics.forEach((characteristic) => {
            if (read && characteristic.uuid === read) {
              self._read = characteristic
            } else if (write && characteristic.uuid === write) {
              self._write = characteristic
            }
          })

          if (read && !self._read) {
            reject("Could not initialize read characteristic")
          } else if (write && !self._write) {
            reject("Could not initialize write characteristic")
          } else {
            resolve()
          }
        }
      })
    })
  }

  private enableListener(): void {
    this._read?.subscribe()
    this._read?.on("data", (data: Buffer): void => {
      this._listeners.forEach((listener) => listener(data))
    })
  }

  private removeWrite(): void {
    this._write?.unsubscribe()
    delete this._write
  }

  private removeRead(): void {
    this._listeners.forEach((listener) => {
      this._read?.removeListener("data", listener)
    })
    this._read?.unsubscribe()
    delete this._read
  }
}