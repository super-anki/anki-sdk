export enum TrackDirection {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3,
}

export type TrackPosition = {
    x: number,
    y: number,
    direction: TrackDirection,
}

export enum TrackType {
    UNKNOWN = 0,
    STRAIGHT = 1,
    CURVE = 2,
    START_GRID = 3,
    FINISH_LINE = 4,
    FAST_N_FURIOUS_SPECIAL = 5,
    CROSSROAD = 6,
    JUMP_RAMP = 7,
    JUMP_LANDING = 8,
}

export function trackTypeFromId(id: number): TrackType {
  switch (id) {
  case 17:
  case 18:
  case 20:
  case 23:
    return TrackType.CURVE
  case 36:
  case 39:
  case 40:
  case 51:
    return TrackType.STRAIGHT
  case 57:
    return TrackType.FAST_N_FURIOUS_SPECIAL
  case 34:
    return TrackType.START_GRID
  case 33:
    return TrackType.FINISH_LINE
  case 10:
    return TrackType.CROSSROAD
  case 58:
    return TrackType.JUMP_RAMP
  case 63:
    return TrackType.JUMP_LANDING
  default:
    return TrackType.UNKNOWN
  }
}

export interface TrackPieceContract {
    type: TrackType
    id: number
    position: TrackPosition
    flipped: boolean

    up: number
    down: number
    elevation: number
    validated: boolean

    setUpDown(up: number, down: number): void
    isAt(position: TrackPosition): boolean
    equals(piece: TrackPieceContract): boolean
}

export class TrackPiece implements TrackPieceContract {
  public readonly type: TrackType
  public readonly id: number
  public readonly position: TrackPosition
  public readonly flipped: boolean

  public up: number
  public down: number
  public elevation: number
  public validated: boolean = false

  public constructor(
    type: TrackType,
    id: number,
    flipped: boolean,
    position: TrackPosition,
  ) {
    this.type = type
    this.id = id
    this.flipped = flipped
    this.position = position
    this.up = 0
    this.down = 0
    this.elevation = 0
  }

  public setUpDown(up: number, down: number): void {
    this.up = up
    this.down = down
  }

  public isAt(position: TrackPosition): boolean {
    return this.position.x === position.x && this.position.y === position.y && this.position.direction === position.direction
  }

  public equals(piece: TrackPieceContract): boolean {
    return piece.type === this.type && piece.id === this.id && piece.flipped === this.flipped && this.isAt(piece.position)
  }

  public toString(): string {
    return JSON.stringify(
      this,
      (key, value) => {
        if (key === "position") {
          return {
            x: value.x,
            y: value.y,
            direction: value.direction,
          }
        }
        return value
      },
    )
  }
}