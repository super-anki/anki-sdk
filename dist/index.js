"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BatteryLevelRequest: () => BatteryLevelRequest,
  BatteryLevelResponse: () => BatteryLevelResponse,
  Bluetooth: () => Bluetooth,
  Builder: () => Builder,
  CancelLangeChangeRequest: () => CancelLangeChangeRequest,
  Car: () => Car,
  CarScanner: () => CarScanner,
  CarStore: () => CarStore,
  ChangeLaneRequest: () => ChangeLaneRequest,
  CollisionResponse: () => CollisionResponse,
  CycleOvertimeResponse: () => CycleOvertimeResponse,
  DelocalizedResponse: () => DelocalizedResponse,
  Device: () => Device,
  DisconnectRequest: () => DisconnectRequest,
  IntersectionUpdateResponse: () => IntersectionUpdateResponse,
  Lights: () => Lights,
  LightsChannel: () => LightsChannel,
  LightsPattern: () => LightsPattern,
  LightsPatternRequest: () => LightsPatternRequest,
  LightsRequest: () => LightsRequest,
  LightsTarget: () => LightsTarget,
  Message: () => Message,
  OffsetRoadCenterRequest: () => OffsetRoadCenterRequest,
  OffsetRoadCenterResponse: () => OffsetRoadCenterResponse,
  PingRequest: () => PingRequest,
  PingResponse: () => PingResponse,
  PositionUpdateResponse: () => PositionUpdateResponse,
  SdkModeRequest: () => SdkModeRequest,
  SpeedRequest: () => SpeedRequest,
  StatusResponse: () => StatusResponse,
  TrackDirection: () => TrackDirection,
  TrackPiece: () => TrackPiece,
  TrackScanner: () => TrackScanner,
  TrackType: () => TrackType,
  TransitionUpdateResponse: () => TransitionUpdateResponse,
  TurnRequest: () => TurnRequest,
  TurnTrigger: () => TurnTrigger,
  TurnType: () => TurnType,
  VersionRequest: () => VersionRequest,
  VersionResponse: () => VersionResponse,
  trackTypeFromId: () => trackTypeFromId
});
module.exports = __toCommonJS(index_exports);

// src/ble/bluetooth.ts
var import_noble = __toESM(require("@abandonware/noble"));

// src/ble/device.ts
var Device = class {
  id;
  address;
  nameCode;
  _peripheral;
  _connected = false;
  _read;
  _write;
  _listeners;
  constructor(id, address, peripheral) {
    this.id = id;
    this.address = address;
    this.nameCode = peripheral.advertisement.manufacturerData.readUInt8(3) || -1;
    this._peripheral = peripheral;
    this._listeners = [];
  }
  get connected() {
    return this._connected;
  }
  connect(read, write) {
    const self = this;
    return new Promise((resolve, reject) => {
      self._peripheral.connect((error) => {
        if (error) {
          reject(error);
        } else {
          self.init(read, write).then(() => {
            self.enableListener();
            self._connected = true;
            resolve(self);
          });
        }
      });
    });
  }
  disconnect() {
    const self = this;
    return new Promise((resolve) => {
      self.removeWrite();
      self.removeRead();
      self._peripheral.disconnect(() => {
        self._listeners = [];
        self._connected = false;
        resolve(self);
      });
    });
  }
  read(listener) {
    this._listeners.push(listener);
  }
  write(data) {
    const self = this;
    return new Promise((resolve, reject) => {
      self._write?.write(data, false, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  init(read, write) {
    const self = this;
    return new Promise((resolve, reject) => {
      self._peripheral.discoverAllServicesAndCharacteristics((error, _services, characteristics) => {
        if (error) {
          reject(error);
        } else {
          characteristics.forEach((characteristic) => {
            if (read && characteristic.uuid === read) {
              self._read = characteristic;
            } else if (write && characteristic.uuid === write) {
              self._write = characteristic;
            }
          });
          if (read && !self._read) {
            reject("Could not initialize read characteristic");
          } else if (write && !self._write) {
            reject("Could not initialize write characteristic");
          } else {
            resolve();
          }
        }
      });
    });
  }
  enableListener() {
    this._read?.subscribe();
    this._read?.on("data", (data) => {
      this._listeners.forEach((listener) => listener(data));
    });
  }
  removeWrite() {
    this._write?.unsubscribe();
    delete this._write;
  }
  removeRead() {
    this._listeners.forEach((listener) => {
      this._read?.removeListener("data", listener);
    });
    this._read?.unsubscribe();
    delete this._read;
  }
};

// src/ble/bluetooth.ts
var Bluetooth = class {
  _onDiscover;
  _state;
  _timeout;
  constructor(onDiscover = () => {
  }, timeout = 500) {
    this._onDiscover = onDiscover;
    this._timeout = timeout;
    this._state = "unknown";
  }
  startScanning(uuids) {
    const self = this;
    return new Promise((resolve) => {
      import_noble.default.on("stateChange", async (state) => {
        if (state === "poweredOn") {
          await import_noble.default.startScanningAsync(uuids, false);
        }
      });
      import_noble.default.on("discover", async (peripheral) => {
        self._state = "poweredOn";
        self._onDiscover(new Device(peripheral.id, peripheral.address, peripheral));
        resolve();
      });
      if (self._state === "poweredOn") {
        import_noble.default.startScanning(uuids, false);
      }
    });
  }
  stopScanning() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self._state === "poweredOn") {
        import_noble.default.stopScanningAsync().then(() => {
          import_noble.default.removeListener("discover", self._onDiscover);
          resolve();
        });
      } else {
        reject("Bluetooth is still offline");
      }
    });
  }
  set onDiscover(callback) {
    this._onDiscover = callback;
  }
  set timeout(timeout) {
    this._timeout = timeout;
  }
  get timeout() {
    return this._timeout;
  }
  get state() {
    return this._state;
  }
};

// src/utils.ts
var BASE_SIZE = 1;

// src/message/message.ts
var Message = class {
  id;
  timestamp;
  payload;
  name;
  constructor(id, payload) {
    this.id = id;
    this.timestamp = /* @__PURE__ */ new Date();
    this.payload = payload;
    this.name = this.constructor.name;
  }
  toJsonString() {
    return JSON.stringify(
      this,
      (key, value) => {
        if (key === "payload") {
          return value.toString("hex");
        }
        return value;
      }
    );
  }
  toString() {
    return this.toJsonString();
  }
};

// src/message/response/battery-level.ts
var BatteryLevelResponse = class extends Message {
  batteryLevel;
  constructor(id, payload) {
    super(id, payload);
    this.batteryLevel = this.payload.readUInt16LE(2);
  }
};

// src/message/response/colllision.ts
var CollisionResponse = class extends Message {
  constructor(id, payload) {
    super(id, payload);
  }
};

// src/message/response/cycle-overtime.ts
var CycleOvertimeResponse = class extends Message {
  constructor(id, payload) {
    super(id, payload);
  }
};

// src/message/response/delocalized.ts
var DelocalizedResponse = class extends Message {
  constructor(id, payload) {
    super(id, payload);
  }
};

// src/message/response/intersection-update.ts
var IntersectionUpdateResponse = class extends Message {
  roadPieceId;
  offsetRoadCenter;
  intersectionCode;
  isExisting;
  mmSinceLastTransitionBar;
  mmSinceLastIntersectionCode;
  constructor(id, payload) {
    super(id, payload);
    this.roadPieceId = this.payload.readUInt8(2);
    this.offsetRoadCenter = this.payload.readFloatLE(3);
    this.intersectionCode = this.payload.readUInt8(7);
    this.isExisting = this.payload.readUInt8(8);
    this.mmSinceLastTransitionBar = this.payload.readUInt16LE(9);
    this.mmSinceLastIntersectionCode = this.payload.readUInt16LE(11);
  }
};

// src/message/response/offset-road-center.ts
var OffsetRoadCenterResponse = class extends Message {
  offset;
  laneChangeId;
  constructor(id, payload) {
    super(id, payload);
    this.offset = this.payload.readFloatLE(2);
    this.laneChangeId = this.payload.readUInt8(6);
  }
};

// src/message/response/ping.ts
var PingResponse = class extends Message {
  constructor(id, payload) {
    super(id, payload);
  }
  calculatePingTime(request) {
    return this.timestamp.getMilliseconds() - request.timestamp.getMilliseconds();
  }
};

// src/message/response/position-update.ts
var PositionUpdateResponse = class extends Message {
  locationId;
  roadPieceId;
  offsetRoadCenter;
  speed;
  parsingFlags;
  lastReceiveLaneChangeCommandId;
  lastExecLangeChangeCommandId;
  lastDesiredLaneChangeSpeed;
  lastDesiredSpeed;
  constructor(id, payload) {
    super(id, payload);
    this.locationId = this.payload.readUInt8(2);
    this.roadPieceId = this.payload.readUInt8(3);
    this.offsetRoadCenter = this.payload.readFloatLE(4);
    this.speed = this.payload.readUInt16LE(8);
    this.parsingFlags = this.payload.readUInt8(10);
    this.lastReceiveLaneChangeCommandId = this.payload.readUInt8(11);
    this.lastExecLangeChangeCommandId = this.payload.readUInt8(12);
    this.lastDesiredLaneChangeSpeed = this.payload.readUInt16LE(13);
    this.lastDesiredSpeed = this.payload.readUInt16LE(15);
  }
};

// src/message/response/status.ts
var StatusResponse = class extends Message {
  onTrack;
  onCharger;
  batteryLow;
  batteryFull;
  constructor(id, payload) {
    super(id, payload);
    this.onTrack = this.payload.readUInt8(2) === 1;
    this.onCharger = this.payload.readUInt8(3) === 1;
    this.batteryLow = this.payload.readUInt8(4) === 1;
    this.batteryFull = this.payload.readUInt8(5) === 1;
  }
};

// src/message/response/transition-update.ts
var TransitionUpdateResponse = class extends Message {
  roadPieceId;
  prevRoadPieceId;
  offsetRoadCenter;
  lastReceiveLaneChangeCommandId;
  lastExecLaneChangeCommandId;
  lastDesiredLaneChangeCommandId;
  haveFollowLineDriftPixels;
  hadLaneChangeActivity;
  uphillCounter;
  downhillCounter;
  leftWheelDistCm;
  rightWheelDistCm;
  constructor(id, payload) {
    super(id, payload);
    this.roadPieceId = this.payload.readUInt8(2);
    this.prevRoadPieceId = this.payload.readUInt8(3);
    this.offsetRoadCenter = this.payload.readFloatLE(4);
    this.lastReceiveLaneChangeCommandId = this.payload.readUInt8(8);
    this.lastExecLaneChangeCommandId = this.payload.readUInt8(9);
    this.lastDesiredLaneChangeCommandId = this.payload.readUInt16LE(10);
    this.haveFollowLineDriftPixels = this.payload.readUInt8(12);
    this.hadLaneChangeActivity = this.payload.readUInt8(13);
    this.uphillCounter = this.payload.readUInt8(14);
    this.downhillCounter = this.payload.readUInt8(15);
    this.leftWheelDistCm = this.payload.readUInt8(16);
    this.rightWheelDistCm = this.payload.readUInt8(17);
  }
};

// src/message/response/version.ts
var VersionResponse = class extends Message {
  version;
  constructor(id, payload) {
    super(id, payload);
    this.version = this.payload.readUInt16LE(2);
  }
};

// src/message/builder.ts
var Builder = class {
  _messageId;
  _payload;
  _id;
  constructor(id, messageId, payload) {
    this._id = id;
    this._messageId = messageId;
    this._payload = payload;
  }
  build() {
    switch (this._messageId) {
      case 27 /* BATTERY_LEVEL */:
        return new BatteryLevelResponse(this._id, this._payload);
      case 77 /* COLLISION */:
        return new CollisionResponse(this._id, this._payload);
      case 134 /* CYCLE_OVERTIME */:
        return new CycleOvertimeResponse(this._id, this._payload);
      case 43 /* DELOCALIZED */:
        return new DelocalizedResponse(this._id, this._payload);
      case 42 /* INTERSECTION_UPDATE */:
        return new IntersectionUpdateResponse(this._id, this._payload);
      case 45 /* OFFSET_FROM_ROAD_CENTER */:
        return new OffsetRoadCenterResponse(this._id, this._payload);
      case 23 /* PING */:
        return new PingResponse(this._id, this._payload);
      case 39 /* POSITION_UPDATE */:
        return new PositionUpdateResponse(this._id, this._payload);
      case 63 /* STATUS_UPDATE */:
        return new StatusResponse(this._id, this._payload);
      case 41 /* TRANSITION_UPDATE */:
        return new TransitionUpdateResponse(this._id, this._payload);
      case 25 /* VERSION */:
        return new VersionResponse(this._id, this._payload);
      default:
        return null;
    }
  }
};

// src/message/request/battery-level.ts
var BatteryLevelRequest = class extends Message {
  constructor(id) {
    super(id, Buffer.alloc(BASE_SIZE + 1));
    this.payload.writeUInt8(BASE_SIZE, 0);
    this.payload.writeUInt8(26 /* BATTERY_LEVEL */, 1);
  }
};

// src/message/request/cancel-lane-change.ts
var CancelLangeChangeRequest = class extends Message {
  constructor(id) {
    super(id, Buffer.alloc(BASE_SIZE + 1));
    this.payload.writeUInt8(BASE_SIZE, 0);
    this.payload.writeUInt8(38 /* CANCEL_LANE_CHANGE */, 1);
  }
};

// src/message/request/change-lane.ts
var REQUEST_SIZE = 11;
var ChangeLaneRequest = class extends Message {
  offsetRoadCenter;
  speed;
  acceleration;
  hopIntent;
  tag;
  constructor(id, offsetRoadCenter, speed = 300, acceleration = 300, hopIntent = 0, tag = 0) {
    super(id, Buffer.alloc(REQUEST_SIZE + 1));
    this.payload.writeUInt8(REQUEST_SIZE, 0);
    this.payload.writeUInt8(37 /* CHANGE_LANE */, 1);
    this.payload.writeUInt16LE(speed, 2);
    this.payload.writeUInt16LE(acceleration, 4);
    this.payload.writeFloatLE(offsetRoadCenter, 6);
    this.payload.writeUInt8(hopIntent, 10);
    this.payload.writeUInt8(tag, 11);
    this.offsetRoadCenter = offsetRoadCenter;
    this.speed = speed;
    this.acceleration = acceleration;
    this.hopIntent = hopIntent;
    this.tag = tag;
  }
};

// src/message/request/disconnect.ts
var DisconnectRequest = class extends Message {
  constructor(id) {
    super(id, Buffer.alloc(BASE_SIZE + 1));
    this.payload.writeUInt8(BASE_SIZE, 0);
    this.payload.writeUInt8(13 /* DISCONNECT */, 1);
  }
};

// src/message/request/lights.ts
var REQUEST_SIZE2 = 2;
var Lights = /* @__PURE__ */ ((Lights2) => {
  Lights2[Lights2["HEADLIGHTS_ON"] = 68] = "HEADLIGHTS_ON";
  Lights2[Lights2["HEADLIGHTS_OFF"] = 4] = "HEADLIGHTS_OFF";
  Lights2[Lights2["TAILLIGHTS_ON"] = 34] = "TAILLIGHTS_ON";
  Lights2[Lights2["TAILLIGHTS_OFF"] = 2] = "TAILLIGHTS_OFF";
  Lights2[Lights2["FLASH_TAILLIGHTS"] = 136] = "FLASH_TAILLIGHTS";
  return Lights2;
})(Lights || {});
var LightsRequest = class extends Message {
  constructor(id, lights) {
    super(id, Buffer.alloc(REQUEST_SIZE2 + 1));
    this.payload.writeUInt8(REQUEST_SIZE2, 0);
    this.payload.writeUInt8(29 /* LIGHTS */, 1);
    this.payload.writeUInt8(lights, 2);
  }
};

// src/message/request/lights-pattern.ts
var REQUEST_SIZE3 = 17;
var LightsTarget = /* @__PURE__ */ ((LightsTarget2) => {
  LightsTarget2[LightsTarget2["HEAD"] = 0] = "HEAD";
  LightsTarget2[LightsTarget2["BRAKE"] = 1] = "BRAKE";
  LightsTarget2[LightsTarget2["FRONT"] = 2] = "FRONT";
  LightsTarget2[LightsTarget2["ENGINE"] = 3] = "ENGINE";
  return LightsTarget2;
})(LightsTarget || {});
var LightsPattern = /* @__PURE__ */ ((LightsPattern2) => {
  LightsPattern2[LightsPattern2["STEADY"] = 0] = "STEADY";
  LightsPattern2[LightsPattern2["FADE"] = 1] = "FADE";
  LightsPattern2[LightsPattern2["THROB"] = 2] = "THROB";
  LightsPattern2[LightsPattern2["FLASH"] = 3] = "FLASH";
  LightsPattern2[LightsPattern2["RANDOM"] = 4] = "RANDOM";
  return LightsPattern2;
})(LightsPattern || {});
var LightsChannel = /* @__PURE__ */ ((LightsChannel2) => {
  LightsChannel2[LightsChannel2["RED"] = 0] = "RED";
  LightsChannel2[LightsChannel2["BLUE"] = 2] = "BLUE";
  LightsChannel2[LightsChannel2["GREEN"] = 3] = "GREEN";
  return LightsChannel2;
})(LightsChannel || {});
var LightsPatternRequest = class extends Message {
  constructor(id, redStart, redEnd, greenStart, greenEnd, blueStart, blueEnd, target, pattern, cycle = 0) {
    super(id, Buffer.alloc(REQUEST_SIZE3 + 1));
    this.payload.writeUInt8(REQUEST_SIZE3, 0);
    this.payload.writeUInt8(51 /* LIGHTS_PATTERN */, 1);
    this.payload.writeUInt8(target, 2);
    this.payload.writeUInt8(0 /* RED */, 3);
    this.payload.writeUInt8(pattern, 4);
    this.payload.writeUInt8(redStart, 5);
    this.payload.writeUInt8(redEnd, 6);
    this.payload.writeUInt8(cycle, 7);
    this.payload.writeUInt8(3 /* GREEN */, 8);
    this.payload.writeUInt8(pattern, 9);
    this.payload.writeUInt8(greenStart, 10);
    this.payload.writeUInt8(greenEnd, 11);
    this.payload.writeUInt8(cycle, 12);
    this.payload.writeUInt8(2 /* BLUE */, 13);
    this.payload.writeUInt8(pattern, 14);
    this.payload.writeUInt8(blueStart, 15);
    this.payload.writeUInt8(blueEnd, 16);
    this.payload.writeUInt8(cycle, 17);
  }
};

// src/message/request/offset-road-center.ts
var REQUEST_SIZE4 = 5;
var OffsetRoadCenterRequest = class extends Message {
  offset;
  constructor(id, offset) {
    super(id, Buffer.alloc(REQUEST_SIZE4 + 1));
    this.payload.writeUInt8(REQUEST_SIZE4, 0);
    this.payload.writeUInt8(44 /* SET_OFFSET_FROM_ROAD_CENTER */, 1);
    this.payload.writeFloatLE(offset, 2);
    this.offset = offset;
  }
};

// src/message/request/ping.ts
var PingRequest = class extends Message {
  constructor(id) {
    super(id, Buffer.alloc(BASE_SIZE + 1));
    this.payload.writeUInt8(BASE_SIZE, 0);
    this.payload.writeUInt8(22 /* PING */, 1);
  }
};

// src/message/request/sdk-mode.ts
var REQUEST_SIZE5 = 3;
var SdkModeRequest = class extends Message {
  on;
  flags;
  constructor(id, on = true, flags = 1 /* SDK_OPTION_OVERRIDE */) {
    super(id, Buffer.alloc(REQUEST_SIZE5 + 1));
    this.payload.writeUInt8(REQUEST_SIZE5, 0);
    this.payload.writeUInt8(144 /* SDK_MODE */, 1);
    this.payload.writeUInt8(on ? 1 : 0, 2);
    this.payload.writeUInt8(flags, 3);
    this.on = on;
    this.flags = flags;
  }
};

// src/message/request/speed.ts
var REQUEST_SIZE6 = 6;
var SpeedRequest = class extends Message {
  speed;
  acceleration;
  respectRoadLimit;
  constructor(id, speed, acceleration = 500, respectRoadLimit = true) {
    super(id, Buffer.alloc(REQUEST_SIZE6 + 1));
    this.payload.writeUInt8(REQUEST_SIZE6, 0);
    this.payload.writeUInt8(36 /* SPEED */, 1);
    this.payload.writeUInt16LE(speed, 2);
    this.payload.writeUInt16LE(acceleration, 4);
    this.payload.writeUInt8(respectRoadLimit ? 1 : 0, 6);
    this.speed = speed;
    this.acceleration = acceleration;
    this.respectRoadLimit = respectRoadLimit;
  }
};

// src/message/request/turn.ts
var REQUEST_SIZE7 = 3;
var TurnTrigger = /* @__PURE__ */ ((TurnTrigger2) => {
  TurnTrigger2[TurnTrigger2["IMMEDIATE"] = 0] = "IMMEDIATE";
  TurnTrigger2[TurnTrigger2["INTERSECTION"] = 1] = "INTERSECTION";
  return TurnTrigger2;
})(TurnTrigger || {});
var TurnType = /* @__PURE__ */ ((TurnType2) => {
  TurnType2[TurnType2["NONE"] = 0] = "NONE";
  TurnType2[TurnType2["LEFT"] = 1] = "LEFT";
  TurnType2[TurnType2["RIGHT"] = 2] = "RIGHT";
  TurnType2[TurnType2["UTURN"] = 3] = "UTURN";
  TurnType2[TurnType2["UTURN_JUMP"] = 4] = "UTURN_JUMP";
  return TurnType2;
})(TurnType || {});
var TurnRequest = class extends Message {
  type;
  trigger;
  constructor(id, type, trigger = 0 /* IMMEDIATE */) {
    super(id, Buffer.alloc(REQUEST_SIZE7 + 1));
    this.payload.writeUInt8(REQUEST_SIZE7, 0);
    this.payload.writeUInt8(50 /* TURN */, 1);
    this.payload.writeUInt8(type, 2);
    this.payload.writeUInt8(trigger, 3);
    this.type = type;
    this.trigger = trigger;
  }
};

// src/message/request/version.ts
var VersionRequest = class extends Message {
  constructor(id) {
    super(id, Buffer.alloc(BASE_SIZE + 1));
    this.payload.writeUInt8(BASE_SIZE, 0);
    this.payload.writeUInt8(24 /* VERSION */, 1);
  }
};

// src/car/car.ts
var Car = class {
  id;
  address;
  nameCode;
  _connected;
  _offset;
  _device;
  _listeners;
  constructor(device, offset = 0) {
    this._device = device;
    this._offset = offset;
    this.nameCode = device.nameCode;
    this.id = device.id;
    this.address = device.address;
    this._connected = false;
    this._listeners = [];
  }
  cancelLangeChange() {
    this.writePublish(new CancelLangeChangeRequest(this.id));
  }
  changeLane(offset, speed, acceleration, hopIntent, tag) {
    this.writePublish(new ChangeLaneRequest(this.id, offset, speed, acceleration, hopIntent, tag));
  }
  connect() {
    const self = this;
    return new Promise((resolve, reject) => {
      self._device.connect("be15bee06186407e83810bd89c4d8df4" /* READ_UUID */, "be15bee16186407e83810bd89c4d8df4" /* WRITE_UUID */).then(() => {
        self.enableSdkMode();
        self._device.read((data) => self.readPublish(data));
        self._connected = true;
        resolve(self);
      }).catch(reject);
    });
  }
  disableSdkMode() {
    this.writePublish(new SdkModeRequest(this.id, false));
  }
  disconnect() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.writePublish(new DisconnectRequest(self.id));
      self.removeAllListeners();
      self.disableSdkMode();
      self._device.disconnect().then(() => {
        self._connected = false;
        resolve(self);
      }).catch(reject);
    });
  }
  enableSdkMode() {
    this.writePublish(new SdkModeRequest(this.id, true));
  }
  getBatteryLevel() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.send(
        new BatteryLevelRequest(self.id),
        27 /* BATTERY_LEVEL */
      ).then((message) => resolve(message.batteryLevel)).catch(reject);
    });
  }
  getPing() {
    const self = this;
    return new Promise((resolve, reject) => {
      const request = new PingRequest(self.id);
      self.send(request, 23 /* PING */).then((message) => resolve(message.calculatePingTime(request))).catch(reject);
    });
  }
  getVersion() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.send(
        new VersionRequest(self.id),
        25 /* VERSION */
      ).then((message) => resolve(message.version)).catch(reject);
    });
  }
  setOffset(offset) {
    this.writePublish(new OffsetRoadCenterRequest(this.id, offset));
    this._offset = offset;
  }
  setSpeed(speed, acceleration, respectRoadLimit) {
    this.writePublish(new SpeedRequest(this.id, speed, acceleration, respectRoadLimit));
  }
  setLights(lights) {
    this.writePublish(new LightsRequest(this.id, lights));
  }
  setLightsPattern(redStart, redEnd, greenStart, greenEnd, blueStart, blueEnd, target = 3 /* ENGINE */, pattern = 0 /* STEADY */, cycle = 0) {
    this.writePublish(new LightsPatternRequest(
      this.id,
      redStart,
      redEnd,
      greenStart,
      greenEnd,
      blueStart,
      blueEnd,
      target,
      pattern,
      cycle
    ));
  }
  turnLeft() {
    this.writePublish(new TurnRequest(this.id, 1 /* LEFT */));
  }
  turnRight() {
    this.writePublish(new TurnRequest(this.id, 2 /* RIGHT */));
  }
  uTurn() {
    this.writePublish(new TurnRequest(this.id, 3 /* UTURN */));
  }
  uTurnJump() {
    this.writePublish(new TurnRequest(this.id, 4 /* UTURN_JUMP */));
  }
  get offset() {
    return this._offset;
  }
  get connected() {
    return this._connected;
  }
  addListener(listener) {
    this._listeners.push(listener);
  }
  removeListener(listener) {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }
  removeAllListeners() {
    this._listeners = [];
  }
  readPublish(payload) {
    this._listeners.forEach((listener) => {
      const message = new Builder(this.id, payload.readUInt8(1), payload).build();
      if (message) {
        listener(message);
      }
    });
  }
  writePublish(message) {
    this._device.write(message.payload).then(() => {
      this._listeners.forEach((listener) => listener(message));
    });
  }
  send(request, responseId) {
    const self = this;
    return new Promise((resolve, reject) => {
      const listener = (message) => {
        if (message && message.payload.readUInt8(1) === responseId) {
          clearTimeout(timeout);
          self.removeListener(listener);
          resolve(message);
        }
      };
      const timeout = setTimeout(() => {
        self.removeListener(listener);
        reject(`Timeout waiting for response ${responseId}`);
      }, 1500);
      self.addListener(listener);
      self.writePublish(request);
    });
  }
};

// src/car/scanner.ts
var CarScanner = class {
  _bluetooth;
  _cars;
  _timeout;
  constructor(bluetooth, timeout = 500) {
    this._bluetooth = bluetooth;
    this._bluetooth.onDiscover = this.onDiscover.bind(this);
    this._timeout = timeout;
    this._cars = [];
  }
  findAll() {
    const self = this;
    return new Promise((resolve, reject) => {
      self._cars = [];
      self._bluetooth.startScanning(["be15beef6186407e83810bd89c4d8df4" /* SERVICE_UUID */]).then(() => {
        self.awaitScanning().then(resolve).catch(reject);
      }).catch(reject);
    });
  }
  findById(id) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.findAll().then((cars) => {
        const car = cars.find((c) => c.id === id);
        if (car) {
          resolve(car);
        } else {
          reject(`Car with id [${id}] not found`);
        }
      }).catch(reject);
    });
  }
  findByAddress(address) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.findAll().then((cars) => {
        const car = cars.find((c) => c.address === address);
        if (car) {
          resolve(car);
        } else {
          reject(`Car with address [${address}] not found`);
        }
      }).catch(reject);
    });
  }
  findAny() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.findAll().then((cars) => {
        if (cars.length) {
          resolve(cars[0]);
        } else {
          reject("No cars found");
        }
      }).catch(reject);
    });
  }
  get timeout() {
    return this._timeout;
  }
  set timeout(value) {
    this._timeout = value;
  }
  onDiscover(device) {
    if (!this.contains(device.id)) {
      this._cars.push(new Car(device));
    }
  }
  contains(id) {
    return this._cars.some((c) => c.id === id);
  }
  awaitScanning() {
    const self = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        self._bluetooth.stopScanning().then(() => resolve(self._cars)).catch(reject);
      }, self._timeout);
    });
  }
};

// src/store/cars.ts
var CarStore = class _CarStore {
  static _instance;
  _store;
  _scanner;
  _task;
  _interval = 3e3;
  _onlineListeners;
  _offlineListeners;
  constructor() {
    const bluetooth = new Bluetooth();
    this._store = /* @__PURE__ */ new Map();
    this._scanner = new CarScanner(bluetooth);
    this._onlineListeners = [];
    this._offlineListeners = [];
  }
  static getInstance() {
    if (!_CarStore._instance) {
      _CarStore._instance = new _CarStore();
    }
    return _CarStore._instance;
  }
  startLooking() {
    this._task = setInterval(this.synchronize.bind(this), this._interval);
  }
  stopLooking() {
    clearInterval(this._task);
  }
  getCar(id) {
    return this._store.get(id);
  }
  getCars() {
    return Array.from(this._store.values());
  }
  onOnline(listener) {
    this._onlineListeners.push(listener);
    return this;
  }
  onOffline(listener) {
    this._offlineListeners.push(listener);
    return this;
  }
  synchronize() {
    this._scanner.findAll().then((cars) => {
      cars.forEach((car) => {
        if (!this._store.has(car.id) || this.carInStoreWrongConnectionState(car.id, car.connected)) {
          this._store.set(car.id, car);
          this._onlineListeners.forEach((listener) => listener(car));
        }
      });
      this._store.forEach((value, key) => {
        if (!value.connected && !cars.some((c) => c.id === key)) {
          this._store.delete(key);
          this._offlineListeners.forEach((listener) => listener(value));
        }
      });
    });
  }
  carInStoreWrongConnectionState(id, connected) {
    const car = this._store.get(id);
    if (car) {
      return car.connected !== connected;
    }
    return false;
  }
};

// src/track/piece.ts
var TrackDirection = /* @__PURE__ */ ((TrackDirection2) => {
  TrackDirection2[TrackDirection2["NORTH"] = 0] = "NORTH";
  TrackDirection2[TrackDirection2["EAST"] = 1] = "EAST";
  TrackDirection2[TrackDirection2["SOUTH"] = 2] = "SOUTH";
  TrackDirection2[TrackDirection2["WEST"] = 3] = "WEST";
  return TrackDirection2;
})(TrackDirection || {});
var TrackType = /* @__PURE__ */ ((TrackType2) => {
  TrackType2[TrackType2["UNKNOWN"] = 0] = "UNKNOWN";
  TrackType2[TrackType2["STRAIGHT"] = 1] = "STRAIGHT";
  TrackType2[TrackType2["CURVE"] = 2] = "CURVE";
  TrackType2[TrackType2["START_GRID"] = 3] = "START_GRID";
  TrackType2[TrackType2["FINISH_LINE"] = 4] = "FINISH_LINE";
  TrackType2[TrackType2["FAST_N_FURIOUS_SPECIAL"] = 5] = "FAST_N_FURIOUS_SPECIAL";
  TrackType2[TrackType2["CROSSROAD"] = 6] = "CROSSROAD";
  TrackType2[TrackType2["JUMP_RAMP"] = 7] = "JUMP_RAMP";
  TrackType2[TrackType2["JUMP_LANDING"] = 8] = "JUMP_LANDING";
  return TrackType2;
})(TrackType || {});
function trackTypeFromId(id) {
  switch (id) {
    case 17:
    case 18:
    case 20:
    case 23:
      return 2 /* CURVE */;
    case 36:
    case 39:
    case 40:
    case 51:
      return 1 /* STRAIGHT */;
    case 57:
      return 5 /* FAST_N_FURIOUS_SPECIAL */;
    case 34:
      return 3 /* START_GRID */;
    case 33:
      return 4 /* FINISH_LINE */;
    case 10:
      return 6 /* CROSSROAD */;
    case 58:
      return 7 /* JUMP_RAMP */;
    case 63:
      return 8 /* JUMP_LANDING */;
    default:
      return 0 /* UNKNOWN */;
  }
}
var TrackPiece = class {
  type;
  id;
  position;
  flipped;
  up;
  down;
  elevation;
  validated = false;
  constructor(type, id, flipped, position) {
    this.type = type;
    this.id = id;
    this.flipped = flipped;
    this.position = position;
    this.up = 0;
    this.down = 0;
    this.elevation = 0;
  }
  setUpDown(up, down) {
    this.up = up;
    this.down = down;
  }
  isAt(position) {
    return this.position.x === position.x && this.position.y === position.y && this.position.direction === position.direction;
  }
  equals(piece) {
    return piece.type === this.type && piece.id === this.id && piece.flipped === this.flipped && this.isAt(piece.position);
  }
  toString() {
    return JSON.stringify(
      this,
      (key, value) => {
        if (key === "position") {
          return {
            x: value.x,
            y: value.y,
            direction: value.direction
          };
        }
        return value;
      }
    );
  }
};

// src/track/scanner.ts
var TrackScanner = class {
  _store = CarStore.getInstance();
  _scanning = false;
  _pieces = [];
  _tracking = false;
  _validating = false;
  _index = 0;
  _position = { x: 0, y: 0, direction: 1 /* EAST */ };
  _listeners = [];
  _retries = 0;
  _maxRetries = 3;
  _callback;
  addListener(listener) {
    this._listeners.push(listener);
  }
  removeListener(listener) {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }
  async scanWith(id) {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self._scanning) {
        reject("Already scanning");
        return;
      }
      self.resetTrack();
      self._callback = (result) => {
        self._scanning = false;
        car?.setSpeed(0, 500);
        car?.removeListener(self.onMessage.bind(self));
        if (result) {
          resolve(self._pieces);
        } else {
          reject("Invalid track");
        }
      };
      const car = self._store.getCar(id);
      car?.addListener(self.onMessage.bind(self));
      car?.setSpeed(450, 500);
      car?.changeLane(0);
    });
  }
  resetTrack() {
    this._pieces = [];
    this._index = 0;
    this._validating = false;
    this._tracking = false;
    this._retries = 0;
    this._position = { x: 0, y: 0, direction: 1 /* EAST */ };
  }
  onMessage(message) {
    if (message instanceof TransitionUpdateResponse) {
      this._tracking = true;
      if (this._pieces.length > 0) {
        this._pieces[this._pieces.length - 1].setUpDown(message.uphillCounter, message.downhillCounter);
      }
    } else if (message instanceof PositionUpdateResponse) {
      if (!this._tracking) {
        return;
      }
      this._tracking = false;
      const autoIncrement = true;
      const type = trackTypeFromId(message.roadPieceId);
      const clockwise = message.parsingFlags === 71;
      const piece = new TrackPiece(type, message.roadPieceId, clockwise, { ...this._position });
      if (!this._validating && this._pieces.length === 0 && type !== 3 /* START_GRID */) {
        return;
      }
      if (!this._validating) {
        this._pieces.push(piece);
      }
      if (type === 2 /* CURVE */) {
        this.rotateDirection(clockwise);
      }
      if (type !== 3 /* START_GRID */ && type !== 0 /* UNKNOWN */) {
        this.move();
      }
      if (!this._validating && this._pieces.length >= 4 && this._pieces[0].isAt(this._position)) {
        this._validating = true;
        this._index = -1;
      } else if (this._validating) {
        this.validate(piece);
      }
      this._index += autoIncrement ? 1 : 0;
      this._listeners.forEach((listener) => listener(this._pieces));
    }
  }
  rotateDirection(clockwise) {
    const direction = clockwise ? 1 : -1;
    if (this._position.direction + direction === 4) {
      this._position.direction = 0 /* NORTH */;
    } else if (this._position.direction + direction === -1) {
      this._position.direction = 3 /* WEST */;
    } else {
      this._position.direction += direction;
    }
  }
  move(space = 1) {
    switch (this._position.direction) {
      case 0 /* NORTH */:
        this._position.y -= space;
        break;
      case 1 /* EAST */:
        this._position.x += space;
        break;
      case 2 /* SOUTH */:
        this._position.y += space;
        break;
      case 3 /* WEST */:
        this._position.x -= space;
        break;
    }
  }
  validate(piece) {
    if (!this._pieces[this._index].equals(piece)) {
      this._retries++;
      if (this._retries >= this._maxRetries) {
        this._callback(false);
      } else {
        this._validating = false;
        this.resetTrack();
        return false;
      }
    } else {
      this._pieces[this._index].validated = true;
      if (this._index === this._pieces.length - 1) {
        this._callback(true);
      }
    }
    return true;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BatteryLevelRequest,
  BatteryLevelResponse,
  Bluetooth,
  Builder,
  CancelLangeChangeRequest,
  Car,
  CarScanner,
  CarStore,
  ChangeLaneRequest,
  CollisionResponse,
  CycleOvertimeResponse,
  DelocalizedResponse,
  Device,
  DisconnectRequest,
  IntersectionUpdateResponse,
  Lights,
  LightsChannel,
  LightsPattern,
  LightsPatternRequest,
  LightsRequest,
  LightsTarget,
  Message,
  OffsetRoadCenterRequest,
  OffsetRoadCenterResponse,
  PingRequest,
  PingResponse,
  PositionUpdateResponse,
  SdkModeRequest,
  SpeedRequest,
  StatusResponse,
  TrackDirection,
  TrackPiece,
  TrackScanner,
  TrackType,
  TransitionUpdateResponse,
  TurnRequest,
  TurnTrigger,
  TurnType,
  VersionRequest,
  VersionResponse,
  trackTypeFromId
});
//# sourceMappingURL=index.js.map