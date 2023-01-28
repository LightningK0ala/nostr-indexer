import { Account as DbAccount } from '@prisma/client';
import { Logger } from './Logger';
import { Account } from './Account';
import { RelayManager } from './RelayManager';
import { DbClient } from './DbClient';

export class AccountManager {
  private _db: DbClient;
  private _logger: Logger;
  private _relayManager: RelayManager;
  private _accounts = new Map<string, Account>();

  constructor({
    db,
    logger,
    relayManager,
  }: {
    db: DbClient;
    logger: Logger;
    relayManager: RelayManager;
  }) {
    this._db = db;
    this._logger = logger;
    this._relayManager = relayManager;
  }

  get accounts() {
    return this._accounts;
  }

  async setup() {
    this._logger.log('AccountManager setup');
    const accts = await this._db.getAccounts();
    accts.forEach(({ id, user_id: userId, pubkey, private_key }: DbAccount) => {
      const account = new Account({
        id,
        userId,
        db: this._db,
        logger: this._logger,
        pubkey: pubkey,
        privateKey: private_key ? private_key : undefined,
        relayManager: this._relayManager,
      });
      account.indexAccount();
      this._accounts.set(pubkey, account);
    });
  }

  async addAccount({
    pubkey,
    privateKey,
  }: {
    pubkey: string;
    privateKey?: string;
  }) {
    if (privateKey) throw new Error('Not currently supported');
    // Ensure pubkey is in hex format
    const hexPubkey = Account.convertPubkeyToHex(pubkey);
    const { id, user_id: userId } = await this._db.createAccount({
      pubkey: hexPubkey,
    });
    const account = new Account({
      id,
      userId,
      db: this._db,
      logger: this._logger,
      pubkey: hexPubkey,
      relayManager: this._relayManager,
    });
    this._accounts.set(hexPubkey, account);
    account.indexAccount();
  }
}
