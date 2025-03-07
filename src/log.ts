import type { Logger } from "log4js"
import { configure, getLogger } from "log4js"

configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: { appenders: ["console"], level: "DEBUG" },
  },
})

export class Log {
  private static _instance: Logger
  private static _enabled: boolean = false

  private static shouldLog(): boolean {
    if (Log._enabled) {
      if (!Log._instance) {
        Log._instance = getLogger()
      }
      return true
    }
    return false
  }

  public static enable(): void {
    Log._enabled = true
  }

  public static disable(): void {
    Log._enabled = false
  }

  public static info(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.info(message, ...args)
    }
  }

  public static debug(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.debug(message, ...args)
    }
  }


  public static trace(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.trace(message, ...args)
    }
  }

  public static warn(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.warn(message, ...args)
    }
  }

  public static error(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.error(message, ...args)
    }
  }

  public static fatal(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.fatal(message, ...args)
    }
  }

  public static mark(message: any, ...args: any[]): void {
    if (Log.shouldLog()) {
      Log._instance.mark(message, ...args)
    }
  }
}