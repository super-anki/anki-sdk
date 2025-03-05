import type { BluetoothContract } from "@/ble/bluetooth"
import type { CarContract } from "./car"
import { Car } from "./car"
import { GattCharacteristic } from "@/utils"
import type { DeviceContract } from "@/ble/device"

export interface CarScannerContract {
    timeout: number

    findAll(): Promise<Array<CarContract>>
    findById(id: string): Promise<CarContract>
    findByAddress(address: string): Promise<CarContract>
    findAny(): Promise<CarContract>
}

export class CarScanner implements CarScannerContract {
  private readonly _bluetooth: BluetoothContract
  private _cars: Array<CarContract>
  private _timeout: number

  public constructor(
    bluetooth: BluetoothContract,
    timeout: number = 500,
  ) {
    this._bluetooth = bluetooth
    this._bluetooth.onDiscover = this.onDiscover.bind(this)
    this._timeout = timeout
    this._cars = []
  }

  public findAll(): Promise<Array<CarContract>> {
    const self = this
    return new Promise<Array<CarContract>>((resolve, reject) => {
      self._cars = []
      self._bluetooth.startScanning([GattCharacteristic.SERVICE_UUID])
        .then(() => {
          self.awaitScanning()
            .then(resolve)
            .catch(reject)
        }).catch(reject)
    })
  }

  public findById(id: string): Promise<CarContract> {
    const self = this
    return new Promise<CarContract>((resolve, reject) => {
      self.findAll()
        .then((cars) => {
          const car = cars.find((c) => c.id === id)
          if (car) {
            resolve(car)
          } else {
            reject(`Car with id [${id}] not found`)
          }
        }).catch(reject)
    })
  }

  public findByAddress(address: string): Promise<CarContract> {
    const self = this
    return new Promise<CarContract>((resolve, reject) => {
      self.findAll()
        .then((cars) => {
          const car = cars.find((c) => c.address === address)
          if (car) {
            resolve(car)
          } else {
            reject(`Car with address [${address}] not found`)
          }
        }).catch(reject)
    })
  }

  public findAny(): Promise<CarContract> {
    const self = this
    return new Promise<CarContract>((resolve, reject) => {
      self.findAll()
        .then((cars) => {
          if (cars.length) {
            resolve(cars[0])
          } else {
            reject("No cars found")
          }
        }).catch(reject)
    })
  }

  public get timeout(): number {
    return this._timeout
  }

  public set timeout(value: number) {
    this._timeout = value
  }

  private onDiscover(device: DeviceContract): void {
    if (!this.contains(device.id)) {
      this._cars.push(new Car(device))
    }
  }

  private contains(id: string): boolean {
    return this._cars.some((c) => c.id === id)
  }

  private awaitScanning(): Promise<Array<CarContract>> {
    const self = this
    return new Promise<Array<CarContract>>((resolve, reject) => {
      setTimeout(() => {
        self._bluetooth.stopScanning()
          .then(() => resolve(self._cars))
          .catch(reject)
      }, self._timeout)
    })
  }
}