## [1.2.1](https://github.com/super-anki/anki-sdk/compare/v1.2.0...v1.2.1) (2026-01-30)


### Bug Fixes

* correct multiple typos in codebase ([#3](https://github.com/super-anki/anki-sdk/issues/3)) ([16455b4](https://github.com/super-anki/anki-sdk/commit/16455b4ea2a8c31a1889b65cc0cd5b2da9ef47b0))

# [1.2.0](https://github.com/super-anki/anki-sdk/compare/v1.1.0...v1.2.0) (2025-07-23)


### Features

* add comprehensive constants and types definitions ([75e7885](https://github.com/super-anki/anki-sdk/commit/75e7885097c87e7e31afc108aa4425296d1165ed))
* add message formatting and posting to Bluesky on release ([87aff06](https://github.com/super-anki/anki-sdk/commit/87aff062d17468d94120b90cf5da9f004bf9f1f0))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Optimized constants and types for better performance
- Buffer pooling for memory optimization
- Enhanced error handling with custom error types
- Factory pattern for message building
- Improved type safety throughout the codebase

### Changed
- Migrated from npm to Bun for faster package management
- Optimized track scanner for better performance
- Improved message builder with O(1) lookup
- Enhanced defensive copying in data structures

### Performance
- Reduced memory allocations in message handling
- Optimized enum usage for better tree-shaking
- Improved buffer management with pooling
- Enhanced listener management patterns

## [1.1.0] - Previous Release

### Added
- Initial SDK implementation for Anki car control
- Bluetooth communication layer
- Message request/response system
- Track scanning functionality
- Car store management
