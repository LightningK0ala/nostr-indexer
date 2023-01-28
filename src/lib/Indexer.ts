import fs from 'fs';
import { RelayManager } from './RelayManager';
import { Config } from './Config';
import { Logger } from './Logger';
import { AccountManager } from './AccountManager';
import { DbClient } from './DbClient';

export class Indexer {
  private _db: DbClient;
  private _config: Config;
  private _relayManager: RelayManager;
  private _accountManager: AccountManager;
  private _startedAt?: Date;
  private _logger: Logger;
  public count: number = 0;

  constructor({
    db,
    config,
    relayManager,
    accountManager,
    logger,
  }: {
    db: DbClient;
    config: Config;
    relayManager: RelayManager;
    accountManager: AccountManager;
    logger: Logger;
  }) {
    this._db = db;
    this._config = config;
    this._relayManager = relayManager;
    this._accountManager = accountManager;
    this._logger = logger;
  }

  // Getters
  get db() {
    return this._db;
  }

  get started() {
    return !!this._startedAt;
  }

  get startedAt() {
    return this._startedAt;
  }

  get relayManager() {
    return this._relayManager;
  }

  get accountManager() {
    return this._accountManager;
  }

  async dbFileSize() {
    return (await fs.promises.stat(this._config.dbPath)).size;
  }

  setConfig() {}

  async start() {
    if (this.startedAt) return false;
    this._startedAt = new Date();
    this._logger.log('Indexer started');
    await this._relayManager.setup();
    await this._accountManager.setup();
    return true;
  }

  async stop() {
    if (!this.startedAt) return false;
    this._startedAt = undefined;
    await this._relayManager.teardown();
    // await this._db.$disconnect();
    // TODO: Stop relay manager
    return true;
  }

  prune() {}
  size() {}
  watchPubKey() {}
  unwatchPubKey() {}

  removeRelay() {}
  watchChannel() {}
  unwatchChannel() {}
}
