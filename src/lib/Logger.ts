import chalk from 'chalk';
import { Config } from './Config';
export class Logger {
  private _config: Config;

  constructor({ config }: { config: Config }) {
    this._config = config;
  }
  log(...args: any[]) {
    // add the new log to the end of the array
    const formattedLog = chalk.yellow('INDEXER:') + ' ' + args.join(' ');
    if (this._config.debug) console.log(formattedLog);
  }
}
