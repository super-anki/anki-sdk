import { Bluetooth } from "@/ble/bluetooth"
import type { CarContract } from "@/car/car"
import type { CarScannerContract } from "@/car/scanner"
import { CarScanner } from "@/car/scanner"

export type CarStatusListener = (car: CarContract) => void

export interface CarStoreContract {
    getCar(id: string): CarContract | undefined
    getCars(): Array<CarContract>

    onOnline(listener: CarStatusListener): CarStoreContract
    onOffline(listener: CarStatusListener): CarStoreContract

    startLooking(): void
    stopLooking(): void
}

export class CarStore implements CarStoreContract {
  private static _instance: CarStoreContract

  private _store: Map<string, CarContract>
  private _scanner: CarScannerContract
  private _task!: NodeJS.Timeout
  private _interval: number = 3000
  private _onlineListeners: Array<CarStatusListener>
  private _offlineListeners: Array<CarStatusListener>

  private constructor() {
    const bluetooth = new Bluetooth()

    this._store = new Map<string, CarContract>()
    this._scanner = new CarScanner(bluetooth)
    this._onlineListeners = []
    this._offlineListeners = []
  }

  public static getInstance(): CarStoreContract {
    if (!CarStore._instance) {
      CarStore._instance = new CarStore()
    }

    return CarStore._instance
  }

  public startLooking(): void {
    this._task = setInterval(this.synchronize.bind(this), this._interval)
  }

  public stopLooking(): void {
    clearInterval(this._task)
  }

  public getCar(id: string): CarContract | undefined {
    return this._store.get(id)
  }

  public getCars(): Array<CarContract> {
    return Array.from(this._store.values())
  }

  public onOnline(listener: CarStatusListener): CarStoreContract {
    this._onlineListeners.push(listener)

    return this
  }

  public onOffline(listener: CarStatusListener): CarStoreContract {
    this._offlineListeners.push(listener)

    return this
  }

  private synchronize(): void {
    this._scanner.findAll().then((cars) => {
      cars.forEach((car) => {
        if (!this._store.has(car.id) || this.carInStoreWrongConnectionState(car.id, car.connected)) {
          this._store.set(car.id, car)
          this._onlineListeners.forEach((listener) => listener(car))
        }
      })

      this._store.forEach((value, key) => {
        if (!value.connected && !cars.some((c) => c.id === key)) {
          this._store.delete(key)
          this._offlineListeners.forEach((listener) => listener(value))
        }
      })
    })
  }

  private carInStoreWrongConnectionState(id: string, connected: boolean): boolean {
    const car = this._store.get(id)

    if (car) {
      return car.connected !== connected
    }

    return false
  }
}