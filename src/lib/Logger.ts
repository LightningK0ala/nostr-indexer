import chalk from 'chalk';
import { Config } from './Config';

export enum LogType {
  INDEXER = "INDEXER",
  EVENT_PROCESSOR = "EVENT_PROCESSOR",
  ACCOUNT_MANAGER = "ACCOUNT_MANAGER",
  RELAY = "RELAY",
  DEFAULT = ""
}

export class Logger {
  private _config: Config;
  private _type?: LogType = LogType.DEFAULT;

  constructor(opts: { config: Config, type?: LogType }) {
    this._config = opts.config;
  }

  get config() {
    return this._config;
  }

  set type(type: LogType) {
    this._type = type
  }

  log(...args: any[]) {
    const formattedLog = this.color()(chalk.bold(`${this._type as string}: `)) + args.join(' ');
    if (this._config.debug) console.log(formattedLog)
  }

  private color() {
    switch (this._type) {
      case LogType.INDEXER:
        return chalk.blue;
      case LogType.EVENT_PROCESSOR:
        return chalk.green;
      case LogType.ACCOUNT_MANAGER:
        return chalk.yellow;
      case LogType.RELAY:
        return chalk.magenta;
      case LogType.DEFAULT:
        return chalk.gray;
      default:
        return chalk.gray;
    }
  }
}
