# Anki SDK

This package allows to communicate with Anki cars via Bluetooth.

## Installation

```bash
npm install @super-anki/anki-sdk
```

## Usage

```node
import { CarStore } from "@super-anki/anki-sdk"

const store = CarStore.getInstance()
store.onOnline((car) => {
    // Car is available for connexion
})
store.onOffline((car) => {
    // Connexion lost with the car (battery died, or power button pressed)
})
```