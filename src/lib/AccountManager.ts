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

  indexAllAccounts() {
    this._accounts.forEach(account => account.indexAccount());
  }

  async setup() {
    this._logger.log('AccountManager setup');
    const accts = await this._db.client.account.findMany();
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
      if (this._accounts.has(pubkey)) return;
      account.indexAccount();
      this._accounts.set(pubkey, account);
    });
  }

  // Add an account, if an account already exists in db we load it
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
    let dbAccount: DbAccount | null;
    dbAccount = await this._db.client.account.findUnique({ where: { pubkey } });
    if (!dbAccount) {
      dbAccount = await this._db.createAccount({
        pubkey: hexPubkey,
      });
    }
    if (!dbAccount) throw new Error('Failed to create account');
    const account = new Account({
      id: dbAccount.id,
      userId: dbAccount.user_id,
      db: this._db,
      logger: this._logger,
      pubkey: hexPubkey,
      relayManager: this._relayManager,
    });
    if (this._accounts.has(hexPubkey)) return dbAccount;
    account.indexAccount();
    this._accounts.set(hexPubkey, account);
    return dbAccount;
  }
}
