# Anki SDK

[![npm version](https://badge.fury.io/js/@super-anki%2Fanki-sdk.svg)](https://badge.fury.io/js/@super-anki%2Fanki-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, TypeScript-first SDK for communicating with Anki Overdrive and Anki Drive cars via Bluetooth Low Energy. Revive your Anki cars with this comprehensive SDK that provides full control over car movement, lights, sensors, and track scanning.

## ✨ Features

- 🚗 **Full Car Control**: Speed, steering, lights, and lane changes
- 📡 **Real-time Communication**: Bluetooth LE for fast, reliable connections
- 🛣️ **Track Scanning**: Automatic track piece detection and mapping
- 🔋 **Battery Monitoring**: Real-time battery level and status
- 📊 **Position Tracking**: Precise car positioning and collision detection
- 🎯 **TypeScript First**: Complete type safety and IntelliSense support
- ⚡ **Performance Optimized**: Efficient message handling and memory management
- 🧪 **Well Tested**: Comprehensive test suite with 173+ tests

## 📦 Installation

### npm
```bash
npm install @super-anki/anki-sdk
```

### yarn
```bash
yarn add @super-anki/anki-sdk
```

### pnpm
```bash
pnpm add @super-anki/anki-sdk
```

### bun
```bash
bun add @super-anki/anki-sdk
```

## 🚀 Quick Start

### Basic Car Discovery and Control

```typescript
import { CarStore } from "@super-anki/anki-sdk"

// Get the car store instance
const store = CarStore.getInstance()

// Listen for cars coming online
store.onOnline((car) => {
  console.log(`Car ${car.id} is now available!`)
  
  // Connect to the car
  car.connect().then(() => {
    console.log("Connected to car!")
    
    // Enable SDK mode for full control
    car.sdkMode()
    
    // Set car speed (0-1000)
    car.setSpeed(300)
    
    // Turn on headlights
    car.setLights(0x44)
    
    // Make the car turn left at the next intersection
    car.turnLeft()
  })
})

// Listen for cars going offline
store.onOffline((car) => {
  console.log(`Car ${car.id} went offline`)
})

// Start scanning for cars
store.startLooking()
```

### Advanced Usage with Message Handling

```typescript
import { CarStore, ResponseCode } from "@super-anki/anki-sdk"

const store = CarStore.getInstance()

store.onOnline(async (car) => {
  await car.connect()
  
  // Listen for position updates
  car.on(ResponseCode.POSITION_UPDATE, (message) => {
    console.log(`Car position: piece ${message.roadPieceId}, offset ${message.offsetRoadCenter}`)
  })
  
  // Listen for battery level
  car.on(ResponseCode.BATTERY_LEVEL, (message) => {
    console.log(`Battery level: ${message.batteryLevel}mV`)
  })
  
  // Listen for collisions
  car.on(ResponseCode.COLLISION, (message) => {
    console.log("Collision detected!")
    car.setSpeed(0) // Stop the car
  })
  
  // Enable SDK mode and start
  await car.sdkMode()
  car.setSpeed(500, 1000) // speed: 500, acceleration: 1000
})

store.startLooking()
```

### Track Scanning

```typescript
import { TrackScanner } from "@super-anki/anki-sdk"

const scanner = new TrackScanner()

scanner.on("trackFound", (pieces) => {
  console.log(`Found ${pieces.length} track pieces:`)
  pieces.forEach(piece => {
    console.log(`- Piece ${piece.id}: ${piece.type}`)
  })
})

// Start scanning for track pieces
scanner.startScanning()
```

## 📖 API Reference

### CarStore

The main entry point for car discovery and management.

```typescript
const store = CarStore.getInstance()

// Events
store.onOnline((car: CarContract) => void)   // Car becomes available
store.onOffline((car: CarContract) => void)  // Car goes offline

// Methods
store.startLooking()                          // Start scanning for cars
store.stopLooking()                          // Stop scanning
store.getCar(id: string)                     // Get specific car by ID
store.getCars()                              // Get all discovered cars
```

### Car Control

```typescript
// Connection
await car.connect()
await car.disconnect()

// Basic control
car.setSpeed(speed: number, acceleration?: number)
car.changeLane(offset: number)
car.cancelLaneChange()
car.turnLeft()
car.turnRight()
car.uTurn()
car.uTurnJump()

// Lights
car.setLights(mask: number)
car.setLightsPattern(channel, effect, start, end, cycles)

// Configuration
car.enableSdkMode()              // Enable SDK mode for full control
car.disableSdkMode()             // Disable SDK mode
car.setOffset(offset: number)    // Set lane offset
```

### Message Types

```typescript
// Request codes
RequestCode.PING
RequestCode.VERSION
RequestCode.BATTERY_LEVEL
RequestCode.SPEED
RequestCode.CHANGE_LANE
RequestCode.LIGHTS
// ... and more

// Response codes  
ResponseCode.PING
ResponseCode.VERSION
ResponseCode.BATTERY_LEVEL
ResponseCode.POSITION_UPDATE
ResponseCode.COLLISION
// ... and more
```

### Error Handling

```typescript
import { AnkiSDKError, BluetoothError, CarConnectionError } from "@super-anki/anki-sdk"

try {
  await car.connect()
} catch (error) {
  if (error instanceof BluetoothError) {
    console.log("Bluetooth issue:", error.message)
  } else if (error instanceof CarConnectionError) {
    console.log("Car connection failed:", error.carId)
  }
}
```

## 🔧 Configuration

### TypeScript Configuration

The SDK is built with TypeScript and provides comprehensive type definitions. No additional setup is required for TypeScript projects.

### Environment Requirements

- **Node.js**: 16.0.0 or higher
- **Bluetooth**: Bluetooth Low Energy (BLE) support required
- **Platform**: Works on Windows, macOS, and Linux

### Bluetooth Permissions

Ensure your application has the necessary Bluetooth permissions:

- **macOS**: App needs Bluetooth permission in System Preferences
- **Linux**: User needs to be in the `bluetooth` group
- **Windows**: Bluetooth LE support required (Windows 10+)

## 🧪 Testing

The SDK includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/super-anki/anki-sdk.git
cd anki-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Project Structure

```
src/
├── ble/                 # Bluetooth Low Energy implementation
├── car/                 # Car control and management
├── message/             # Message builders and parsers
│   ├── request/         # Request message types
│   └── response/        # Response message types
├── store/               # Car store and state management  
├── track/               # Track scanning and mapping
├── constants.ts         # SDK constants and enums
├── types.ts            # TypeScript type definitions
└── utils.ts            # Utility functions

tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── mocks/             # Mock implementations
└── utils/             # Test utilities
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/anki-sdk.git
cd anki-sdk
npm install
```

### 2. Create a Feature Branch

**Important**: Always create feature branches from the `dev` branch, not `main`.

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Run the test suite to ensure everything works

```bash
npm run lint          # Check code style
npm run typecheck     # Verify TypeScript
npm test             # Run all tests
npm run build        # Ensure it builds
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new car control method"
git commit -m "fix: resolve bluetooth connection issue"
git commit -m "docs: update API documentation"
```

### 5. Submit a Pull Request

- Push your branch to your fork
- Create a pull request targeting the `dev` branch (not `main`)
- Provide a clear description of your changes
- Link any related issues

**Note**: Pull requests should target the `dev` branch. The `main` branch is reserved for production releases.

### Development Guidelines

- **Code Style**: Follow the existing ESLint configuration
- **Testing**: Maintain or improve test coverage
- **Documentation**: Update docs for any API changes
- **Types**: Ensure full TypeScript coverage
- **Performance**: Consider performance implications

### Reporting Issues

When reporting issues, please include:

- Operating system and version
- Node.js version
- Bluetooth adapter information
- Steps to reproduce the issue
- Expected vs actual behavior

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Anki protocol reverse engineering by the community
- [@abandonware/noble](https://github.com/abandonware/noble) for Bluetooth LE support
- The TypeScript and Node.js communities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/super-anki/anki-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/super-anki/anki-sdk/discussions)
- **Documentation**: [API Docs](https://github.com/super-anki/anki-sdk#readme)

---

Made with ❤️ for the Anki community. Revive your cars! 🏎️