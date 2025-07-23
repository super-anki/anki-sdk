# Anki SDK Test Suite

This comprehensive test suite provides coverage for the Anki SDK with optimized testing practices using Vitest.

## Test Structure

```
tests/
├── __mocks__/          # Mock implementations
│   └── bluetooth.mock.ts   # Bluetooth API mocks
├── unit/               # Unit tests
│   ├── constants.test.ts   # Constants and enums
│   ├── types.test.ts       # Type definitions and error classes
│   └── utils.test.ts       # Utility functions
├── integration/        # Integration tests
│   └── basic.test.ts       # Basic integration tests
├── test-utils.ts       # Test utilities and helpers
├── setup.ts           # Test setup and global configuration
└── vitest.config.ts   # Vitest configuration
```

## Test Coverage

### Unit Tests

#### Constants (`tests/unit/constants.test.ts`)
- ✅ CONSTANTS object validation
- ✅ GATT characteristics UUID format checking
- ✅ RequestCode enum values and uniqueness
- ✅ ResponseCode enum values and request/response pairing
- ✅ TRACK_TYPE_MAP functionality and performance
- ✅ Integration between constants for message creation

#### Types (`tests/unit/types.test.ts`)
- ✅ AnkiSDKError base error class
- ✅ BluetoothError specialized error handling
- ✅ CarConnectionError with car ID tracking
- ✅ MessageTimeoutError with message type info
- ✅ Type definitions (CarId, MessageId, etc.)
- ✅ Enum types (TrackDirection, TrackType, TurnType, Lights)
- ✅ Interface types (ScanResult, PingResult, BatteryStatus)
- ✅ Error inheritance chain validation
- ✅ Error serialization and details handling

#### Utils (`tests/unit/utils.test.ts`)
- ✅ GattCharacteristic enum UUID validation
- ✅ BASE_SIZE constant verification
- ✅ RequestCode enum hex values and consistency
- ✅ ResponseCode enum values and request pairing
- ✅ Enum integration with buffer operations
- ✅ Message handling compatibility

### Integration Tests

#### Basic Integration (`tests/integration/basic.test.ts`)
- ✅ Response Builder message creation
- ✅ Bluetooth mock device interactions
- ✅ Service and characteristic operations
- ✅ Data exchange simulation
- ✅ Error handling scenarios
- ✅ Enum consistency validation
- ✅ Performance benchmarks

## Mock System

### Bluetooth Mocks (`tests/__mocks__/bluetooth.mock.ts`)
- **Device Factory**: Creates mock BluetoothDevice instances
- **Service Factory**: Creates mock BluetoothRemoteGATTService
- **Characteristic Factory**: Creates mock characteristics with read/write
- **Connection Scenarios**: Success, failure, slow connections
- **Data Exchange**: Simulates real Bluetooth data flow
- **Error Injection**: Configurable failure modes for testing

### Test Utilities (`tests/test-utils.ts`)
- **waitFor**: Async delay utility for timing tests
- **Timeout Management**: Configurable timeout handling
- **Test Helpers**: Common patterns for test setup

## Configuration

### Vitest Config (`vitest.config.ts`)
- **Test Environment**: Node.js environment for SDK testing
- **Coverage**: 80% threshold with detailed reporting
- **File Patterns**: Automatic test discovery
- **Setup Files**: Global test configuration
- **Mock Support**: Vi mock system integration

### Setup (`tests/setup.ts`)
- **Global Polyfills**: TextEncoder/TextDecoder for Node.js
- **Environment Setup**: Consistent test environment
- **Mock Initialization**: Global mock setup

## Test Patterns

### Happy Path Testing
All major functions tested with expected inputs and successful outcomes.

### Error Path Testing
Comprehensive error scenarios including:
- Connection failures
- Timeout conditions
- Invalid input handling
- Resource exhaustion
- Network interruptions

### Performance Testing
- Message creation benchmarks
- Concurrent operation handling
- Memory usage validation
- Timing constraint verification

### Type Safety Testing
- Compile-time type checking
- Runtime type validation
- Error class inheritance
- Interface compliance

## Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/constants.test.ts

# Run in watch mode
bun test --watch

# Run integration tests only
bun test tests/integration/
```

## Best Practices Implemented

1. **Isolation**: Each test is isolated with proper setup/teardown
2. **Mocking**: Bluetooth dependencies mocked for consistent testing
3. **Coverage**: High test coverage with meaningful assertions
4. **Performance**: Benchmarks ensure SDK performance standards
5. **Error Handling**: Comprehensive error scenario coverage
6. **Type Safety**: Full TypeScript integration and validation
7. **Documentation**: Clear test descriptions and expectations

## Notes

- All tests use TypeScript for type safety
- Bluetooth operations are fully mocked to avoid hardware dependencies
- Performance tests ensure SDK remains fast and efficient
- Error tests cover both happy and sad paths comprehensively
- Integration tests validate component interactions

The test suite is designed to be maintainable, comprehensive, and fast, following Vitest best practices for modern TypeScript projects.
