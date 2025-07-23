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
