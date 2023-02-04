import { Logger } from './Logger';
import { Account } from './Account';
import { RelayManager } from './RelayManager';
import { DbClient } from './DbClient';
import { Relay } from './Relay';
import EventProcessor from './EventProcessor';

export class AccountManager {
  private _db: DbClient;
  private _logger: Logger;
  private _relayManager: RelayManager;
  private _eventProcessor: EventProcessor;
  private _accounts = new Map<string, Account>();

  constructor(opts: {
    db: DbClient;
    logger: Logger;
    relayManager: RelayManager;
    eventProcessor: EventProcessor;
  }) {
    this._db = opts.db;
    this._logger = opts.logger;
    this._relayManager = opts.relayManager;
    this._eventProcessor = opts.eventProcessor;
  }

  // TODO: Remove this
  get db() {
    return this._db;
  }

  // TODO: Remove this
  get relayManager() {
    return this._relayManager;
  }

  get accounts() {
    return this._accounts;
  }

  indexAllAccounts() {
    this._accounts.forEach(account => account.indexAccount());
  }

  async setup() {
    this._logger.log('AccountManager setup');
    // const accts = await this._db.client.account.findMany();
    // accts.forEach(({ id, user_id: userId, pubkey, private_key }: any) => {
    //   const account = new Account({
    //     id,
    //     userId,
    //     db: this._db,
    //     logger: this._logger,
    //     pubkey: pubkey,
    //     privateKey: private_key ? private_key : undefined,
    //     relayManager: this._relayManager,
    //   });
    //   if (this._accounts.has(pubkey)) return;
    //   account.indexAccount();
    //   this._accounts.set(pubkey, account);
    // });
  }

  async addAccount(opts: {
    pubkey: string;
    relays: string[];
    privateKey?: string;
  }) {
    if (opts.privateKey) throw new Error('Not currently supported');
    const pubkey = Account.convertPubkeyToHex(opts.pubkey);
    Promise.all(
      opts.relays.map(
        url =>
          new Promise(async (resolve, reject) => {
            try {
              const relay = new Relay({
                url,
                logger: this._logger,
                eventProcessor: this._eventProcessor,
              });
              // TODO: When the connection is confirmed, internally in Relay,
              // add it to the db and set the id so we can send it to the
              // event processor.
              await relay.connect();
              await relay.subscribeSync({
                filters: [
                  // Get recommended relays
                  { kinds: [2], authors: [pubkey], limit: 1 },
                ],
              });
              await relay.disconnect();
              resolve(relay);
            } catch (e) {
              reject(e);
            }
          })
      )
    )
      .then(() => {
        // Wait until the EventProcessor events queue is empty
        while (true) {
          if (this._eventProcessor.eventQueue.length === 0) break;
        }
        // TODO: Start indexing the account.
        this._logger.log('TODO: Index added account');
      })
      .catch(e => {
        throw new Error(`Failed to add account: ${e}`);
      });
    // 1. Fetch kind 1
    // 2.
  }

  // Add an account, if an account already exists in db we load it
  async oldAddAccount(opts: {
    pubkey: string;
    privateKey?: string;
    relays?: string[];
  }) {
    if (opts.privateKey) throw new Error('Not currently supported');

    // TODO: Do something with the relays if given

    // Ensure pubkey is in hex format
    // const hexPubkey = Account.convertPubkeyToHex(opts.pubkey);
    // let dbAccount: any | null;
    // dbAccount = await this._db.client.account.findUnique({
    //   where: { pubkey: opts.pubkey },
    // });
    // if (!dbAccount) {
    //   dbAccount = await this._db.createAccount({
    //     pubkey: hexPubkey,
    //   });
    // }
    // if (!dbAccount) throw new Error('Failed to create account');
    // const account = new Account({
    //   id: dbAccount.id,
    //   userId: dbAccount.user_id,
    //   db: this._db,
    //   logger: this._logger,
    //   pubkey: hexPubkey,
    //   relayManager: this._relayManager,
    // });
    // if (this._accounts.has(hexPubkey)) return dbAccount;
    // account.indexAccount();
    // this._accounts.set(hexPubkey, account);
    // return dbAccount;
  }
}
