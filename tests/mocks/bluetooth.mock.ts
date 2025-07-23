import { vi } from "vitest"

// Type definitions for Bluetooth mocks
interface MockBluetoothGATTServer {
  connected: boolean
  device: unknown
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  getPrimaryService: ReturnType<typeof vi.fn>
  getPrimaryServices: ReturnType<typeof vi.fn>
}

interface MockBluetoothDevice {
  id: string
  name: string
  gatt: MockBluetoothGATTServer
  [key: string]: unknown
}

interface MockBluetoothCharacteristicProperties {
  broadcast: boolean
  read: boolean
  writeWithoutResponse: boolean
  write: boolean
  notify: boolean
  indicate: boolean
  authenticatedSignedWrites: boolean
  reliableWrite: boolean
  writableAuxiliaries: boolean
}

interface MockBluetoothCharacteristic {
  service: Record<string, unknown>
  uuid: string
  properties: MockBluetoothCharacteristicProperties
  value: unknown
  getDescriptor: ReturnType<typeof vi.fn>
  getDescriptors: ReturnType<typeof vi.fn>
  readValue: ReturnType<typeof vi.fn>
  writeValue: ReturnType<typeof vi.fn>
  writeValueWithResponse: ReturnType<typeof vi.fn>
  writeValueWithoutResponse: ReturnType<typeof vi.fn>
  startNotifications: ReturnType<typeof vi.fn>
  stopNotifications: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  dispatchEvent: ReturnType<typeof vi.fn>
  [key: string]: unknown
}

interface MockBluetoothService {
  device: Record<string, unknown>
  uuid: string
  isPrimary: boolean
  getCharacteristic: ReturnType<typeof vi.fn>
  getCharacteristics: ReturnType<typeof vi.fn>
  getIncludedService: ReturnType<typeof vi.fn>
  getIncludedServices: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  dispatchEvent: ReturnType<typeof vi.fn>
  [key: string]: unknown
}

interface MockPeripheralAdvertisement {
  localName: string
  manufacturerData: Buffer
  serviceUuids: string[]
  serviceSolicitationUuids: string[]
  serviceData: unknown[]
  scannable: boolean
}

interface MockPeripheral {
  id: string
  address: string
  addressType: string
  connectable: boolean
  advertisement: MockPeripheralAdvertisement
  rssi: number
  state: string
  connect: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  discoverAllServicesAndCharacteristics: ReturnType<typeof vi.fn>
  discoverServices: ReturnType<typeof vi.fn>
  discoverSomeServicesAndCharacteristics: ReturnType<typeof vi.fn>
  discoverCharacteristics: ReturnType<typeof vi.fn>
  discoverIncludedServices: ReturnType<typeof vi.fn>
  discoverDescriptors: ReturnType<typeof vi.fn>
  readHandle: ReturnType<typeof vi.fn>
  writeHandle: ReturnType<typeof vi.fn>
  updateRssi: ReturnType<typeof vi.fn>
  [key: string]: unknown
}

interface MockCharacteristic {
  uuid: string
  name: string
  type: string
  properties: string[]
  descriptors: unknown[]
  read: ReturnType<typeof vi.fn>
  write: ReturnType<typeof vi.fn>
  broadcast: ReturnType<typeof vi.fn>
  notify: ReturnType<typeof vi.fn>
  discoverDescriptors: ReturnType<typeof vi.fn>
  toString: ReturnType<typeof vi.fn>
  subscribe: ReturnType<typeof vi.fn>
  unsubscribe: ReturnType<typeof vi.fn>
  on: ReturnType<typeof vi.fn>
  removeListener: ReturnType<typeof vi.fn>
  removeAllListeners: ReturnType<typeof vi.fn>
  setMaxListeners: ReturnType<typeof vi.fn>
  getMaxListeners: ReturnType<typeof vi.fn>
  listeners: ReturnType<typeof vi.fn>
  rawListeners: ReturnType<typeof vi.fn>
  emit: ReturnType<typeof vi.fn>
  eventNames: ReturnType<typeof vi.fn>
  listenerCount: ReturnType<typeof vi.fn>
  prependListener: ReturnType<typeof vi.fn>
  prependOnceListener: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  addListener: ReturnType<typeof vi.fn>
  once: ReturnType<typeof vi.fn>
  [key: string]: unknown
}

// Mock Web Bluetooth Device
export const createMockDevice = (overrides: Record<string, unknown> = {}): MockBluetoothDevice => {
  const mockGattServer: MockBluetoothGATTServer = {
    connected: false,
    device: null,
    connect: vi.fn().mockImplementation(async () => {
      if (overrides.shouldFailConnection) {
        throw new Error("Connection failed")
      }
      if (overrides.connectionDelay) {
        await new Promise(resolve => setTimeout(resolve, overrides.connectionDelay as number))
      }
      return {
        connected: true,
        device: null,
        disconnect: vi.fn(),
        getPrimaryService: vi.fn().mockResolvedValue(createMockBluetoothService()),
        getPrimaryServices: vi.fn().mockResolvedValue([createMockBluetoothService()]),
      }
    }),
    disconnect: vi.fn(),
    getPrimaryService: vi.fn(),
    getPrimaryServices: vi.fn(),
  }

  return {
    id: "mock-device-id",
    name: "Anki Overdrive",
    gatt: mockGattServer,
    ...overrides,
  }
}

// Mock Web Bluetooth Service
export const createMockBluetoothService = (overrides: Record<string, unknown> = {}): MockBluetoothService => ({
  device: {} as Record<string, unknown>,
  uuid: "be15beef-6186-407e-8381-0bd89c4d8df4",
  isPrimary: true,
  getCharacteristic: vi.fn().mockImplementation(async (uuid: string) => {
    return createMockBluetoothCharacteristic({ uuid, ...overrides })
  }),
  getCharacteristics: vi.fn().mockResolvedValue([createMockBluetoothCharacteristic()]),
  getIncludedService: vi.fn(),
  getIncludedServices: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  ...overrides,
})

// Mock Web Bluetooth Characteristic
export const createMockBluetoothCharacteristic = (overrides: Record<string, unknown> = {}): MockBluetoothCharacteristic => ({
  service: {} as Record<string, unknown>,
  uuid: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
  properties: {
    broadcast: false,
    read: true,
    writeWithoutResponse: true,
    write: true,
    notify: false,
    indicate: false,
    authenticatedSignedWrites: false,
    reliableWrite: false,
    writableAuxiliaries: false,
  },
  value: null,
  getDescriptor: vi.fn(),
  getDescriptors: vi.fn(),
  readValue: vi.fn().mockImplementation(async () => {
    if (overrides.shouldFailRead) {
      throw new Error("Read operation failed")
    }
    return new DataView(new ArrayBuffer(20))
  }),
  writeValue: vi.fn().mockImplementation(async () => {
    if (overrides.shouldFailWrite) {
      throw new Error("Write operation failed")
    }
    return undefined
  }),
  writeValueWithResponse: vi.fn().mockImplementation(async () => {
    if (overrides.shouldFailWrite) {
      throw new Error("Write operation failed")
    }
    return undefined
  }),
  writeValueWithoutResponse: vi.fn().mockImplementation(async () => {
    if (overrides.shouldFailWrite) {
      throw new Error("Write operation failed")
    }
    return undefined
  }),
  startNotifications: vi.fn().mockResolvedValue({}),
  stopNotifications: vi.fn().mockResolvedValue({}),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  ...overrides,
})

// Mock Bluetooth Peripheral
export const createMockPeripheral = (overrides: Record<string, unknown> = {}): MockPeripheral => ({
  id: "mock-peripheral-id",
  address: "aa:bb:cc:dd:ee:ff",
  addressType: "public",
  connectable: true,
  advertisement: {
    localName: "Anki Overdrive",
    manufacturerData: Buffer.from([0x00, 0x01, 0x02, 0x42]), // nameCode = 0x42
    serviceUuids: [],
    serviceSolicitationUuids: [],
    serviceData: [],
    scannable: false,
  },
  rssi: -50,
  state: "disconnected",
  connect: vi.fn(),
  disconnect: vi.fn(),
  discoverAllServicesAndCharacteristics: vi.fn(),
  discoverServices: vi.fn(),
  discoverSomeServicesAndCharacteristics: vi.fn(),
  discoverCharacteristics: vi.fn(),
  discoverIncludedServices: vi.fn(),
  discoverDescriptors: vi.fn(),
  readHandle: vi.fn(),
  writeHandle: vi.fn(),
  updateRssi: vi.fn(),
  ...overrides,
})

// Mock Bluetooth Characteristic
export const createMockCharacteristic = (overrides: Record<string, unknown> = {}): MockCharacteristic => ({
  uuid: "mock-characteristic-uuid",
  name: "Mock Characteristic",
  type: "org.bluetooth.characteristic.mock",
  properties: ["read", "write", "notify"],
  descriptors: [],
  read: vi.fn(),
  write: vi.fn(),
  broadcast: vi.fn(),
  notify: vi.fn(),
  discoverDescriptors: vi.fn(),
  toString: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
  setMaxListeners: vi.fn(),
  getMaxListeners: vi.fn(),
  listeners: vi.fn(),
  rawListeners: vi.fn(),
  emit: vi.fn(),
  eventNames: vi.fn(),
  listenerCount: vi.fn(),
  prependListener: vi.fn(),
  prependOnceListener: vi.fn(),
  off: vi.fn(),
  addListener: vi.fn(),
  once: vi.fn(),
  ...overrides,
})

// Mock Noble module
export const mockNoble = {
  state: "poweredOn",
  startScanning: vi.fn(),
  stopScanning: vi.fn(),
  startScanningAsync: vi.fn(),
  stopScanningAsync: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
}

// Mock factory for creating configured mocks
export class BluetoothMockFactory {
  static createConnectedPeripheral(): Record<string, unknown> {
    const characteristics = new Map()
    const readChar = createMockCharacteristic({
      uuid: "be15bee06186407e83810bd89c4d8df4",
      properties: ["read", "notify"],
    })
    const writeChar = createMockCharacteristic({
      uuid: "be15bee16186407e83810bd89c4d8df4",
      properties: ["write"],
    })
    
    characteristics.set("be15bee06186407e83810bd89c4d8df4", readChar)
    characteristics.set("be15bee16186407e83810bd89c4d8df4", writeChar)

    return createMockPeripheral({
      state: "connected",
      connect: vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(), 10)
      }),
      disconnect: vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(), 10)
      }),
      discoverAllServicesAndCharacteristics: vi.fn().mockImplementation((callback) => {
        const chars = Array.from(characteristics.values())
        setTimeout(() => callback(null, [], chars), 10)
      }),
    })
  }

  static createFailingPeripheral(): Record<string, unknown> {
    return createMockPeripheral({
      connect: vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(new Error("Connection failed")), 10)
      }),
    })
  }

  static createSlowPeripheral(): Record<string, unknown> {
    return createMockPeripheral({
      connect: vi.fn().mockImplementation((callback) => {
        setTimeout(() => callback(), 5000) // Slow connection
      }),
    })
  }
}

// Helper to setup noble mock
export const setupNobleMock = () => {
  vi.doMock("@abandonware/noble", () => ({
    default: mockNoble,
    ...mockNoble,
  }))
}

// Helper to reset noble mock
export const resetNobleMock = () => {
  Object.values(mockNoble).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockReset()
    }
  })
}
