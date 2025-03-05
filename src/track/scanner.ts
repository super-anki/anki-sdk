import type { CarContract } from "@/car/car"
import type { TrackPieceContract, TrackPosition } from "./piece"
import { TrackDirection, TrackPiece, TrackType, trackTypeFromId } from "./piece"
import type { Message } from "@/message/message"
import { TransitionUpdateResponse } from "@/message/response/transition-update"
import { PositionUpdateResponse } from "@/message/response/position-update"

export type TrackScannerListener = (track: Array<TrackPieceContract>) => void

export interface TrackScannerContract {
    addListener(listener: TrackScannerListener): void
    removeListener(listener: TrackScannerListener): void
    scanWith(id: string): Promise<Array<TrackPieceContract>>
}

export type TrackScannedCallback = (result: boolean) => void

export class TrackScanner implements TrackScannerContract {
  private _scanning: boolean = false
  private _pieces: Array<TrackPieceContract> = []
  private _tracking: boolean = false
  private _validating: boolean = false
  private _index: number = 0
  private _position: TrackPosition = { x: 0, y: 0, direction: TrackDirection.EAST }
  private _listeners: Array<TrackScannerListener> = []
  private _retries: number = 0
  private _maxRetries: number = 3
  private _callback!: TrackScannedCallback

  public addListener(listener: TrackScannerListener): void {
    this._listeners.push(listener)
  }

  public removeListener(listener: TrackScannerListener): void {
    this._listeners = this._listeners.filter((l) => l !== listener)
  }

  public async scanWith(id: string): Promise<Array<TrackPieceContract>> {
    const self = this
    return new Promise<Array<TrackPieceContract>>((resolve, reject) => {
      if (self._scanning) {
        reject("Already scanning")
        return
      }

      self.resetTrack()
      self._callback = (result: boolean) => {
        self._scanning = false
        car?.setSpeed(0, 500)
        car?.removeListener(self.onMessage.bind(self))
        if (result) {
          resolve(self._pieces)
        } else {
          reject("Invalid track")
        }
      }

      const car = { id } as CarContract
      car?.addListener(self.onMessage.bind(self))
      car?.setSpeed(450, 500)
      car?.changeLane(0)
    })
  }

  private resetTrack(): void {
    this._pieces = []
    this._index = 0
    this._validating = false
    this._tracking = false
    this._retries = 0
    this._position = { x: 0, y: 0, direction: TrackDirection.EAST }
  }

  private onMessage(message: Message): void {
    if (message instanceof TransitionUpdateResponse) {
      this._tracking = true
      if (this._pieces.length > 0) {
        this._pieces[this._pieces.length - 1].setUpDown(message.uphillCounter, message.downhillCounter)
      }
    } else if (message instanceof PositionUpdateResponse) {
      if (!this._tracking) {
        return
      }

      this._tracking = false
      const autoIncrement = true
      const type = trackTypeFromId(message.roadPieceId)
      const clockwise = message.parsingFlags === 0x47
      const piece = new TrackPiece(type, message.roadPieceId, clockwise, { ...this._position })

      if (!this._validating && this._pieces.length === 0 && type !== TrackType.START_GRID) {
        return
      }

      if (!this._validating) {
        this._pieces.push(piece)
      }

      if (type === TrackType.CURVE) {
        this.rotateDirection(clockwise)
      }

      if (type !== TrackType.START_GRID && type !== TrackType.UNKNOWN) {
        this.move()
      }

      if (!this._validating && this._pieces.length >= 4 && this._pieces[0].isAt(this._position)) {
        this._validating = true
        this._index = -1
      } else if (this._validating) {
        this.validate(piece)
      }

      this._index += autoIncrement ? 1 : 0
      this._listeners.forEach((listener) => listener(this._pieces))
    }
  }

  private rotateDirection(clockwise: boolean): void {
    const direction = clockwise ? 1 : -1
    if (this._position.direction + direction === 4) {
      this._position.direction = TrackDirection.NORTH
    } else if (this._position.direction + direction === -1) {
      this._position.direction = TrackDirection.WEST
    } else {
      this._position.direction += direction
    }
  }

  private move(space: number = 1): void {
    switch (this._position.direction) {
    case TrackDirection.NORTH:
      this._position.y -= space
      break
    case TrackDirection.EAST:
      this._position.x += space
      break
    case TrackDirection.SOUTH:
      this._position.y += space
      break
    case TrackDirection.WEST:
      this._position.x -= space
      break
    }
  }

  private validate(piece: TrackPieceContract): boolean {
    if (!this._pieces[this._index].equals(piece)) {
      this._retries++
      if (this._retries >= this._maxRetries) {
        this._callback(false)
      } else {
        this._validating = false
        this.resetTrack()
        return false
      }
    } else {
      this._pieces[this._index].validated = true

      if (this._index === this._pieces.length - 1) {
        this._callback(true)
      }
    }

    return true
  }
}