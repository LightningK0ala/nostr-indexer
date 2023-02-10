import fs from 'fs';
import { RelayManager } from './RelayManager';
import { Account } from './Account';
import { Config } from './Config';
import { Logger, LogType } from './Logger';
import { AccountManager } from './AccountManager';
import { DbClient } from './DbClient';
import { SubscriptionManager } from './SubscriptionManager';
import { User } from '@prisma/client';

export class Indexer {
  private _db: DbClient;
  private _config: Config;
  private _relayManager: RelayManager;
  private _subscriptionManager: SubscriptionManager;
  private _accountManager: AccountManager;
  private _startedAt?: Date;
  private _logger: Logger;
  public count: number = 0;

  constructor(opts: {
    db: DbClient;
    config: Config;
    relayManager: RelayManager;
    subscriptionManager: SubscriptionManager;
    accountManager: AccountManager;
    logger: Logger;
  }) {
    this._db = opts.db;
    this._config = opts.config;
    this._relayManager = opts.relayManager;
    this._subscriptionManager = opts.subscriptionManager;
    this._accountManager = opts.accountManager;
    opts.logger.type = LogType.INDEXER;
    this._logger = opts.logger;
  }

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
    this._db.client.user.findUnique({ where: { id: 1 } });
    return this._accountManager;
  }

  get subscriptions() {
    return this._relayManager.subscriptions;
  }

  async addRelay(opts: { url: string }) {
    return this.relayManager.addRelay(opts.url);
  }

  async addAccount(opts: { pubkey: string; relays: string[] }) {
    this._logger.log("Adding account")
    return this.accountManager.addAccount(opts);
  }

  async dbFileSize() {
    return (await fs.promises.stat(this._config.dbPath)).size;
  }

  async start() {
    if (this.startedAt) return false;
    this._startedAt = new Date();
    this._logger.log('� Indexer starting...');

    await this._relayManager.connectRelays();

    // This will need to move somewhere else:
    // 1. Index
    const users = await this._db.client.user.findMany()
    users.forEach((user: User) => {
      // this._subscriptionManager.addSubscription()

    })

    // await this._relayManager.setup();
    // await this._accountManager.setup();
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

  async findUser({ pubkey }: { pubkey: string }) {
    pubkey = Account.convertPubkeyToHex(pubkey)
    return this._db.client.user.findUnique({ where: { pubkey } })
  }

  async findFollowers({ id }: { id: number }) {
    const userFollowers = await this._db.client.userFollower.findMany({ where: { user_id: id }, include: { follower: true } })
    return userFollowers.map((uf: any) => uf.follower)
  }

  async findFollows({ id }: { id: number }) {
    const userFollowers = await this._db.client.userFollower.findMany({ where: { follower_id: id }, include: { user: true } })
    return userFollowers.map((uf: any) => uf.user)
  }

  async followersCount({ id }: { id: number }) {
    return this._db.client.userFollower.count({ where: { user_id: id } })
  }

  async followsCount({ id }: { id: number }) {
    return this._db.client.userFollower.count({ where: { follower_id: id } })
  }
}
