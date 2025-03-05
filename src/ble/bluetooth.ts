import noble from "@abandonware/noble"

import type { DeviceContract } from "./device"
import { Device } from "./device"

export type State = ( "poweredOn" | "disconnected" | "error" | "unknown" )

export type DiscoverCallback = (device: DeviceContract) => void

export interface BluetoothContract {
    onDiscover: DiscoverCallback
    state: State
    timeout: number

    startScanning(uuids?: Array<string>): Promise<void>
    stopScanning(): Promise<void>
}

export class Bluetooth implements BluetoothContract {
  private _onDiscover: DiscoverCallback
  private _state: State
  private _timeout: number

  public constructor(
    onDiscover: DiscoverCallback = () => {},
    timeout: number = 500,
  ) {
    this._onDiscover = onDiscover
    this._timeout = timeout
    this._state = "unknown"
  }

  public startScanning(uuids?: Array<string>): Promise<void> {
    const self = this
    return new Promise<void>((resolve) => {
      noble.on("stateChange", async (state) => {
        if (state === "poweredOn") {
          await noble.startScanningAsync(uuids, false)
        }
      })
      noble.on("discover", (async (peripheral) => {
        self._state = "poweredOn"
        self._onDiscover(new Device(peripheral.id, peripheral.address, peripheral))
        resolve()
      }))

      if (self._state === "poweredOn") {
        noble.startScanning(uuids, false)
      }
    })
  }

  public stopScanning(): Promise<void> {
    const self = this
    return new Promise<void>((resolve, reject) => {
      if (self._state === "poweredOn") {
        noble.stopScanningAsync().then(() => {
          noble.removeListener("discover", self._onDiscover)
          resolve()
        })
      } else {
        reject("Bluetooth is still offline")
      }
    })
  }

  public set onDiscover(callback: DiscoverCallback) {
    this._onDiscover = callback
  }

  public set timeout(timeout: number) {
    this._timeout = timeout
  }

  public get timeout(): number {
    return this._timeout
  }

  public get state(): State {
    return this._state
  }
}