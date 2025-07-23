// src/ble/bluetooth.ts
import noble from "@abandonware/noble";

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
      noble.on("stateChange", async (state) => {
        if (state === "poweredOn") {
          await noble.startScanningAsync(uuids, false);
        }
      });
      noble.on("discover", async (peripheral) => {
        self._state = "poweredOn";
        self._onDiscover(new Device(peripheral.id, peripheral.address, peripheral));
        resolve();
      });
      if (self._state === "poweredOn") {
        noble.startScanning(uuids, false);
      }
    });
  }
  stopScanning() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self._state === "poweredOn") {
        noble.stopScanningAsync().then(() => {
          noble.removeListener("discover", self._onDiscover);
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
var GattCharacteristic = /* @__PURE__ */ ((GattCharacteristic2) => {
  GattCharacteristic2["SERVICE_UUID"] = "be15beef6186407e83810bd89c4d8df4";
  GattCharacteristic2["READ_UUID"] = "be15bee06186407e83810bd89c4d8df4";
  GattCharacteristic2["WRITE_UUID"] = "be15bee16186407e83810bd89c4d8df4";
  return GattCharacteristic2;
})(GattCharacteristic || {});
var BASE_SIZE = 1;
var BufferPool = class {
  pools = /* @__PURE__ */ new Map();
  maxPoolSize = 10;
  allocOptimized(size) {
    if (size <= 0) {
      return Buffer.alloc(0);
    }
    const pool = this.pools.get(size);
    if (pool && pool.length > 0) {
      return pool.pop();
    }
    return Buffer.alloc(size);
  }
  release(buffer) {
    if (!buffer || buffer.length === 0) return;
    const size = buffer.length;
    buffer.fill(0);
    let pool = this.pools.get(size);
    if (!pool) {
      pool = [];
      this.pools.set(size, pool);
    }
    if (pool.length < this.maxPoolSize) {
      pool.push(buffer);
    }
  }
  clearPool() {
    this.pools.clear();
  }
};
var bufferPool = new BufferPool();
var BufferUtils = {
  /**
   * Allocate a buffer with optimized pooling
   * @param size - Buffer size
   * @returns Buffer instance
   */
  allocOptimized: (size) => bufferPool.allocOptimized(size),
  /**
   * Release a buffer back to the pool for reuse
   * @param buffer - Buffer to release
   */
  release: (buffer) => bufferPool.release(buffer),
  /**
   * Clear all pooled buffers
   */
  clearPool: () => bufferPool.clearPool()
};

// src/message/message.ts
var Message = class {
  id;
  timestamp;
  payload;
  name;
  _type;
  constructor(id, payload, type) {
    this.id = id;
    this.timestamp = /* @__PURE__ */ new Date();
    this.payload = payload;
    this.name = this.constructor.name;
    this._type = type;
  }
  get type() {
    if (this._type !== void 0) {
      return this._type;
    }
    if (this.payload.length >= 2) {
      return this.payload.readUInt8(1);
    }
    return 0;
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
  constructor(id, payload, type) {
    super(id, payload, type);
    this.batteryLevel = this.payload.readUInt16LE(2);
  }
};

// src/message/response/colllision.ts
var CollisionResponse = class extends Message {
  constructor(id, payload, type) {
    super(id, payload, type);
  }
};

// src/message/response/cycle-overtime.ts
var CycleOvertimeResponse = class extends Message {
  constructor(id, payload, type) {
    super(id, payload, type);
  }
};

// src/message/response/delocalized.ts
var DelocalizedResponse = class extends Message {
  constructor(id, payload, type) {
    super(id, payload, type);
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
  constructor(id, payload, type) {
    super(id, payload, type);
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
  constructor(id, payload, type) {
    super(id, payload, type);
    this.offset = this.payload.readFloatLE(2);
    this.laneChangeId = this.payload.readUInt8(6);
  }
};

// src/message/response/ping.ts
var PingResponse = class extends Message {
  constructor(id, payload, type) {
    super(id, payload, type);
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
  constructor(id, payload, type) {
    super(id, payload, type);
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
  constructor(id, payload, type) {
    super(id, payload, type);
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
  constructor(id, payload, type) {
    super(id, payload, type);
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
  constructor(id, payload, type) {
    super(id, payload, type);
    this.version = this.payload.readUInt16LE(2);
  }
};

// src/message/builder.ts
var RequestMessage = class extends Message {
  buffer;
  constructor(buffer, type) {
    super("request-message", buffer, type);
    this.buffer = buffer;
  }
  toJsonString() {
    return JSON.stringify({
      id: this.id,
      timestamp: this.timestamp.toISOString(),
      type: this.type,
      buffer: Array.from(this.buffer)
    });
  }
};
var Builder = class {
  _messageId;
  _payload;
  _id;
  _type;
  _speed;
  _acceleration;
  _lights;
  // Response builder constructor (3 params)
  // Request builder constructor (0 params)
  constructor(id, messageId, payload) {
    if (id !== void 0 && messageId !== void 0 && payload !== void 0) {
      this._id = id;
      this._messageId = messageId;
      this._payload = payload;
    }
  }
  // Request builder methods
  setType(type) {
    this._type = type;
    return this;
  }
  setSpeed(speed, acceleration) {
    this._speed = speed;
    this._acceleration = acceleration;
    return this;
  }
  setLights(lights) {
    this._lights = lights;
    return this;
  }
  build() {
    if (this._messageId !== void 0 && this._id !== void 0 && this._payload !== void 0) {
      switch (this._messageId) {
        case 27 /* BATTERY_LEVEL */:
          return new BatteryLevelResponse(this._id, this._payload, this._messageId);
        case 77 /* COLLISION */:
          return new CollisionResponse(this._id, this._payload, this._messageId);
        case 134 /* CYCLE_OVERTIME */:
          return new CycleOvertimeResponse(this._id, this._payload, this._messageId);
        case 43 /* DELOCALIZED */:
          return new DelocalizedResponse(this._id, this._payload, this._messageId);
        case 42 /* INTERSECTION_UPDATE */:
          return new IntersectionUpdateResponse(this._id, this._payload, this._messageId);
        case 45 /* OFFSET_FROM_ROAD_CENTER */:
          return new OffsetRoadCenterResponse(this._id, this._payload, this._messageId);
        case 23 /* PING */:
          return new PingResponse(this._id, this._payload, this._messageId);
        case 39 /* POSITION_UPDATE */:
          return new PositionUpdateResponse(this._id, this._payload, this._messageId);
        case 63 /* STATUS_UPDATE */:
          return new StatusResponse(this._id, this._payload, this._messageId);
        case 41 /* TRANSITION_UPDATE */:
          return new TransitionUpdateResponse(this._id, this._payload, this._messageId);
        case 25 /* VERSION */:
          return new VersionResponse(this._id, this._payload, this._messageId);
        default:
          return null;
      }
    }
    if (this._type !== void 0) {
      const buffer = Buffer.alloc(16);
      buffer.writeUInt8(this._type, 0);
      if (this._type === 36 /* SPEED */ && this._speed !== void 0 && this._acceleration !== void 0) {
        buffer.writeUInt16LE(this._speed, 2);
        buffer.writeUInt16LE(this._acceleration, 4);
      }
      if (this._type === 29 /* LIGHTS */ && this._lights !== void 0) {
        buffer.writeUInt8(this._lights, 1);
      }
      return new RequestMessage(buffer, this._type);
    }
    return null;
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
var TurnRequest = class extends Message {
  turnType;
  trigger;
  constructor(id, turnType, trigger = 0 /* IMMEDIATE */) {
    super(id, Buffer.alloc(REQUEST_SIZE7 + 1));
    this.payload.writeUInt8(REQUEST_SIZE7, 0);
    this.payload.writeUInt8(50 /* TURN */, 1);
    this.payload.writeUInt8(turnType, 2);
    this.payload.writeUInt8(trigger, 3);
    this.turnType = turnType;
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

// src/constants.ts
var CONSTANTS = {
  // Buffer and message sizes
  BASE_SIZE: 1,
  DEFAULT_TIMEOUT: 1500,
  SCANNING_TIMEOUT: 500,
  STORE_SYNC_INTERVAL: 3e3,
  MAX_RETRIES: 3,
  // Default values
  DEFAULT_SPEED: 300,
  DEFAULT_ACCELERATION: 500,
  DEFAULT_CYCLE: 0,
  DEFAULT_HOP_INTENT: 0,
  DEFAULT_TAG: 0,
  // Request sizes (optimized as frozen object for better performance)
  REQUEST_SIZES: Object.freeze({
    BASE: 1,
    TURN: 3,
    SPEED: 6,
    SDK_MODE: 3,
    LIGHTS: 2,
    LIGHTS_PATTERN: 17,
    OFFSET_ROAD_CENTER: 5,
    CHANGE_LANE: 11
  })
};
var GATT_CHARACTERISTICS = {
  SERVICE_UUID: "be15beef6186407e83810bd89c4d8df4",
  READ_UUID: "be15bee06186407e83810bd89c4d8df4",
  WRITE_UUID: "be15bee16186407e83810bd89c4d8df4"
};
var RequestCode2 = /* @__PURE__ */ ((RequestCode3) => {
  RequestCode3[RequestCode3["DISCONNECT"] = 13] = "DISCONNECT";
  RequestCode3[RequestCode3["PING"] = 22] = "PING";
  RequestCode3[RequestCode3["VERSION"] = 24] = "VERSION";
  RequestCode3[RequestCode3["BATTERY_LEVEL"] = 26] = "BATTERY_LEVEL";
  RequestCode3[RequestCode3["LIGHTS"] = 29] = "LIGHTS";
  RequestCode3[RequestCode3["SPEED"] = 36] = "SPEED";
  RequestCode3[RequestCode3["CHANGE_LANE"] = 37] = "CHANGE_LANE";
  RequestCode3[RequestCode3["CANCEL_LANE_CHANGE"] = 38] = "CANCEL_LANE_CHANGE";
  RequestCode3[RequestCode3["SET_OFFSET_FROM_ROAD_CENTER"] = 44] = "SET_OFFSET_FROM_ROAD_CENTER";
  RequestCode3[RequestCode3["TURN"] = 50] = "TURN";
  RequestCode3[RequestCode3["LIGHTS_PATTERN"] = 51] = "LIGHTS_PATTERN";
  RequestCode3[RequestCode3["CONFIG_PARAMS"] = 69] = "CONFIG_PARAMS";
  RequestCode3[RequestCode3["SDK_MODE"] = 144] = "SDK_MODE";
  RequestCode3[RequestCode3["SDK_OPTION_OVERRIDE"] = 1] = "SDK_OPTION_OVERRIDE";
  return RequestCode3;
})(RequestCode2 || {});
var ResponseCode2 = /* @__PURE__ */ ((ResponseCode3) => {
  ResponseCode3[ResponseCode3["PING"] = 23] = "PING";
  ResponseCode3[ResponseCode3["VERSION"] = 25] = "VERSION";
  ResponseCode3[ResponseCode3["BATTERY_LEVEL"] = 27] = "BATTERY_LEVEL";
  ResponseCode3[ResponseCode3["POSITION_UPDATE"] = 39] = "POSITION_UPDATE";
  ResponseCode3[ResponseCode3["TRANSITION_UPDATE"] = 41] = "TRANSITION_UPDATE";
  ResponseCode3[ResponseCode3["INTERSECTION_UPDATE"] = 42] = "INTERSECTION_UPDATE";
  ResponseCode3[ResponseCode3["DELOCALIZED"] = 43] = "DELOCALIZED";
  ResponseCode3[ResponseCode3["OFFSET_FROM_ROAD_CENTER"] = 45] = "OFFSET_FROM_ROAD_CENTER";
  ResponseCode3[ResponseCode3["STATUS_UPDATE"] = 63] = "STATUS_UPDATE";
  ResponseCode3[ResponseCode3["COLLISION"] = 77] = "COLLISION";
  ResponseCode3[ResponseCode3["CYCLE_OVERTIME"] = 134] = "CYCLE_OVERTIME";
  return ResponseCode3;
})(ResponseCode2 || {});
var TRACK_TYPE_MAP = /* @__PURE__ */ new Map([
  [17, 2],
  // TrackType.CURVE
  [18, 2],
  // TrackType.CURVE
  [20, 2],
  // TrackType.CURVE
  [23, 2],
  // TrackType.CURVE
  [36, 1],
  // TrackType.STRAIGHT
  [39, 1],
  // TrackType.STRAIGHT
  [40, 1],
  // TrackType.STRAIGHT
  [51, 1],
  // TrackType.STRAIGHT
  [57, 5],
  // TrackType.FAST_N_FURIOUS_SPECIAL
  [34, 3],
  // TrackType.START_GRID
  [33, 4],
  // TrackType.FINISH_LINE
  [10, 6],
  // TrackType.CROSSROAD
  [58, 7],
  // TrackType.JUMP_RAMP
  [63, 8]
  // TrackType.JUMP_LANDING
]);

// src/types.ts
var TrackDirection2 = /* @__PURE__ */ ((TrackDirection3) => {
  TrackDirection3[TrackDirection3["NORTH"] = 0] = "NORTH";
  TrackDirection3[TrackDirection3["EAST"] = 1] = "EAST";
  TrackDirection3[TrackDirection3["SOUTH"] = 2] = "SOUTH";
  TrackDirection3[TrackDirection3["WEST"] = 3] = "WEST";
  return TrackDirection3;
})(TrackDirection2 || {});
var TrackType2 = /* @__PURE__ */ ((TrackType3) => {
  TrackType3[TrackType3["UNKNOWN"] = 0] = "UNKNOWN";
  TrackType3[TrackType3["STRAIGHT"] = 1] = "STRAIGHT";
  TrackType3[TrackType3["CURVE"] = 2] = "CURVE";
  TrackType3[TrackType3["START_GRID"] = 3] = "START_GRID";
  TrackType3[TrackType3["FINISH_LINE"] = 4] = "FINISH_LINE";
  TrackType3[TrackType3["FAST_N_FURIOUS_SPECIAL"] = 5] = "FAST_N_FURIOUS_SPECIAL";
  TrackType3[TrackType3["CROSSROAD"] = 6] = "CROSSROAD";
  TrackType3[TrackType3["JUMP_RAMP"] = 7] = "JUMP_RAMP";
  TrackType3[TrackType3["JUMP_LANDING"] = 8] = "JUMP_LANDING";
  return TrackType3;
})(TrackType2 || {});
var TurnTrigger = /* @__PURE__ */ ((TurnTrigger2) => {
  TurnTrigger2[TurnTrigger2["IMMEDIATE"] = 0] = "IMMEDIATE";
  TurnTrigger2[TurnTrigger2["INTERSECTION"] = 1] = "INTERSECTION";
  return TurnTrigger2;
})(TurnTrigger || {});
var TurnType2 = /* @__PURE__ */ ((TurnType3) => {
  TurnType3[TurnType3["NONE"] = 0] = "NONE";
  TurnType3[TurnType3["LEFT"] = 1] = "LEFT";
  TurnType3[TurnType3["RIGHT"] = 2] = "RIGHT";
  TurnType3[TurnType3["UTURN"] = 3] = "UTURN";
  TurnType3[TurnType3["UTURN_JUMP"] = 4] = "UTURN_JUMP";
  return TurnType3;
})(TurnType2 || {});
var Lights = /* @__PURE__ */ ((Lights2) => {
  Lights2[Lights2["HEADLIGHTS_ON"] = 68] = "HEADLIGHTS_ON";
  Lights2[Lights2["HEADLIGHTS_OFF"] = 4] = "HEADLIGHTS_OFF";
  Lights2[Lights2["TAILLIGHTS_ON"] = 34] = "TAILLIGHTS_ON";
  Lights2[Lights2["TAILLIGHTS_OFF"] = 2] = "TAILLIGHTS_OFF";
  Lights2[Lights2["FLASH_TAILLIGHTS"] = 136] = "FLASH_TAILLIGHTS";
  return Lights2;
})(Lights || {});
var LightsTarget2 = /* @__PURE__ */ ((LightsTarget3) => {
  LightsTarget3[LightsTarget3["HEAD"] = 0] = "HEAD";
  LightsTarget3[LightsTarget3["BRAKE"] = 1] = "BRAKE";
  LightsTarget3[LightsTarget3["FRONT"] = 2] = "FRONT";
  LightsTarget3[LightsTarget3["ENGINE"] = 3] = "ENGINE";
  return LightsTarget3;
})(LightsTarget2 || {});
var LightsPattern2 = /* @__PURE__ */ ((LightsPattern3) => {
  LightsPattern3[LightsPattern3["STEADY"] = 0] = "STEADY";
  LightsPattern3[LightsPattern3["FADE"] = 1] = "FADE";
  LightsPattern3[LightsPattern3["THROB"] = 2] = "THROB";
  LightsPattern3[LightsPattern3["FLASH"] = 3] = "FLASH";
  LightsPattern3[LightsPattern3["RANDOM"] = 4] = "RANDOM";
  return LightsPattern3;
})(LightsPattern2 || {});
var LightsChannel = /* @__PURE__ */ ((LightsChannel2) => {
  LightsChannel2[LightsChannel2["RED"] = 0] = "RED";
  LightsChannel2[LightsChannel2["BLUE"] = 2] = "BLUE";
  LightsChannel2[LightsChannel2["GREEN"] = 3] = "GREEN";
  return LightsChannel2;
})(LightsChannel || {});
var AnkiSDKError = class extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "AnkiSDKError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
};
var BluetoothError = class extends AnkiSDKError {
  constructor(message, details) {
    super(message, "BLUETOOTH_ERROR", details);
    this.name = "BluetoothError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
};
var CarConnectionError = class extends AnkiSDKError {
  constructor(message, carId, details) {
    super(message, "CAR_CONNECTION_ERROR", details);
    this.carId = carId;
    this.name = "CarConnectionError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      carId: this.carId,
      details: this.details
    };
  }
};
var MessageTimeoutError = class extends AnkiSDKError {
  constructor(message, messageType, details) {
    super(message, "MESSAGE_TIMEOUT_ERROR", details);
    this.messageType = messageType;
    this.name = "MessageTimeoutError";
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      messageType: this.messageType,
      details: this.details
    };
  }
};
export {
  AnkiSDKError,
  BASE_SIZE,
  BatteryLevelRequest,
  BatteryLevelResponse,
  Bluetooth,
  BluetoothError,
  BufferUtils,
  Builder,
  CONSTANTS,
  CancelLangeChangeRequest,
  Car,
  CarConnectionError,
  CarScanner,
  CarStore,
  ChangeLaneRequest,
  CollisionResponse,
  CycleOvertimeResponse,
  DelocalizedResponse,
  Device,
  DisconnectRequest,
  GATT_CHARACTERISTICS,
  GattCharacteristic,
  IntersectionUpdateResponse,
  Lights,
  LightsChannel,
  LightsPattern2 as LightsPattern,
  LightsPatternRequest,
  LightsRequest,
  LightsTarget2 as LightsTarget,
  Message,
  MessageTimeoutError,
  OffsetRoadCenterRequest,
  OffsetRoadCenterResponse,
  PingRequest,
  PingResponse,
  PositionUpdateResponse,
  RequestCode2 as RequestCode,
  ResponseCode2 as ResponseCode,
  SdkModeRequest,
  SpeedRequest,
  StatusResponse,
  TRACK_TYPE_MAP,
  TrackDirection2 as TrackDirection,
  TrackPiece,
  TrackScanner,
  TrackType2 as TrackType,
  TransitionUpdateResponse,
  TurnRequest,
  TurnTrigger,
  TurnType2 as TurnType,
  VersionRequest,
  VersionResponse,
  trackTypeFromId
};
//# sourceMappingURL=index.mjs.map